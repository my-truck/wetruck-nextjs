import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Heading,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import {
  FiSend,
  FiTruck,
  FiMessageCircle,
  FiUser,
  FiClock,
  FiShield,
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi';
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

  // Função para carregar mensagens, memoizada para evitar recriação constante
  const loadConversation = useCallback(
    async (rId) => {
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
    },
    [toast] // Adicione aqui quaisquer variáveis que a função use (por ex. toast)
  );

  // Carregar mensagens iniciais sempre que roomId (ou loadConversation) mudar
  useEffect(() => {
    if (roomId) {
      loadConversation(roomId);
    }
  }, [roomId, loadConversation]);

  // Scroll automático para a última mensagem
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
      setMessages((prev) => [...prev, newMessage]);
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

  return (
    <Box width="100%" px={3}>
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
      
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        height={{ base: "75vh", md: "75vh" }}
        borderLeft={`5px solid ${theme.primary}`}
        width="100%"
      >
        <Flex align="center" bg={theme.primary} color="white" p={4} position="relative">
          <Icon as={FiMessageCircle} fontSize="24px" mr={3} />
          <Box flex="1">
            <Heading size="md">Conversa com {driverInfo.name}</Heading>
            <Flex align="center" mt={1}>
              <Text fontSize="sm" mr={3}>
                {isRefreshing
                  ? 'Atualizando mensagens...'
                  : `Última atualização: ${formatTime(new Date())}`}
              </Text>
              <Badge colorScheme="green" borderRadius="full" px={2} py={1}>
                Sala: {roomId || 'Aguardando...'}
              </Badge>
            </Flex>
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
        
        {/* Banner de Segurança */}
        <Box bg={theme.backgroundDark} p={3}>
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
              </Text>
            </Flex>
          ) : (
            <VStack align="stretch" spacing={4}>
              {messages.map((msg) => {
                const isUser = Number(msg.senderId) === currentUser.id;
                return (
                  <Flex
                    key={msg.id || `${msg.createdAt}-${msg.body}`}
                    justify={isUser ? 'flex-end' : 'flex-start'}
                  >
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
                      maxWidth={{ base: "80%", md: "70%" }}
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
    </Box>
  );
}

export default ChatPage;
