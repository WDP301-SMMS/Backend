import { addMessageAfterUserDisconnected } from '@/controllers/message/message.controller';
import { IMessage } from '@/interfaces/message.interface';
import { getPrivateRoom } from '@/utils/room';
import { Socket } from 'socket.io';

export const handleSocketConnection = (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);
  let messages: IMessage[] = [];

  socket.on('joinRoom', (data) => {
    try {
      if (!data.senderId || !data.receiverId) {
        socket.emit('error', { message: 'Sender ID and Receiver ID are required to join room' });
        return;
      }
      
      const roomId = getPrivateRoom(data.senderId, data.receiverId);
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
      
      // Confirm room join to client
      socket.emit('roomJoined', { roomId, message: 'Successfully joined room' });
    } catch (error) {
      console.error(`Error joining room for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('sendMessage', (data) => {
    try {
      // Validate message data
      if (!data.roomId || !data.senderId || !data.receiverId || !data.content) {
        socket.emit('error', { message: 'Invalid message data. roomId, senderId, receiverId, and content are required' });
        return;
      }

      const messageData = {
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        type: data.type || 'text',
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
        data: messageData 
      });

      console.log(`Message sent in room ${data.roomId} by ${data.senderId}`);
    } catch (error) {
      console.error(`Error sending message for socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    try {
      if (messages.length > 0) {
        addMessageAfterUserDisconnected(messages);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    } catch (error) {
      console.error(`Error handling disconnect for socket ${socket.id}:`, error);
    }
  });

  // Handle socket errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
};
