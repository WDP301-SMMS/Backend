import { IMessage } from '@/interfaces/message.interface';
import { Message } from '@/models/message.model';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const getAllMessagesByRoomId = async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  const { roomId } = req.params;

  try {
    const messages = await Message.find({ roomId })
      .populate('senderId receiverId', 'username email role isActive phone dob') // Populate with specific fields
      .select('-__v') // Exclude __v field
      .sort({ createdAt: 1 })
      .limit(50);
    if (!messages || messages.length === 0) {
      res.status(404).json({
        success: false,
        message:
          'No messages found for this room, please check the room ID \n or create a new room if it does not exist',
      });
      return;
    }

    handleSuccessResponse(
      res,
      200,
      'Messages retrieved successfully',
      messages,
    );
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
    return;
  }
};

const getRoomsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({
      success: false,
      error: 'User ID is required',
    });
    return;
  }

  try {
    // Find messages where user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate(
        'senderId receiverId',
        '-password -__v -createdAt -authProvider -updatedAt -googleId -pushTokens',
      )
      .sort({ createdAt: -1 });

    if (!messages || messages.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No messages found for this user',
      });
      return;
    }

    // Extract unique rooms with latest message info
    const roomMap = new Map();
    messages.forEach((message) => {
      const roomId = message.roomId;
      if (!roomMap.has(roomId)) {
        roomMap.set(roomId, {
          roomId: message.roomId,
          senderId: message.senderId,
          receiverId: message.receiverId,
          lastMessage: {
            type: message.type,
            content: message.content,
            createdAt: message.createdAt,
          },
          participants: [message.senderId, message.receiverId],
        });
      }
    });

    const rooms = Array.from(roomMap.values());
    handleSuccessResponse(res, 200, 'Rooms retrieved successfully', rooms);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
    return;
  }
};

const checkRoomExists = async (roomId: string): Promise<boolean> => {
  try {
    const existingMessage = await Message.findOne({ roomId });
    return !!existingMessage;
  } catch (error) {
    console.error(`Error checking room existence: ${(error as Error).message}`);
    return false;
  }
};

const createRoom = async (
  roomId: string,
  senderId: string,
  receiverId: string,
) => {
  try {
    await Message.create({
      roomId,
      senderId,
      receiverId,
      type: 'TEXT',
      content: 'Hi',
    });
  } catch (error) {
    console.error(`Error creating room: ${(error as Error).message}`);
    throw new Error('Failed to create room');
  }
};

const addMessageAfterUserDisconnected = async (body: IMessage[]) => {
  try {
    const newMessage = await Message.insertMany(body);
    console.log(`Messages added after user disconnected: ${newMessage.length}`);
  } catch (error) {
    console.error(
      `Error adding messages after user disconnected: ${(error as Error).message}`,
    );
  }
};

const createOrFindDirectRoom = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  const { participantId } = req.body;
  const currentUserId = req.user?._id;

  if (!currentUserId || !participantId) {
    res.status(400).json({
      success: false,
      error: 'Current user ID and participant ID are required',
    });
    return;
  }

  if (currentUserId === participantId) {
    res.status(400).json({
      success: false,
      error: 'Cannot create a room with yourself',
    });
    return;
  }

  try {
    // Check if a room already exists between these two users (bi-directional)
    const existingRoom = await Message.findOne({
      $or: [
        { senderId: currentUserId, receiverId: participantId },
        { senderId: participantId, receiverId: currentUserId },
      ],
    }).populate('senderId receiverId');

    if (existingRoom) {
      // Room already exists, return it
      handleSuccessResponse(res, 200, 'Room already exists', {
        roomId: existingRoom.roomId,
        isNew: false,
        room: existingRoom,
      });
      return;
    }

    // Generate room ID using the utility function
    const { getPrivateRoom } = await import('@/utils/room');
    const roomId = getPrivateRoom(currentUserId, participantId);

    // Create a new room with an initial message
    const newMessage = await Message.create({
      roomId,
      senderId: currentUserId,
      receiverId: participantId,
      type: 'TEXT',
      content: 'Chào bạn nhé!',
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'senderId receiverId',
    );

    handleSuccessResponse(res, 201, 'Room created successfully', {
      roomId,
      isNew: true,
      room: populatedMessage,
    });
  } catch (error) {
    console.error('Error creating/finding room:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
    return;
  }
};

const getAvailableUsersForChat = async (req: Request, res: Response) => {
  const currentUserId = req.user?._id;
  const currentUserRole = req.user?.role;

  if (!currentUserId || !currentUserRole) {
    return res.status(400).json({
      success: false,
      error: 'Current user ID and role are required',
    });
  }

  try {
    const { UserModel } = await import('@/models/user.model');

    // Get all users that the current user already has messages with
    const existingMessages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    });

    const existingChatUserIds = new Set<string>();
    const currentUserIdStr = currentUserId.toString();

    existingMessages.forEach((message) => {
      const senderIdStr = message.senderId.toString();
      const receiverIdStr = message.receiverId.toString();

      if (senderIdStr !== currentUserIdStr) {
        existingChatUserIds.add(senderIdStr);
      }
      if (receiverIdStr !== currentUserIdStr) {
        existingChatUserIds.add(receiverIdStr);
      }
    });

    // Determine target role to search for
    let targetRole: string | undefined;

    if (currentUserRole === 'Parent') {
      targetRole = 'Nurse';
    } else if (currentUserRole === 'Nurse') {
      targetRole = 'Parent';
    }

    if (!targetRole) {
      return res.status(403).json({
        success: false,
        error: 'Role not permitted to fetch chat users',
      });
    }

    const availableUsers = await UserModel.find({
      _id: {
        $ne: currentUserId,
        $nin: Array.from(existingChatUserIds),
      },
      isActive: true,
      role: targetRole,
    }).select('_id username email role');

    handleSuccessResponse(
      res,
      200,
      'Available users retrieved successfully',
      availableUsers,
    );
  } catch (error) {
    console.error('Error getting available users:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

export {
  getAllMessagesByRoomId,
  getRoomsByUserId,
  addMessageAfterUserDisconnected,
  createRoom,
  checkRoomExists,
  createOrFindDirectRoom,
  getAvailableUsersForChat,
};
