// src/components/navbar/AdminNavbar.js

import { Box, Flex, Image, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import AdminNavbarLinks from './NavbarLinksAdmin';
import UserProfileMenu from './UserProfileMenu';
import { io } from 'socket.io-client'; // Importa o io do socket.io-client
import axiosInstance from '../../axiosInstance'; // Importa a instância personalizada do Axios

// Importa a logo
import LogoWeTruck from '../../assets/images/logotruckpreto.png';

// Função para decodificar o token JWT (opcional, para verificação adicional)
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
  const [notifications, setNotifications] = useState([]); // Estado para notificações
  const toast = useToast(); // Hook do Chakra para toast notifications

  useEffect(() => {
    // Recupera o token de autenticação e user_id do localStorage
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');

    console.log('Recuperando Token e User ID do localStorage:');
    console.log('authToken:', token);
    console.log('user_id:', userId);

    // Verifique se o token e user_id existem
    if (!token || !userId) {
      console.error('Token de autenticação ou user_id não encontrado!');
      toast({
        title: 'Erro de Autenticação',
        description: 'Token de autenticação ou user_id não encontrado. Por favor, faça login novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Redirecionar para a página de login
      window.location.href = '/login';
      return;
    }

    const decoded = decodeJWT(token);
    if (decoded) {
      const currentTime = Math.floor(Date.now() / 1000); // Tempo atual em segundos
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

    // Converter user_id para número, se necessário
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.error('user_id armazenado não é um número válido!');
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

 
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/work/get-notifications' 
          
        );

        if (response.data && Array.isArray(response.data.notifications)) {
          setNotifications(response.data.notifications);
          console.log('Notificações persistidas carregadas:', response.data.notifications);
        } else {
          console.warn('Formato de resposta inesperado:', response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações persistidas:', error);
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

    console.log('Estabelecendo conexão com o WebSocket...');
    const socket = io('https://etc.wetruckhub.com/orders/socket', {
      auth: {
        token: token, // Envia o token no campo 'ath'
      },
      query: { userId: parsedUserId }, // Envia o user_id via query string com a chave correta 'userId'
      transports: ['websocket'], // Força a utilização do WebSocket
      secure: true, // Se estiver usando HTTPS no backend
    });

    // Evento de conexão
    socket.on('connect', () => {
      console.log('Conectado ao servidor!');
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
    });

    // Evento de erro
    socket.on('connect_error', (err) => {
      console.error('Erro de conexão:', err.message);
      toast({
        title: 'Erro de Conexão',
        description: `Não foi possível conectar ao servidor: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
            // socketConnected={socketConnected} // Removido
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
