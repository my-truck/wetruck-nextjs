import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Container,
  Heading,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  IconButton
} from '@chakra-ui/react';
import { startRoom, getConversation, sendMessage } from '../chat/services/chatService';
import { 
  FiSend, 
  FiTruck, 
  FiMessageCircle, 
  FiUser, 
  FiClock, 
  FiMapPin, 
  FiPackage,
  FiShield,
  FiArrowLeft,
  FiRefreshCw
} from 'react-icons/fi';

// Tema personalizado de cores para logística e segurança
const theme = {
  primary: '#FF6B00',     // Laranja principal vibrante
  secondary: '#FF8C38',   // Laranja secundário
  accent: '#FFB273',      // Laranja claro
  dark: '#E85D00',        // Laranja escuro para contraste
  background: '#FFF8F2',  // Fundo suave alaranjado
  backgroundDark: '#FFF0E6', // Fundo um pouco mais escuro para contraste
  text: '#3D3D3D',        // Texto escuro para legibilidade
  success: '#27AE60',     // Verde para confirmações
  danger: '#E74C3C',      // Vermelho para alertas
};

function ChatPage() {
  // Pega o driverId a partir da URL (ex.: /admin/chat/999)
  const { driverId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Pega o userId do localStorage e monta um objeto currentUser
  const userId = localStorage.getItem('userId') || '123'; // fallback se não tiver
  const currentUser = { id: parseInt(userId, 10), name: 'Usuário Logado' };

  // Estados locais
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef(null);

  // Dados simulados do motorista para o mockup
  const driverInfo = {
    name: "Motorista " + driverId,
    status: "Em trânsito",
    location: "Rota BR-116, km 45",
    lastActive: "Há 5 minutos",
    deliveries: 12,
    rating: 4.8
  };

  // 1) Ao montar o componente, cria (ou recupera) a sala
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const storedRoomId = localStorage.getItem('roomId');
        // Verifica se o roomId armazenado é um número válido
        if (storedRoomId && !isNaN(parseInt(storedRoomId, 10))) {
          setRoomId(parseInt(storedRoomId, 10));
        } else {
          // Se não existir ou for inválido, cria nova sala no backend
          const room = await startRoom();
          setRoomId(room.id);
          localStorage.setItem('roomId', room.id);
        }
      } catch (error) {
        console.error('Erro ao iniciar/recuperar a sala:', error);
        toast({
          title: 'Erro de conexão',
          description: 'Não foi possível iniciar o chat com o motorista.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  // 2) Assim que tiver o roomId, busca as mensagens
  useEffect(() => {
    if (roomId) {
      loadConversation(roomId);
      
      // Configurar atualização periódica a cada 15 segundos
      const interval = setInterval(() => loadConversation(roomId), 15000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  useEffect(() => {
    // Rola para a mensagem mais recente quando mensagens são atualizadas
    scrollToBottom();
  }, [messages]);

  const loadConversation = async (id) => {
    setIsRefreshing(true);
    try {
      const data = await getConversation(id);
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar a conversa:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3) Envio de mensagem
  const handleSend = async () => {
    if (!newMsg.trim()) return;
    
    setIsLoading(true);
    try {
      await sendMessage({
        roomId,
        receiverId: driverId,
        message: newMsg,
      });
      
      setNewMsg('');
      // Recarrega conversa
      await loadConversation(roomId);
      
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleRefresh = () => {
    if (roomId) {
      loadConversation(roomId);
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };

  const formatTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
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

      <Grid templateColumns={{ base: "1fr", md: "350px 1fr" }} gap={6}>
        {/* Painel Lateral com Informações do Motorista */}
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
                <Heading size="md" color={theme.text}>{driverInfo.name}</Heading>
                <Flex align="center" mt={1}>
                  <Badge colorScheme="green" borderRadius="full" px={2} py={1}>
                    {driverInfo.status}
                  </Badge>
                  <Text fontSize="sm" color="gray.500" ml={2}>
                    ID: {driverId}
                  </Text>
                </Flex>
              </Box>
            </Flex>

            <Divider my={4} borderColor={theme.accent} />

            <VStack spacing={4} align="stretch">
              <Flex align="center">
                <Icon as={FiMapPin} color={theme.primary} mr={2} />
                <Text fontSize="sm" color={theme.text}>{driverInfo.location}</Text>
              </Flex>
              
              <Flex align="center">
                <Icon as={FiClock} color={theme.primary} mr={2} />
                <Text fontSize="sm" color={theme.text}>Ativo: {driverInfo.lastActive}</Text>
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
                    <StatNumber color={theme.primary}>{driverInfo.rating}/5</StatNumber>
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

        {/* Área Principal do Chat */}
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
            {/* Cabeçalho do Chat */}
            <Flex 
              align="center" 
              bg={theme.primary} 
              color="white" 
              p={4}
              position="relative"
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
              
              <Icon as={FiMessageCircle} fontSize="24px" mr={3} />
              <Box flex="1">
                <Heading size="md">Conversa com {driverInfo.name}</Heading>
                <Text fontSize="sm" mt={1}>
                  {isRefreshing ? 'Atualizando mensagens...' : `Última atualização: ${formatTime()}`}
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

            {/* Área de Mensagens */}
            <Box
              p={4}
              flex="1"
              overflowY="auto"
              bg={theme.background}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
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
                    Envie uma mensagem para se comunicar com o motorista<br />
                    Todas as mensagens são monitoradas por segurança
                  </Text>
                </Flex>
              ) : (
                <VStack align="stretch" spacing={4}>
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
                          <Text>{msg.message}</Text>
                          <Flex justify="flex-end" fontSize="xs" color={isUser ? "whiteAlpha.800" : "gray.500"} mt={2}>
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

            {/* Área de Input */}
            <Box p={3} borderTop="1px solid" borderTopColor="gray.100">
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  placeholder="Digite sua mensagem..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyPress={handleKeyPress}
                  borderColor={theme.accent}
                  _focus={{ borderColor: theme.primary, boxShadow: `0 0 0 1px ${theme.primary}` }}
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
