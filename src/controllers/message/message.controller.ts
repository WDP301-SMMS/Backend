import { IMessage } from '@/interfaces/message.interface';
import Message from '@/models/message.model';
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
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(50);
    if (!messages || messages.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No messages found for this room',
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
    const messages = await Message.find({ userId }).sort({ createdAt: -1 });
    if (!messages || messages.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No messages found for this user',
      });
      return;
    }

    const rooms = messages.map((message) => message.roomId);
    handleSuccessResponse(
      res,
      200,
      'Rooms retrieved successfully',
      Array.from(new Set(rooms)),
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

export {
  getAllMessagesByRoomId,
  getRoomsByUserId,
  addMessageAfterUserDisconnected,
};
