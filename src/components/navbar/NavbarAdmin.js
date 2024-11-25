// src/components/navbar/AdminNavbar.js

import { Box, Flex, Image, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import AdminNavbarLinks from './NavbarLinksAdmin';
import UserProfileMenu from './UserProfileMenu';
import { io } from 'socket.io-client'; // Importa o io do socket.io-client

// Importa a logo
import LogoWeTruck from '../../assets/images/logotruckpreto.png';

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]); // Estado para notificações
  const [socketConnected, setSocketConnected] = useState(false); // Estado para status do socket
  const toast = useToast(); // Hook do Chakra para toast notifications

  useEffect(() => {
    const socket = io('http://etc.wetruckhub.com/orders/socket', {
      query: { userId: 16 }, // Substitua 'variavel/ variavel do id' pelo ID dinâmico do usuário, se disponível
    });

    // Evento de conexão
    socket.on('connect', () => {
      console.log('Conectado ao servidor!');
      setSocketConnected(true); // Atualiza o status da conexão
      socket.emit('message', 'Olá, servidor!');
    });

    // Evento para receber novas ordens
    socket.on('new_order', (data) => {
      console.log('Nova ordem recebida:', data);
      setNotifications((prev) => [...prev, data]);

      // Exibir uma notificação toast
      toast({
        title: 'Nova Ordem',
        description: `Você recebeu uma nova ordem de ${data.userName || 'um cliente'}.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
      console.log('Desconectado do servidor!');
      setSocketConnected(false); // Atualiza o status da conexão
    });

    // Limpeza ao desmontar o componente
    return () => {
      socket.disconnect();
    };
  }, [toast]); // Dependência de 'toast' para evitar avisos do ESLint

  useEffect(() => {
    window.addEventListener('scroll', changeNavbar);
    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  }, []);

  const { secondary, message } = props;

  const navbarPosition = 'fixed';
  const navbarHeight = '80px';

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  // Efeito de blur na navbar
  const navbarBg = scrolled
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(255, 255, 255, 0.6)';
  const backdropFilter = scrolled ? 'blur(10px)' : 'none';

  return (
    <Box
      position={navbarPosition}
      top="0"
      left="0"
      width="100%"
      height={navbarHeight}
      bg={navbarBg}
      zIndex="1000"
      boxShadow="sm"
      backdropFilter={backdropFilter}
      transition="all 0.3s ease"
    >
      <Flex
        w="100%"
        h="100%"
        alignItems="center"
        justifyContent="space-between"
        px={{ base: '10px', md: '30px' }}
        flexDirection="row"
        position="relative"
      >
        {/* Logo da marca */}
        <Image
          src={LogoWeTruck}
          alt="WeTruck Logo"
          height={{ base: '40px', md: '60px' }}
          mr="20px" // Define um gap maior à direita da logo
        />

        {/* Foto de perfil para dispositivos móveis, ajustada */}
        <Flex
          position="absolute"
          left="50%"
          transform="translateX(-40%)" // Ajusta a posição para mais à direita
          display={{ base: 'flex', md: 'none' }}
          alignItems="center"
          mt={{ base: '5px', md: '0' }}
          ml="15px" // Adiciona um espaçamento à esquerda
        >
          <UserProfileMenu userName="Matheus" />
        </Flex>

        {/* Layout responsivo da foto de perfil para desktop */}
        <Flex alignItems="center" display={{ base: 'none', md: 'flex' }} ml="20px">
          <UserProfileMenu userName="Matheus" />
        </Flex>

        {/* Links da Navbar, posicionados à direita */}
        <Flex
          ml="auto"
          alignItems="center"
          gap={{ base: '10px', md: '20px' }}
          flexDirection="row"
        >
          <AdminNavbarLinks
            onOpen={props.onOpen}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
            notifications={notifications} // Passa as notificações como props
            socketConnected={socketConnected} // Passa o status da conexão como props
          />
        </Flex>
      </Flex>

      {secondary ? <Box color="white" mt="4">{message}</Box> : null}
    </Box>
  );
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
};
