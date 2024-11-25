// src/components/SomeComponent.js

import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

const SomeComponent = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSomeEvent = (data) => {
      console.log('SomeComponent: Evento recebido:', data);
      // Implementar lógica adicional conforme necessário
    };

    socket.on('some_event', handleSomeEvent);

    return () => {
      socket.off('some_event', handleSomeEvent);
    };
  }, [socket]);

  return (
    <div>
      {/* Seu componente */}
    </div>
  );
};

export default SomeComponent;
