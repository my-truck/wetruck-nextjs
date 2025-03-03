// src/chat/components/Chat.js
import React, { useEffect, useState, useRef } from 'react';
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
  Heading,
} from '@chakra-ui/react';
import { FiSend, FiTruck, FiMessageCircle, FiUser, FiClock } from 'react-icons/fi';

// Tema personalizado de cores para logística e segurança
const theme = {
  primary: '#FF6B00',     // Laranja principal vibrante
  secondary: '#FF8C38',   // Laranja secundário
  accent: '#FFB273',      // Laranja claro
  dark: '#E85D00',        // Laranja escuro para contraste
  background: '#FFF8F2',  // Fundo suave alaranjado
  text: '#3D3D3D',        // Texto escuro para legibilidade
  success: '#27AE60',     // Verde para confirmações
};

function Chat({ currentUser, receiverId, onClose }) {
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    // Ao montar, inicia ou recupera a sala
    (async () => {
      setIsLoading(true);
      try {
        // Tenta pegar do localStorage
        const storedRoomId = localStorage.getItem('roomId');
        if (storedRoomId) {
          setRoomId(parseInt(storedRoomId, 10));
        } else {
          // Se não existir, chama startRoom no backend
          const room = await startRoom();
          setRoomId(room.id);
          localStorage.setItem('roomId', room.id);
        }
      } catch (error) {
        toast({
          title: 'Erro ao conectar',
          description: 'Não foi possível iniciar o chat.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  useEffect(() => {
    // Assim que tiver roomId, busca mensagens
    if (roomId) {
      loadConversation(roomId);
      
      // Configurar atualização periódica a cada 10 segundos
      const interval = setInterval(() => loadConversation(roomId), 10000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  useEffect(() => {
    // Rola para a mensagem mais recente quando mensagens são atualizadas
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

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    
    setIsLoading(true);
    try {
      await sendMessage({
        roomId,
        receiverId,
        message: newMsg,
      });
      
      setNewMsg('');
      // Recarrega conversa
      await loadConversation(roomId);
      
      toast({
        title: 'Mensagem enviada',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
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
      maxW="600px" 
      width="100%"
    >
      {/* Cabeçalho do Chat */}
      <Flex 
        align="center" 
        bg={theme.primary} 
        color="white" 
        p={3} 
        borderRadius="md" 
        mb={4}
        position="relative"
        overflow="hidden"
      >
        <Box 
          position="absolute" 
          right="-20px" 
          top="-20px" 
          width="80px" 
          height="80px" 
          borderRadius="full" 
          bg={theme.accent} 
          opacity={0.3} 
        />
        
        <Icon as={FiTruck} fontSize="24px" mr={3} />
        <Box flex="1">
          <Heading size="md">Chat com Motorista</Heading>
          <Flex align="center" fontSize="sm">
            <Text>ID: {receiverId}</Text>
            <Badge 
              ml={2} 
              colorScheme="green" 
              borderRadius="full" 
              px={2}
            >
              Online
            </Badge>
          </Flex>
        </Box>
      </Flex>

      {/* Área de Mensagens */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={3}
        mb={4}
        height="300px"
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
            <Text>Inicie uma conversa com o motorista</Text>
          </Flex>
        ) : (
          <VStack align="stretch" spacing={3}>
            {messages.map((msg) => {
              const isUser = msg.senderId === currentUser.id;
              return (
                <Flex 
                  key={msg.id} 
                  justify={isUser ? "flex-end" : "flex-start"}
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
                    maxWidth="70%"
                    p={3}
                    borderRadius="lg"
                    bg={isUser ? theme.primary : 'white'}
                    color={isUser ? 'white' : theme.text}
                    boxShadow="sm"
                    borderWidth={!isUser ? "1px" : "0"}
                  >
                    <Text fontSize="sm">{msg.message}</Text>
                    <Flex justify="flex-end" fontSize="xs" color={isUser ? "whiteAlpha.800" : "gray.500"} mt={1}>
                      <Icon as={FiClock} mr={1} />
                      <Text>{formatTime()}</Text>
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
          mt={3}
          borderColor={theme.accent}
          color={theme.primary}
          _hover={{ bg: theme.background }}
          size="sm"
          width="full"
        >
          Fechar Chat
        </Button>
      )}
    </Box>
  );
}

export default Chat;