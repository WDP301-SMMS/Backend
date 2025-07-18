import { addMessageAfterUserDisconnected } from '@/controllers/message/message.controller';
import { IMessage, MessageType } from '@/interfaces/message.interface';
import { uploadToFirebase } from '@/services/upload.service';
import { getPrivateRoom } from '@/utils/room';
import { Socket } from 'socket.io';

export const handleSocketConnection = (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);
  let messages: IMessage[] = [];

  socket.on('joinRoom', (data) => {
    try {
      if (!data.senderId || !data.receiverId) {
        socket.emit('error', {
          message: 'Sender ID and Receiver ID are required to join room',
        });
        return;
      }

      const roomId = getPrivateRoom(data.senderId, data.receiverId);
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);

      // Confirm room join to client
      socket.emit('roomJoined', {
        roomId,
        message: 'Successfully joined room',
      });
    } catch (error) {
      console.error(`Error joining room for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      // Validate message data
      if (!data.roomId || !data.senderId || !data.receiverId || !data.content) {
        socket.emit('error', {
          message:
            'Invalid message data. roomId, senderId, receiverId, and content are required',
        });
        return;
      }

      if (data.type === MessageType.IMAGE) {
        try {
          const url = await uploadToFirebase(data.content);
          data.content = url;
        } catch (error) {
          console.error('Error uploading image:', error);
          socket.emit('error', { message: 'Failed to upload image' });
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
      socket.to(data.roomId).emit('receiveMessage', {
        roomId: messageData.roomId,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        type: messageData.type,
        content: messageData.content,
        createdAt: messageData.createdAt,
      });

      // Confirm message sent to sender
      socket.emit('messageSent', {
        success: true,
        message: 'Message sent successfully',
        data: messageData,
      });

      console.log(`Message sent in room ${data.roomId} by ${data.senderId}`);
    } catch (error) {
      console.error(`Error sending message for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', async () => {
    try {
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

  // Save messages every 10 seconds or when reaching 50 messages
  setInterval(async () => {
    try {
      if (messages.length >= 50) {
        await addMessageAfterUserDisconnected([...messages]);
        messages = [];
      }
    } catch (error) {
      console.error(`Error saving messages for socket ${socket.id}:`, error);
    }
  }, 10000);

  // Handle socket errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
};
