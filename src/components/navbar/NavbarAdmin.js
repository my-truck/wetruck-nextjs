// src/components/navbar/AdminNavbar.js

import { Box, Flex, Image, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  // Obter o token e o nome do usuário a partir do token
  const token = localStorage.getItem('authToken');
  let userName = '';
  if (token) {
    const decoded = decodeJWT(token);
    userName = decoded
      ? decoded.full_name || decoded.userName || decoded.name || ''
      : '';
  }

  // Conexão via socket e validações
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!token || !userId) {
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
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded?.exp < currentTime) {
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

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
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

    const socket = io('https://etc.wetruckhub.com/orders/socket', {
      auth: { token },
      query: { userId: parsedUserId },
      transports: ['websocket'],
      secure: true,
    });

    socket.on('connect', () => setSocketConnected(true));

    socket.on('new_order', (data) => {
      const notification = {
        ...data,
        id: data.orderId,
        name: data.name || data.userName,
      };
      setNotifications((prev) => [...prev, notification]);
      toast({
        title: 'Nova Ordem',
        description: `Você recebeu uma nova ordem de ${
          notification.name || 'um Motorista'
        }.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    });

    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('connect_error', (err) => {
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
  }, [toast, token]);

  // Busca notificações iniciais
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/work/get-notifications');
        if (response.data?.data) {
          const formatted = response.data.data.map((notif) => ({
            ...notif,
            id: notif.orderId,
            name: notif.userName || notif.name,
          }));
          setNotifications(formatted);
        }
      } catch (error) {
        toast({
          title: 'Erro ao Carregar Notificações',
          description: 'Não foi possível carregar as notificações.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchNotifications();
  }, [toast]);

  // Controla o scroll
  useEffect(() => {
    const changeNavbar = () => setScrolled(window.scrollY > 1);
    window.addEventListener('scroll', changeNavbar);
    return () => window.removeEventListener('scroll', changeNavbar);
  }, []);

  // Estilos do Navbar
  const navbarPosition = 'fixed';
  const navbarHeight = '80px';
  const navbarBg = scrolled
    ? 'rgba(255, 255, 255, 0.85)'
    : 'rgba(255, 255, 255, 0.65)';
  const backdropFilter = scrolled ? 'blur(4px)' : 'none';

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
        align="center"
        px={{ base: '16px', md: '40px' }}
        justify="space-between"
      >
        {/* Logo + Perfil (lado esquerdo) */}
        <Flex align="center" gap={{ base: '12px', md: '16px' }}>
          <Link to="/admin/default">
            <Image
              src={LogoWeTruck}
              alt="WeTruck Logo"
              height={{ base: '40px', md: '60px' }}
              cursor="pointer"
            />
          </Link>
          {/* Menu de Perfil do Usuário após a logo */}
          <UserProfileMenu userName={userName || 'Usuário'} />
        </Flex>

        {/* Admin Links (Chat, Notificações) no lado direito */}
        <AdminNavbarLinks
          onOpen={props.onOpen}
          secondary={props.secondary}
          fixed={props.fixed}
          scrolled={scrolled}
          notifications={notifications}
          socketConnected={socketConnected}
          setNotifications={setNotifications}
        />
      </Flex>
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
