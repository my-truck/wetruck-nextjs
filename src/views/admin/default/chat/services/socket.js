// src/services/socket.js
import { io } from 'socket.io-client';

let socket;

export const connectSocket = (userId) => {
  socket = io('https://etc.wetruckhub.com', {
    query: { userId },
  });

  socket.on('connect', () => {
    console.log('Conectado ao socket:', socket.id);
  });

  // Escuta mensagens vindas do backend
  socket.on('message', (msg) => {
    console.log('Nova mensagem recebida via socket:', msg);
    // Atualize seu estado local, Redux, ou Context, etc.
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
