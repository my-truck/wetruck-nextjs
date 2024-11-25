// src/contexts/SocketContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '@chakra-ui/react'; // Adicione esta linha

// Criação do contexto
const SocketContext = createContext();

// Hook para consumir o contexto
export const useSocket = () => {
  return useContext(SocketContext);
};

// Provider do contexto
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const toast = useToast(); // Hook do Chakra para toasts

  useEffect(() => {
    // Recupera o token de autenticação e user_id do localStorage
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');

    console.log('SocketProvider: Recuperando Token e User ID do localStorage:');
    console.log('authToken:', token);
    console.log('user_id:', userId);

    if (!token || !userId) {
      console.error('SocketProvider: Token de autenticação ou user_id não encontrado!');
      return;
    }

    // Converter user_id para número se necessário
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.error('SocketProvider: user_id armazenado não é um número válido!');
      return;
    }

    // Estabelece a conexão com o WebSocket
    console.log('SocketProvider: Estabelecendo conexão com o WebSocket...');
    const newSocket = io('http://etc.wetruckhub.com/orders/socket', {
      auth: {
        token: token, // Envia o token no campo 'auth'
      },
      query: { user_id: parsedUserId }, // Envia o user_id via query string como número
      transports: ['websocket'], // Força a utilização do WebSocket
      secure: true, // Se estiver usando HTTPS no backend
    });

    // Define eventos do socket
    newSocket.on('connect', () => {
      console.log('SocketProvider: Conectado ao servidor!');
      setSocketConnected(true);
      newSocket.emit('message', 'Olá, servidor!');
    });

    newSocket.on('new_order', (data) => {
      console.log('SocketProvider: Nova ordem recebida:', data);
      // Aqui, você pode implementar uma lógica para atualizar o estado global ou emitir eventos
      toast({
        title: 'Nova Ordem',
        description: `Você recebeu uma nova ordem de ${data.userName || 'um cliente'}.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('SocketProvider: Desconectado do servidor!');
      setSocketConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('SocketProvider: Erro de conexão:', err.message);
      setSocketConnected(false);
    });

    setSocket(newSocket);

    // Limpeza ao desmontar o provider
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('SocketProvider: Socket desconectado na limpeza.');
      }
    };
  }, [toast]);

  return (
    <SocketContext.Provider value={{ socket, socketConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
