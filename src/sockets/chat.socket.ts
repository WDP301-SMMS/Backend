import {
  addMessageAfterUserDisconnected,
  createRoom,
  checkRoomExists,
} from '@/controllers/message/message.controller';
import { IMessage, MessageType } from '@/interfaces/message.interface';
import { getPrivateRoom } from '@/utils/room';
import { Socket } from 'socket.io';

import { Server } from 'socket.io';

export const handleSocketConnection = (socket: Socket, io: Server) => {
  let messages: IMessage[] = [];
  let messageInterval: NodeJS.Timeout | null = null;
  console.log(`Socket connected: ${socket.id}`);

  socket.on('joinRoom', async (senderId: string, receiverId: string) => {
    try {
      const roomId = getPrivateRoom(senderId, receiverId);
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);

      // Check if room exists
      const roomExists = await checkRoomExists(roomId);

      if (!roomExists) {
        // Create room if it doesn't exist
        await createRoom(roomId, senderId, receiverId);
        console.log(`Created new room: ${roomId}`);
      } else {
        console.log(`Room already exists: ${roomId}`);
      }

      // Confirm room join to client
      socket.emit('roomJoined', {
        data: { roomId, roomExists },
        message: 'Successfully joined room',
      });
    } catch (error) {
      console.error(`Error joining room for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('sendMessage', (data: IMessage) => {
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

      const messageData = {
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        type: data.type || MessageType.TEXT,
        content: data.content,
        createdAt: new Date(),
      };

      messages.push(messageData as IMessage);
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

  socket.on('leaveRoom', async () => {
    try {
      if (messages.length > 0) {
        await addMessageAfterUserDisconnected(messages);
        messages = [];
      }
    } catch (error) {
      console.error(`Error leaving room for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to leave room' });
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
        messages = [];
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

  // Handle socket typing
  socket.on('typing', ({ roomId, senderId }) => {
    socket.to(roomId).emit('typing', { senderId });
  });

  socket.on('stopTyping', ({ roomId, senderId }) => {
    socket.to(roomId).emit('stopTyping', { senderId });
  });
};
