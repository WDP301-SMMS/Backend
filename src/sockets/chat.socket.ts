import { addMessageAfterUserDisconnected } from '@/controllers/message/message.controller';
import {
  IMessage,
  MessageType,
  IFileData,
} from '@/interfaces/message.interface';
import { uploadToFirebase } from '@/services/upload.service';
import { getPrivateRoom } from '@/utils/room';
import { Socket } from 'socket.io';

// Helper function to convert file data to Multer file format
const createMulterFileFromData = (fileData: IFileData): Express.Multer.File => {
  const buffer = Buffer.from(fileData.data, 'base64');
  return {
    fieldname: 'file',
    originalname: fileData.filename,
    encoding: '7bit',
    mimetype: fileData.mimetype,
    buffer: buffer,
    size: buffer.length,
  } as Express.Multer.File;
};

import { Server } from 'socket.io';

export const handleSocketConnection = (socket: Socket, io: Server) => {
  let messages: IMessage[] = [];
  let messageInterval: NodeJS.Timeout | null = null;
  console.log(`Socket connected: ${socket.id}`);

  socket.on('joinRoom', (data: string) => {
    try {
      socket.join(data);
      console.log(`Socket ${socket.id} joined room: ${data}`);

      // Confirm room join to client
      socket.emit('roomJoined', {
        data,
        message: 'Successfully joined room',
      });
    } catch (error) {
      console.error(`Error joining room for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('sendMessage', async (data: IMessage) => {
    console.log(`Socket ${socket.id} sending message:`, data);
    try {
      // Validate message data
      if (!data.roomId || !data.senderId || !data.receiverId || !data.content) {
        socket.emit('error', {
          message:
            'Invalid message data. roomId, senderId, receiverId, and content are required',
        });
        return;
      }

      if (data.type === MessageType.IMAGE || data.type === MessageType.FILE) {
        try {
          if (typeof data.content === 'string') {
            socket.emit('error', {
              message:
                'Invalid file data. Expected file object with data, filename, and mimetype',
            });
            return;
          }

          const fileData = data.content as IFileData;
          if (!fileData.data || !fileData.filename || !fileData.mimetype) {
            socket.emit('error', {
              message:
                'Invalid file data. Missing required fields: data, filename, or mimetype',
            });
            return;
          }

          const multerFile = createMulterFileFromData(fileData);
          const url = await uploadToFirebase(multerFile);
          data.content = url;
        } catch (error) {
          console.error('Error uploading file:', error);
          socket.emit('error', { message: 'Failed to upload file' });
          return;
        }
      }

      const messageData = {
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        type: data.type || MessageType.TEXT,
        content: data.content,
        createdAt: new Date(),
      };

      messages.push(messageData as IMessage);

      // Emit to the specific room
      io.to(data.roomId).emit('receiveMessage', messageData);

      // Confirm message sent to sender
      socket.emit('messageSent', {
        success: true,
        message: 'Message sent successfully',
        data: messageData,
      });

      console.log(
        `Message sent in room ${data.roomId} by ${data.senderId._id}`,
      );
    } catch (error) {
      console.error(`Error sending message for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      // Clear the interval to prevent memory leaks
      if (messageInterval) {
        clearInterval(messageInterval);
        messageInterval = null;
      }

      if (messages.length > 0) {
        await addMessageAfterUserDisconnected(messages);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    } catch (error) {
      console.error(
        `Error handling disconnect for socket ${socket.id}:`,
        error,
      );
    }
  });

  messageInterval = setInterval(async () => {
    try {
      if (messages.length >= 1) {
        await addMessageAfterUserDisconnected([...messages]);
        messages = [];
      }
    } catch (error) {
      console.error(`Error saving messages for socket ${socket.id}:`, error);
    }
  }, 10000);

  // Handle socket errors
  socket.on('error', (error: Error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
};
