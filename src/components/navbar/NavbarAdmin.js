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

  useEffect(() => {
    const token = localStorage.getItem('authToken');
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
        description: `Você recebeu uma nova ordem de ${notification.name || 'um Motorista'}.`,
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
  }, [toast]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/work/get-notifications');
        if (response.data?.data) {
          const formattedNotifications = response.data.data.map((notif) => ({
            ...notif,
            id: notif.orderId,
            name: notif.userName || notif.name,
          }));
          setNotifications(formattedNotifications);
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

  useEffect(() => {
    const changeNavbar = () => setScrolled(window.scrollY > 1);
    window.addEventListener('scroll', changeNavbar);
    return () => window.removeEventListener('scroll', changeNavbar);
  }, []);

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
        alignItems="center"
        justifyContent="space-between"
        px={{ base: '16px', md: '40px' }}
      >
        {/* Logo da Marca com Link */}
        <Link to="/admin/default">
          <Image
            src={LogoWeTruck}
            alt="WeTruck Logo"
            height={{ base: '40px', md: '60px' }}
            mr="24px"
            cursor="pointer"
          />
        </Link>

        {/* Menu de Perfil (Mobile e Desktop) */}
        <Flex
          alignItems="center"
          justifyContent="center"
          ml={{ base: '0px', md: '24px' }}
          mt={{ base: '8px', md: '0' }}
        >
          <UserProfileMenu userName="Matheus" />
        </Flex>

        <Flex
          ml="auto"
          alignItems="center"
          gap={{ base: '24px', md: '32px' }}
        >
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
