// src/views/admin/default/chat/components/ActiveChats.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Text,
  Flex,
  Heading,
  Spinner,
  useToast,
  Badge,
  Icon,
  useColorModeValue,
  Avatar,
  VStack
} from '@chakra-ui/react';
import { 
  FaComment, 
  FaCheckCircle, 
  FaFlagCheckered, 
  FaExclamationTriangle,
  FaTruck,
  FaLock,
  FaEye
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { startRoom } from '../services/chatService';
import { motion } from 'framer-motion';

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Tema personalizado
const theme = {
  primary: '#FF6B00',    
  secondary: '#FF8C38',  
  accent: '#FFB273',     
  dark: '#E85D00',       
  background: '#FFF8F2', 
  text: '#3D3D3D',       
  finalized: '#9747FF',  
  finalizedLight: '#F5E6FF',
  cardBg: '#FFFFFF',     
  shadow: '0 4px 6px rgba(255, 107, 0, 0.1)'
};

// Animações
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  hover: {
    scale: 1.01,
    boxShadow: '0 8px 15px rgba(255, 107, 0, 0.15)',
    transition: { duration: 0.3 },
  },
};

function ActiveChats() {
  const [activeChats, setActiveChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Ajusta cores conforme o modo de cor
  const cardBg = useColorModeValue(theme.cardBg, 'gray.700');
  const borderColor = useColorModeValue(theme.accent, 'gray.600');

  // 1) Envolvemos fetchActiveChats em useCallback
  const fetchActiveChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token não encontrado no localStorage');
      }

      const response = await axios.get('https://etc.wetruckhub.com/messages/active-chats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActiveChats(response.data);
    } catch (error) {
      console.error('Erro ao buscar conversas ativas:', error);
      toast({
        title: 'Erro ao carregar conversas',
        description: 'Não foi possível obter as conversas do servidor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 2) Chamamos fetchActiveChats dentro de useEffect, incluindo como dependência
  useEffect(() => {
    fetchActiveChats();
  }, [fetchActiveChats]);

  const handleOpenChat = async (workId, isFinalized) => {
    if (isFinalized) {
      toast({
        title: 'Corrida finalizada',
        description: 'Não é possível abrir conversas de corridas já finalizadas.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
    try {
      localStorage.setItem('freightId', workId.toString());
      const room = await startRoom(workId);
      localStorage.setItem('roomId', room.id);
      navigate(`/admin/chat/${workId}`);
    } catch (error) {
      console.error('Erro ao abrir conversa:', error);
      toast({
        title: 'Erro ao abrir conversa',
        description: 'Não foi possível abrir a sala de chat.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Corrida Confirmada',
          icon: FaCheckCircle,
          color: theme.primary,
          bg: '#FFF0E6',
          avatarBg: theme.primary,
        };
      case 'completed':
        return {
          label: 'Corrida Finalizada',
          icon: FaFlagCheckered,
          color: theme.finalized,
          bg: theme.finalizedLight,
          isFinalized: true,
          avatarBg: theme.finalized,
        };
      default:
        return {
          label: status || 'Status não disponível',
          icon: FaExclamationTriangle,
          color: 'gray.500',
          bg: 'gray.100',
          avatarBg: 'gray.500',
        };
    }
  };

  const renderEmptyState = () => (
    <MotionFlex
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      direction="column"
      align="center"
      justify="center"
      p={6}
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={theme.shadow}
      my={4}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <Icon as={FaComment} w={10} h={10} color={theme.accent} mb={3} />
      </motion.div>
      <Text color={theme.text} fontSize="lg" fontWeight="medium" textAlign="center">
        Nenhuma conversa iniciada até o momento.
      </Text>
      <Text color={theme.text} fontSize="sm" textAlign="center" mt={2} opacity={0.8}>
        As conversas iniciadas com motoristas aparecerão aqui.
      </Text>
    </MotionFlex>
  );

  const renderChatCard = (chat) => {
    const { id, work } = chat;
    const workName = work?.name || 'Trabalho sem nome';
    const driverId = work?.driver?.id || 'ID não disponível';
    const driverName = work?.driver?.name || 'Motorista';
    const statusInfo = getStatusInfo(work?.status);
    const isFinalized = statusInfo.isFinalized;
    const vehicleDescription = work?.description || 'Sem descrição do veículo';
    const hasUnread = !isFinalized && Math.random() > 0.5;

    return (
      <MotionBox
        key={id}
        variants={itemVariants}
        whileHover={!isFinalized ? 'hover' : {}}
        layout
        bg={cardBg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow={theme.shadow}
        overflow="hidden"
        mb={3}
        position="relative"
        cursor={isFinalized ? 'default' : 'pointer'}
        onClick={() => !isFinalized && handleOpenChat(work.id, isFinalized)}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="4px"
          bg={statusInfo.color}
        />

        <Flex p={4} width="100%">
          <Flex mr={3} position="relative">
            <Avatar
              size="md"
              name={driverName}
              bg={statusInfo.avatarBg}
              icon={<Icon as={FaTruck} color="white" />}
            />
            {hasUnread && (
              <Box
                position="absolute"
                bottom="0"
                right="0"
                borderRadius="full"
                bg="green.400"
                w="12px"
                h="12px"
                border="2px solid white"
              />
            )}
          </Flex>

          <Box flex="1">
            <Flex justify="space-between" align="center" mb={1}>
              <Flex align="center">
                <Text fontWeight="bold" fontSize="md" mr={2}>
                  {driverName}
                </Text>
                <Badge
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={statusInfo.bg}
                  color={statusInfo.color}
                  fontSize="xs"
                >
                  {statusInfo.label}
                </Badge>
              </Flex>
              {/* Removido horário para evitar aperto no mobile */}
            </Flex>

            <Text fontWeight="medium" fontSize="sm" mb={1} color={theme.dark}>
              {workName}
            </Text>

            <Flex justify="space-between" align="center">
              <Text
                fontSize="sm"
                color={hasUnread ? 'black' : 'gray.600'}
                noOfLines={1}
                fontWeight={hasUnread ? 'medium' : 'normal'}
                flex="1"
              >
                {vehicleDescription}
              </Text>

              {hasUnread && (
                <Badge
                  borderRadius="full"
                  bg={theme.primary}
                  color="white"
                  fontSize="xs"
                  ml={2}
                >
                  Novo
                </Badge>
              )}
            </Flex>

            <Flex mt={2} justify="space-between" align="center">
              <Text fontSize="xs" color="gray.500">
                ID: {driverId}
              </Text>

              {isFinalized ? (
                <Badge
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  bg="gray.200"
                  color="gray.600"
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FaLock} mr={1} fontSize="10px" />
                  Encerrada
                </Badge>
              ) : (
                <Badge
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  bg={theme.accent}
                  color={theme.dark}
                  fontSize="xs"
                >
                  Toque para abrir
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>
      </MotionBox>
    );
  };

  return (
    <Box
      w="100%"
      maxW="600px"
      mx="auto"
      p={4}
      borderRadius="lg"
      bg={theme.background}
      boxShadow="md"
    >
      <MotionFlex
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        pb={3}
        borderBottomWidth="1px"
        borderColor={theme.accent}
      >
        <Flex align="center">
          <Heading size="md" color={theme.dark} fontWeight="bold" mr={3}>
            <Flex align="center">
              <Icon as={FaComment} mr={2} />
              Mensagens
            </Flex>
          </Heading>
          <Flex align="center">
            <Icon as={FaEye} color="red.500" mr={1} />
            <Text fontSize="xs" color="gray.600">
              A conversa é monitorada
            </Text>
          </Flex>
        </Flex>

        <Badge
          px={2}
          py={1}
          borderRadius="full"
          bg={theme.primary}
          color="white"
          fontSize="sm"
        >
          {activeChats.length} {activeChats.length === 1 ? 'conversa' : 'conversas'}
        </Badge>
      </MotionFlex>

      {isLoading ? (
        <MotionFlex
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          align="center"
          justify="center"
          direction="column"
          py={8}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            <Spinner
              size="md"
              thickness="3px"
              color={theme.primary}
              mb={3}
            />
          </motion.div>
          <Text color={theme.text} fontSize="sm">
            Carregando conversas...
          </Text>
        </MotionFlex>
      ) : (
        <>
          {activeChats.length === 0 ? (
            renderEmptyState()
          ) : (
            <VStack spacing={0} align="stretch">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {activeChats.map((chat) => renderChatCard(chat))}
              </motion.div>
            </VStack>
          )}
        </>
      )}
    </Box>
  );
}

export default ActiveChats;
