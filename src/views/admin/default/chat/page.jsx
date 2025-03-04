import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  Text,
  Flex,
  Icon,
  InputGroup,
  InputRightElement,
  Avatar,
  VStack,
  useToast,
  Container,
  Heading,
  Divider,
  Grid,
  GridItem,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
} from '@chakra-ui/react';
import {
  FiSend,
  FiTruck,
  FiMessageCircle,
  FiUser,
  FiClock,
  FiMapPin,
  FiShield,
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { getConversation, sendMessage } from '../chat/services/chatService';

const theme = {
  primary: '#FF6B00',
  secondary: '#FF8C38',
  accent: '#FFB273',
  dark: '#E85D00',
  background: '#FFF8F2',
  backgroundDark: '#FFF0E6',
  text: '#3D3D3D',
  success: '#27AE60',
  danger: '#E74C3C',
};

function ChatPage() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Corrigido para usar 'user_id' conforme salvo no Login.js
  const userId = localStorage.getItem('user_id') || '123';
  const currentUser = {
    id: parseInt(userId, 10),
    name: 'Usuário Logado',
  };

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const driverInfo = {
    name: 'Motorista ' + (driverId || 'Desconhecido'),
    status: 'Em trânsito',
    location: 'Rota BR-116, km 45',
    lastActive: 'Há 5 minutos',
    deliveries: 12,
    rating: 4.8,
  };

  // Configuração do WebSocket
  useEffect(() => {
    const socket = io('https://etc.wetruckhub.com', {
      query: { userId: currentUser.id },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Conectado ao WebSocket com userId:', currentUser.id);
    });

    socket.on('message', (message) => {
      console.log('Mensagem recebida via WebSocket:', message);
      if (message.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Erro na conexão WebSocket:', error);
      toast({
        title: 'Erro no WebSocket',
        description: 'Não foi possível conectar ao servidor de mensagens.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    return () => {
      socket.disconnect();
      console.log('Desconectado do WebSocket');
    };
  }, [currentUser.id, roomId, toast]);

  // Pegar o roomId do localStorage
  useEffect(() => {
    const storedRoomId = localStorage.getItem('roomId');
    if (storedRoomId) {
      const numericRoomId = parseInt(storedRoomId, 10);
      if (!isNaN(numericRoomId) && numericRoomId > 0) {
        setRoomId(numericRoomId);
      } else {
        console.error('ID da sala armazenado é inválido:', storedRoomId);
        toast({
          title: 'Erro na sala',
          description: 'O ID da sala armazenado é inválido.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      console.warn('Nenhum roomId encontrado no localStorage.');
      toast({
        title: 'Sala não encontrada',
        description: 'Inicie uma sala antes de acessar o chat.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate(-1);
    }
  }, [toast, navigate]);

  // Carregar mensagens iniciais
  const loadConversation = async (rId) => {
    setIsRefreshing(true);
    try {
      const data = await getConversation(rId);
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast({
        title: 'Erro ao carregar mensagens',
        description: 'Não foi possível carregar a conversa.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      loadConversation(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    if (!roomId) {
      toast({
        title: 'Sala não iniciada',
        description: 'Aguarde a inicialização da sala ou inicie uma nova.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendMessage({ roomId, message: newMsg });
      const newMessage = {
        roomId,
        senderId: currentUser.id,
        body: newMsg,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]); // Adiciona localmente
      setNewMsg('');
      toast({
        title: 'Mensagem enviada com sucesso',
        status: 'success',
        duration: 2000,
        position: 'top-right',
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Falha ao enviar mensagem',
        description: 'Verifique sua conexão e tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleRefresh = () => {
    if (roomId) loadConversation(roomId);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  const tabVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Flex mb={5} align="center">
        <IconButton
          icon={<FiArrowLeft />}
          variant="ghost"
          mr={3}
          aria-label="Voltar"
          onClick={handleGoBack}
          color={theme.primary}
        />
        <Heading size="lg" color={theme.text}>
          Sistema de Comunicação
        </Heading>
      </Flex>

      <Grid templateColumns={{ base: '1fr', md: '350px 1fr' }} gap={6}>
        <GridItem>
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            p={5}
            borderLeft={`5px solid ${theme.primary}`}
            height="fit-content"
          >
            <Flex mb={4} align="center">
              <Avatar
                size="lg"
                icon={<Icon as={FiTruck} fontSize="1.5rem" />}
                bg={theme.primary}
                color="white"
                mr={4}
              />
              <Box>
                <Heading size="md" color={theme.text}>
                  {driverInfo.name}
                </Heading>
                <Flex align="center" mt={1}>
                  <Badge colorScheme="green" borderRadius="full" px={2} py={1}>
                    {driverInfo.status}
                  </Badge>
                  <Text fontSize="sm" color="gray.500" ml={2}>
                    Sala: {roomId || 'Aguardando...'}
                  </Text>
                </Flex>
              </Box>
            </Flex>

            <Divider my={4} borderColor={theme.accent} />

            <VStack spacing={4} align="stretch">
              <Flex align="center">
                <Icon as={FiMapPin} color={theme.primary} mr={2} />
                <Text fontSize="sm" color={theme.text}>
                  {driverInfo.location}
                </Text>
              </Flex>
              <Flex align="center">
                <Icon as={FiClock} color={theme.primary} mr={2} />
                <Text fontSize="sm" color={theme.text}>
                  Ativo: {driverInfo.lastActive}
                </Text>
              </Flex>
              <Box p={4} bg={theme.background} borderRadius="md">
                <Flex justify="space-between">
                  <Stat>
                    <StatLabel color={theme.text}>Entregas</StatLabel>
                    <StatNumber color={theme.primary}>{driverInfo.deliveries}</StatNumber>
                    <StatHelpText>Este mês</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color={theme.text}>Avaliação</StatLabel>
                    <StatNumber color={theme.primary}>
                      {driverInfo.rating}/5
                    </StatNumber>
                    <StatHelpText>⭐⭐⭐⭐⭐</StatHelpText>
                  </Stat>
                </Flex>
              </Box>
              <Box bg={theme.backgroundDark} p={3} borderRadius="md">
                <Flex align="center">
                  <Icon as={FiShield} color={theme.primary} mr={2} />
                  <Text fontSize="sm" fontWeight="bold" color={theme.text}>
                    Comunicação Segura
                  </Text>
                </Flex>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Esta conversa é monitorada para garantir a segurança da operação logística.
                </Text>
              </Box>
            </VStack>
          </Box>
        </GridItem>

        <GridItem>
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            height="600px"
          >
            <Flex align="center" bg={theme.primary} color="white" p={4} position="relative">
              <Icon as={FiMessageCircle} fontSize="24px" mr={3} />
              <Box flex="1">
                <Heading size="md">Conversa com {driverInfo.name}</Heading>
                <Text fontSize="sm" mt={1}>
                  {isRefreshing
                    ? 'Atualizando mensagens...'
                    : `Última atualização: ${formatTime(new Date())}`}
                </Text>
              </Box>
              <IconButton
                aria-label="Atualizar mensagens"
                icon={<FiRefreshCw />}
                onClick={handleRefresh}
                isLoading={isRefreshing}
                variant="ghost"
                color="white"
              />
            </Flex>

            <Box
              p={4}
              flex="1"
              overflowY="auto"
              bg={theme.background}
              css={{
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.accent,
                  borderRadius: '4px',
                },
              }}
            >
              {messages.length === 0 ? (
                <Flex
                  height="100%"
                  justify="center"
                  align="center"
                  direction="column"
                  color="gray.500"
                >
                  <Icon as={FiMessageCircle} fontSize="50px" mb={3} color={theme.accent} />
                  <Text fontSize="lg">Iniciar uma nova conversa</Text>
                  <Text fontSize="sm" mt={2} textAlign="center">
                    Envie uma mensagem para se comunicar com o motorista
                    <br />
                    Todas as mensagens são monitoradas por segurança
                  </Text>
                </Flex>
              ) : (
                <VStack align="stretch" spacing={4}>
                  {messages.map((msg) => {
                    const isUser = Number(msg.senderId) === currentUser.id;
                    return (
                      <Flex key={msg.id || `${msg.createdAt}-${msg.body}`} justify={isUser ? 'flex-end' : 'flex-start'}>
                        {!isUser && (
                          <Avatar
                            size="sm"
                            icon={<Icon as={FiTruck} />}
                            mr={2}
                            bg={theme.dark}
                            color="white"
                          />
                        )}
                        <Box
                          maxWidth="70%"
                          p={3}
                          borderRadius="lg"
                          bg={isUser ? theme.primary : 'white'}
                          color={isUser ? 'white' : theme.text}
                          boxShadow="sm"
                          borderWidth={!isUser ? '1px' : '0'}
                        >
                          <Text>{msg.body || msg.message}</Text>
                          <Flex
                            justify="flex-end"
                            fontSize="xs"
                            color={isUser ? 'whiteAlpha.800' : 'gray.500'}
                            mt={2}
                          >
                            <Icon as={FiClock} mr={1} />
                            <Text>{formatTime(msg.createdAt)}</Text>
                          </Flex>
                        </Box>
                        {isUser && (
                          <Avatar
                            size="sm"
                            icon={<Icon as={FiUser} />}
                            ml={2}
                            bg={theme.secondary}
                            color="white"
                          />
                        )}
                      </Flex>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </VStack>
              )}
            </Box>

            <Box p={3} borderTop="1px solid" borderTopColor="gray.100">
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  placeholder="Digite sua mensagem..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  borderColor={theme.accent}
                  _focus={{
                    borderColor: theme.primary,
                    boxShadow: `0 0 0 1px ${theme.primary}`,
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="orange"
                    bg={theme.primary}
                    _hover={{ bg: theme.dark }}
                    onClick={handleSend}
                    isLoading={isLoading}
                    leftIcon={<Icon as={FiSend} />}
                  >
                    Enviar
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}

export default ChatPage;