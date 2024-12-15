// src/components/navbar/AdminNavbar.js

import { Box, Flex, Image, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import AdminNavbarLinks from './NavbarLinksAdmin';
import UserProfileMenu from './UserProfileMenu';
import { io } from 'socket.io-client';
import axiosInstance from '../../axiosInstance';
import LogoWeTruck from '../../assets/images/logotruckpreto.png';

function decodeJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    console.error('Token inválido:', e);
    return null;
  }
}

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const toast = useToast();

  // Efeito responsável por validação do token e conexão com socket
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      console.error('Token ou user_id não encontrado!');
      toast({
        title: 'Erro de Autenticação',
        description: 'Por favor, faça login novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      window.location.href = '/login';
      return;
    }

    const decoded = decodeJWT(token);
    if (decoded) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.error('Token expirado!');
        toast({
          title: 'Sessão Expirada',
          description: 'Por favor, faça login novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        window.location.href = '/login';
        return;
      }
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.error('user_id inválido!');
      toast({
        title: 'Erro de Usuário',
        description: 'Identificador do usuário não é válido. Por favor, faça login novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      window.location.href = '/login';
      return;
    }

    // Estabelecendo conexão com o WebSocket
    console.log('Estabelecendo conexão com o WebSocket...');
    const socket = io('https://etc.wetruckhub.com/orders/socket', {
      auth: { token: token },
      query: { userId: parsedUserId },
      transports: ['websocket'],
      secure: true,
    });

    socket.on('connect', () => {
      console.log('Conectado ao servidor!');
      setSocketConnected(true);
      socket.emit('message', 'Olá, servidor!');
    });

    socket.on('new_order', (data) => {
      console.log('Nova ordem recebida:', data);
      // Mapear 'orderId' para 'id' e 'userName' para 'name'
      const notification = {
        ...data,
        id: data.orderId, // Mapeamento correto
        name: data.name || data.userName,
      };
      setNotifications((prev) => [...prev, notification]);

      toast({
        title: 'Nova Ordem',
        description: `Você recebeu uma nova ordem de ${notification.name || 'um Motorista'}.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    });

    // Listener para 'accept_order'
    socket.on('accept_order', (data) => {
      console.log('Pedido aceito:', data);
      const { orderId, clientName } = data; // Ajuste conforme o payload recebido

      // Atualizar o estado das notificações removendo a que foi aceita
      setNotifications((prev) => prev.filter((notification) => notification.id !== orderId));

      toast({
        title: 'Pedido Aceito',
        description: `O pedido de ${clientName || 'um cliente'} foi aceito.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    });

    socket.on('disconnect', () => {
      console.log('Desconectado do servidor!');
      setSocketConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Erro de conexão:', err.message);
      setSocketConnected(false);
      toast({
        title: 'Erro de Conexão',
        description: `Não foi possível conectar ao servidor: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  // Efeito para buscar notificações ao carregar a página
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/work/get-notifications');
        console.log('Resposta do backend:', response.data);

        if (response.data && Array.isArray(response.data.data)) {
          const formattedNotifications = response.data.data.map((notif) => ({
            ...notif,
            id: notif.orderId, // Mapeamento correto
            name: notif.userName || notif.name,
          }));
          setNotifications(formattedNotifications);
          console.log('Notificações carregadas:', formattedNotifications);
        } else {
          console.warn('Formato de resposta inesperado:', response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        toast({
          title: 'Erro ao carregar notificações',
          description: 'Não foi possível carregar as notificações. Tente novamente mais tarde.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchNotifications();
  }, [toast]);

  // Efeito para mudar a navbar ao scroll
  useEffect(() => {
    const changeNavbar = () => {
      if (window.scrollY > 1) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', changeNavbar);
    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  }, []);

  const { secondary, message } = props;

  const navbarPosition = 'fixed';
  const navbarHeight = '80px';
  const navbarBg = scrolled
    ? 'rgba(255, 255, 255, 0.85)' // Reduzido o nível de opacidade para menor desfoque
    : 'rgba(255, 255, 255, 0.65)';
  const backdropFilter = scrolled ? 'blur(4px)' : 'none'; // Reduzido o desfoque

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
        px={{ base: '16px', md: '40px' }}
        flexDirection="row"
        position="relative"
      >
        {/* Logo da marca */}
        <Image
          src={LogoWeTruck}
          alt="WeTruck Logo"
          height={{ base: '40px', md: '60px' }}
          mr="24px"
        />

        {/* Foto de perfil para dispositivos móveis */}
        <Flex
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          display={{ base: 'flex', md: 'none' }}
          alignItems="center"
          mt={{ base: '0px', md: '0' }}
          ml="0px"
        >
          <UserProfileMenu userName="Matheus" />
        </Flex>

        {/* Foto de perfil para desktop */}
        <Flex alignItems="center" display={{ base: 'none', md: 'flex' }} ml="24px">
          <UserProfileMenu userName="Matheus" />
        </Flex>

        {/* Links da Navbar */}
        <Flex
          ml="auto"
          alignItems="center"
          gap={{ base: '24px', md: '32px' }}
          flexDirection="row"
        >
          <AdminNavbarLinks
            onOpen={props.onOpen}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
            notifications={notifications}
            socketConnected={socketConnected}
            setNotifications={setNotifications} // Passando a função para atualizar notificações
          />
        </Flex>
      </Flex>

      {secondary && (
        <Box color="gray.600" mt="4" textAlign="center">
          {message}
        </Box>
      )}
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
