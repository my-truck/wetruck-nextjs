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
  FiCheckCircle,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

// Importa apenas o que será usado
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
  // Agora "id" na URL é o ID da SALA (ex.: /admin/chat/6)
  const { id: paramRoomId, driverId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Exemplo de usuário logado
  const userId = localStorage.getItem('userId') || '123';
  const currentUser = {
    id: parseInt(userId, 10),
    name: 'Usuário Logado',
  };

  // State do roomId (sala)
  const [roomId, setRoomId] = useState(null);

  // Lista de mensagens e o campo de texto
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  // Estados de loading e refresh
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Para scroll automático
  const messagesEndRef = useRef(null);

  // Informações de exibição sobre o motorista
  const driverInfo = {
    name: 'Motorista ' + (driverId || 'Desconhecido'),
    status: 'Em trânsito',
    location: 'Rota BR-116, km 45',
    lastActive: 'Há 5 minutos',
    deliveries: 12,
    rating: 4.8,
  };

  // 1) Pegamos o roomId da URL e validamos
  useEffect(() => {
    // Se não houver o parâmetro, não exibe nenhum toast nem navega para trás
    if (!paramRoomId) {
      console.warn('Parâmetro "roomId" não informado.');
      return;
    }
    const numericRoomId = parseInt(paramRoomId, 10);
    if (!isNaN(numericRoomId) && numericRoomId > 0) {
      setRoomId(numericRoomId);
    } else {
      console.error('ID da sala inválido.');
      // Opcional: aqui você pode implementar outra lógica,
      // mas o toast e o navigate foram removidos conforme solicitado.
    }
  }, [paramRoomId]);

  // 2) Carrega as mensagens chamando GET /messages/conversation/:roomId
  const loadConversation = async (rId) => {
    setIsRefreshing(true);
    try {
      const data = await getConversation(rId);
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Assim que roomId for definido, carrega e atualiza a cada 15s
  useEffect(() => {
    if (roomId) {
      loadConversation(roomId);
      const interval = setInterval(() => loadConversation(roomId), 15000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  // Scroll automático ao final das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Formata um timestamp para HH:MM
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 3) Enviar mensagem => POST /messages/send { roomId, message }
  const handleSend = async () => {
    if (!newMsg.trim()) return;
    if (!roomId) {
      toast({
        title: 'Sala não iniciada',
        description: 'Aguarde a inicialização da sala.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendMessage({ roomId, message: newMsg });
      setNewMsg('');
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

  // Ao apertar Enter no campo, envia
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Botão manual de refresh
  const handleRefresh = () => {
    if (roomId) loadConversation(roomId);
  };

  // Voltar
  const handleGoBack = () => {
    navigate(-1);
  };

  // Exemplo de animações framer
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
      {/* Cabeçalho */}
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

      {/* Layout principal */}
      <Grid templateColumns={{ base: '1fr', md: '350px 1fr' }} gap={6}>
        {/* Painel Lateral */}
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
                    Sala: {roomId}
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

        {/* Área de Chat */}
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
            {/* Cabeçalho do chat */}
            <Flex align="center" bg={theme.primary} color="white" p={4} position="relative">
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

            {/* Mensagens */}
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
                      <Flex key={msg.id} justify={isUser ? 'flex-end' : 'flex-start'}>
                        {/* Avatar do outro usuário */}
                        {!isUser && (
                          <Avatar
                            size="sm"
                            icon={<Icon as={FiTruck} />}
                            mr={2}
                            bg={theme.dark}
                            color="white"
                          />
                        )}

                        {/* Bolha de mensagem */}
                        <Box
                          maxWidth="70%"
                          p={3}
                          borderRadius="lg"
                          bg={isUser ? theme.primary : 'white'}
                          color={isUser ? 'white' : theme.text}
                          boxShadow="sm"
                          borderWidth={!isUser ? '1px' : '0'}
                        >
                          <Text>{msg.message}</Text>
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

                        {/* Avatar do usuário logado */}
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

            {/* Input para nova mensagem */}
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
