import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startRoom, getConversation, sendMessage } from '../services/chatService';
import {
  Box,
  Button,
  Input,
  Text,
  Flex,
  Icon,
  Badge,
  InputGroup,
  InputRightElement,
  Avatar,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FiSend, FiMessageCircle, FiUser, FiClock } from 'react-icons/fi';

// Tema personalizado de cores
const theme = {
  primary: '#FF6B00',     // Laranja principal vibrante
  secondary: '#FF8C38',   // Laranja secundário
  accent: '#FFB273',      // Laranja claro
  dark: '#E85D00',        // Laranja escuro para contraste
  background: '#FFF8F2',  // Fundo suave alaranjado
  text: '#3D3D3D',        // Texto escuro para legibilidade
  success: '#27AE60',     // Verde para confirmações
};

function Chat({ currentUser, onClose }) {
  // Pega o freightId da rota: /admin/chat/:freightId
  const { freightId } = useParams();
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const toast = useToast();

  // 1) Monta: verifica se já existe "roomId" no localStorage;
  //    se não existir, chama o startRoom(freightId) para criar a sala.
  useEffect(() => {
    const initRoom = async () => {
      setIsLoading(true);
      try {
        const storedRoomId = localStorage.getItem('roomId');

        if (storedRoomId) {
          // Se já existe, usamos esse
          setRoomId(parseInt(storedRoomId, 10));
        } else {
          // Caso o usuário acesse /admin/chat/:freightId diretamente,
          // podemos iniciar a sala aqui:
          const room = await startRoom(freightId);
          setRoomId(room.id);
          localStorage.setItem('roomId', room.id);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Erro ao conectar',
          description: 'Não foi possível iniciar o chat.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        // Opcional: podemos navegar de volta caso dê erro
        navigate('/admin/default');
      } finally {
        setIsLoading(false);
      }
    };

    initRoom();
  }, [freightId, toast, navigate]);

  // 2) Assim que tiver o roomId, busca as mensagens
  useEffect(() => {
    if (roomId) {
      loadConversation(roomId);
      // Configurar atualização periódica a cada 10s, se desejar
      const interval = setInterval(() => loadConversation(roomId), 10000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  // Rola para a mensagem mais recente quando mensagens são atualizadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async (id) => {
    try {
      const data = await getConversation(id);
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3) Envio de mensagem - repare que não passamos receiverId,
  //    pois seu serviço só precisa de { roomId, message }.
  const handleSend = async () => {
    if (!newMsg.trim()) return;
    if (!roomId) return;

    setIsLoading(true);
    try {
      await sendMessage({
        roomId, // O id da sala
        message: newMsg,
      });

      setNewMsg('');
      // Recarrega as mensagens
      await loadConversation(roomId);

      toast({
        title: 'Mensagem enviada',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Falha ao enviar',
        description: 'Tente novamente em instantes.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Exemplo simples de formatação de hora
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Box
      p={4}
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      maxW="800px"
      width="100%"
      mx="auto"
      height="calc(100vh - 120px)"
      display="flex"
      flexDirection="column"
    >
      {/* Cabeçalho Simplificado */}
      <Flex
        align="center"
        justify="space-between"
        bg={theme.primary}
        color="white"
        p={2}
        borderRadius="md"
        mb={2}
      >
        <Flex align="center">
          <Text fontWeight="bold" ml={2}>Sala: {roomId || freightId}</Text>
        </Flex>
        <Badge colorScheme="green" borderRadius="full" px={2}>
          Online
        </Badge>
      </Flex>

      {/* Área de Mensagens - Agora com altura flexível para ocupar espaço disponível */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={3}
        mb={3}
        flex="1"
        overflowY="auto"
        bg={theme.background}
        css={{
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.accent,
            borderRadius: '3px',
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
            <Icon as={FiMessageCircle} fontSize="40px" mb={2} color={theme.accent} />
            <Text>Inicie uma conversa</Text>
          </Flex>
        ) : (
          <VStack align="stretch" spacing={3}>
            {messages.map((msg) => {
              const isUser = msg.senderId === currentUser?.id;
              return (
                <Flex
                  key={msg.id}
                  justify={isUser ? 'flex-end' : 'flex-start'}
                >
                  {/* Se não for o usuário logado, mostra o avatar do motorista */}
                  {!isUser && (
                    <Avatar
                      size="sm"
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
                    <Text fontSize="sm">{msg.message}</Text>
                    <Flex
                      justify="flex-end"
                      fontSize="xs"
                      color={isUser ? 'whiteAlpha.800' : 'gray.500'}
                      mt={1}
                    >
                      <Icon as={FiClock} mr={1} />
                      <Text>{formatTime()}</Text>
                    </Flex>
                  </Box>

                  {/* Se for o usuário logado, mostra o avatar do usuário */}
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

      {/* Barra de Input */}
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          placeholder="Digite sua mensagem..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyPress={handleKeyPress}
          borderColor={theme.accent}
          _focus={{ borderColor: theme.primary }}
          bg="white"
          disabled={!roomId} // Caso ainda não exista roomId
        />
        <InputRightElement width="4.5rem">
          <Button
            h="1.75rem"
            size="sm"
            bg={theme.primary}
            color="white"
            _hover={{ bg: theme.dark }}
            onClick={handleSend}
            isLoading={isLoading}
            leftIcon={<Icon as={FiSend} />}
            disabled={!roomId}
          >
            Enviar
          </Button>
        </InputRightElement>
      </InputGroup>

      {/* Botão de Fechar se necessário */}
      {onClose && (
        <Button
          variant="outline"
          onClick={onClose}
          mt={2}
          borderColor={theme.accent}
          color={theme.primary}
          _hover={{ bg: theme.background }}
          size="sm"
        >
          Fechar Chat
        </Button>
      )}
    </Box>
  );
}

export default Chat;