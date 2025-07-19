import { handleSocketConnection } from '@/sockets/chat.socket';
import { Server as httpServer } from 'http';
import { Server, Socket } from 'socket.io';

export const setupSocket = (httpServer: httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    handleSocketConnection(socket, io);
  });
};
