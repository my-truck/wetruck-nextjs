import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  useToast,
  Heading,
  Container,
  Flex,
  Icon,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tag,
  Avatar,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMapPin, FiCalendar, FiMessageCircle, FiDollarSign, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import axiosInstance from '../../axiosInstance';
import AcceptButton from '../../components/menu/AcceptButton';
// Importa o serviço de chat, que agora espera o id do frete para iniciar a sala
import { startRoom } from '../admin/default/chat/services/chatService';

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

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function FreteDetalhes() {
  const navigate = useNavigate();
  const toast = useToast();
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contadores, setContadores] = useState({
    pendentes: 0,
    confirmados: 0,
    concluidos: 0,
  });

  // Usuário logado (exemplo)
  const currentUser = { id: 123, name: 'Usuário Logado' };

  // Enum para status do frete
  const FRETE_STATUS = {
    AUTHORIZED: 'authorized',
    PAID: 'paid',
    COMPLETED: 'completed',
  };

  const fetchFreteData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/work');
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [response.data];
      setFretes(data);
      
      // Atualiza os contadores
      setContadores({
        pendentes: data.filter((f) => f.paymentStatus === FRETE_STATUS.AUTHORIZED).length,
        confirmados: data.filter((f) => f.paymentStatus === FRETE_STATUS.PAID).length,
        concluidos: data.filter((f) => f.status === FRETE_STATUS.COMPLETED).length,
      });
    } catch (err) {
      console.error('Erro ao buscar dados do frete:', err);
      setError(err.message || 'Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreteData();
  }, [fetchFreteData]);

  const handleVoltarInicio = () => navigate('/admin/default');
  const handleVerMais = (freteId) => navigate(`/corridas/${freteId}`);

  // Função para iniciar a sala de chat utilizando o id do frete
  const handleOpenChat = async (freightId) => {
    try {
      // Armazena o id do frete no localStorage
      localStorage.setItem('freightId', freightId.toString());
      // Chama o endpoint para iniciar a sala, enviando o freight id
      const room = await startRoom(freightId);
      // Armazena o id da sala para uso no chat
      localStorage.setItem('roomId', room.id);
      // Redireciona para a página de chat utilizando o freight id
      navigate(`/admin/chat/${freightId}`);
    } catch (error) {
      toast({
        title: 'Erro ao iniciar chat',
        description: 'Não foi possível iniciar a sala de chat. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Define as propriedades do Badge conforme o status do frete
  const getBadgeProps = (frete) => {
    if (frete.paymentStatus === FRETE_STATUS.AUTHORIZED) {
      return { 
        label: 'Aguardando Aceite', 
        color: 'orange',
        icon: FiTruck,
      };
    }
    if (frete.paymentStatus === FRETE_STATUS.PAID) {
      return { 
        label: 'Pedido Confirmado', 
        color: 'green',
        icon: FiCheckCircle,
      };
    }
    if (frete.status === FRETE_STATUS.COMPLETED) {
      return { 
        label: 'Frete Finalizado', 
        color: 'purple',
        icon: FiCheckCircle,
      };
    }
    return { 
      label: 'Desconhecido', 
      color: 'gray',
      icon: FiTruck,
    };
  };

  // Componentes de estado
  const LoadingState = () => (
    <Flex
      w="100%"
      bg="gray.50"
      p={8}
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      direction="column"
      gap={4}
    >
      <Spinner size="xl" thickness="4px" color="blue.500" />
      <Text color="gray.600" fontSize="lg" fontWeight="medium">
        Carregando fretes...
      </Text>
    </Flex>
  );

  const ErrorState = ({ message }) => (
    <Flex
      w="100%"
      bg="gray.50"
      p={8}
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      direction="column"
      gap={4}
    >
      <Icon as={FiTruck} w={16} h={16} color="red.500" />
      <Text color="red.500" fontSize="xl" fontWeight="bold">
        Erro ao carregar fretes
      </Text>
      <Text color="gray.600" fontSize="md">
        {message}
      </Text>
      <Button leftIcon={<FiArrowLeft />} colorScheme="blue" onClick={handleVoltarInicio}>
        Voltar ao Início
      </Button>
    </Flex>
  );

  const EmptyState = ({ message }) => (
    <Flex
      w="100%"
      bg="gray.50"
      p={8}
      alignItems="center"
      justifyContent="center"
      minH="80vh"
      direction="column"
      gap={4}
    >
      <Icon as={FiTruck} w={16} h={16} color="gray.400" />
      <Text fontSize="xl" color="gray.600" fontWeight="medium">
        {message}
      </Text>
      <Button leftIcon={<FiArrowLeft />} colorScheme="blue" onClick={handleVoltarInicio}>
        Voltar ao Início
      </Button>
    </Flex>
  );

  // Card do frete
  const FreteCard = ({ frete, index }) => {
    const { label, color, icon } = getBadgeProps(frete);
    const podeAceitar = frete.paymentStatus === FRETE_STATUS.AUTHORIZED;
    const isPago = frete.paymentStatus === FRETE_STATUS.PAID;
    // Utiliza o campo "id" do frete para iniciar o chat
    const freightId = frete.id;

    const formattedDate = new Date(frete.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <MotionBox
        bg="white"
        boxShadow="lg"
        borderRadius="xl"
        p={0}
        mb={6}
        overflow="hidden"
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -3, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Cabeçalho colorido */}
        <Box bg={`${color}.500`} py={3} px={6} position="relative" overflow="hidden">
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={icon} color="white" boxSize={5} />
              <Text color="white" fontWeight="bold" fontSize="md">
                {label}
              </Text>
            </HStack>
            <Badge bg="white" color={`${color}.500`} px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">
              R$ {parseFloat(frete.amount || 0).toFixed(2)}
            </Badge>
          </Flex>
        </Box>

        {/* Conteúdo principal */}
        <Box p={6}>
          {/* Título e data */}
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color="gray.800">
              {frete.name || 'Frete sem nome'}
            </Heading>
            <HStack>
              <Icon as={FiCalendar} color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                {formattedDate}
              </Text>
            </HStack>
          </Flex>

          {/* Descrição */}
          {frete.description && (
            <Text fontSize="sm" color="gray.600" mb={4}>
              {frete.description}
            </Text>
          )}

          <Divider my={4} />

          {/* Detalhes */}
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
            {/* Origem */}
            <Box flex="1">
              <HStack spacing={2} mb={1}>
                <Icon as={FiMapPin} color="orange.500" />
                <Text fontWeight="bold" fontSize="sm" color="gray.700">
                  Origem
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" ml={6}>
                {frete.address?.street || 'N/A'}
                {frete.address?.number ? `, ${frete.address.number}` : ''}
              </Text>
              <Text fontSize="sm" color="gray.500" ml={6}>
                {frete.address?.city || 'N/A'}
                {frete.address?.state ? ` - ${frete.address.state}` : ''}
              </Text>
            </Box>

            {/* Destino */}
            <Box flex="1">
              <HStack spacing={2} mb={1}>
                <Icon as={FiMapPin} color="blue.500" />
                <Text fontWeight="bold" fontSize="sm" color="gray.700">
                  Destino
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" ml={6}>
                {frete.destinationAddress?.street || 'N/A'}
                {frete.destinationAddress?.number ? `, ${frete.destinationAddress.number}` : ''}
              </Text>
              <Text fontSize="sm" color="gray.500" ml={6}>
                {frete.destinationAddress?.city || 'N/A'}
                {frete.destinationAddress?.state ? ` - ${frete.destinationAddress.state}` : ''}
              </Text>
            </Box>
          </Flex>

          {/* Botões de ação */}
          <Flex gap={3} justify="flex-end" align="center" wrap="wrap" mt={4}>
            {podeAceitar && (
              <AcceptButton
                size="md"
                notificationId={String(frete.id)}
                onAccept={() => {
                  toast({
                    title: 'Frete Aceito',
                    description: `Você aceitou o frete para ${frete.destinationAddress?.city || 'destino'}`,
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                    position: 'top-right',
                  });
                  fetchFreteData();
                }}
              />
            )}

            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => handleVerMais(frete.id)}
              leftIcon={<FiTruck />}
              size="md"
              _hover={{ bg: 'blue.50' }}
            >
              Ver Detalhes
            </Button>

            {isPago && (
              <Button
                colorScheme="teal"
                onClick={() => handleOpenChat(freightId)}
                leftIcon={<FiMessageCircle />}
                size="md"
              >
                Chat
              </Button>
            )}
          </Flex>
        </Box>
      </MotionBox>
    );
  };

  const ResumoFretes = () => (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={4}
      mb={6}
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="md"
      as={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stat p={4} textAlign="center" borderRightWidth={{ md: 1 }} borderBottomWidth={{ base: 1, md: 0 }} borderColor="gray.200">
        <StatLabel fontSize="sm" fontWeight="medium" color="gray.500">
          Aguardando Aceite
        </StatLabel>
        <StatNumber color="orange.500" fontSize="2xl">
          {contadores.pendentes}
        </StatNumber>
        <StatHelpText>
          <Tag size="sm" colorScheme="orange" borderRadius="full">
            Pendentes
          </Tag>
        </StatHelpText>
      </Stat>

      <Stat p={4} textAlign="center" borderRightWidth={{ md: 1 }} borderBottomWidth={{ base: 1, md: 0 }} borderColor="gray.200">
        <StatLabel fontSize="sm" fontWeight="medium" color="gray.500">
          Confirmados
        </StatLabel>
        <StatNumber color="green.500" fontSize="2xl">
          {contadores.confirmados}
        </StatNumber>
        <StatHelpText>
          <Tag size="sm" colorScheme="green" borderRadius="full">
            Em andamento
          </Tag>
        </StatHelpText>
      </Stat>

      <Stat p={4} textAlign="center">
        <StatLabel fontSize="sm" fontWeight="medium" color="gray.500">
          Concluídos
        </StatLabel>
        <StatNumber color="purple.500" fontSize="2xl">
          {contadores.concluidos}
        </StatNumber>
        <StatHelpText>
          <Tag size="sm" colorScheme="purple" borderRadius="full">
            Finalizados
          </Tag>
        </StatHelpText>
      </Stat>
    </Flex>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!fretes.length) return <EmptyState message="Nenhum frete encontrado." />;

  // Filtra as listas
  const fretesParaAceitar = fretes.filter((f) => f.paymentStatus === FRETE_STATUS.AUTHORIZED);
  const fretesAceitos = fretes.filter((f) => f.paymentStatus === FRETE_STATUS.PAID);
  const fretesConcluidos = fretes.filter((f) => f.status === FRETE_STATUS.COMPLETED);

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Header */}
      <Box bg="white" boxShadow="sm" py={4} px={6} mb={6}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Icon as={FiTruck} boxSize={6} color="blue.500" />
              <Heading size="lg" color="gray.800">
                Gestão de Fretes
              </Heading>
            </HStack>
            <Button variant="ghost" colorScheme="blue" onClick={handleVoltarInicio} leftIcon={<FiArrowLeft />} _hover={{ bg: 'blue.50' }}>
              Voltar
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <ResumoFretes />

        <Tabs variant="soft-rounded" colorScheme="blue" defaultIndex={0} isLazy>
          <TabList
            mb={6}
            gap={2}
            as={motion.div}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            overflowX="auto"
            py={2}
            css={{
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
            }}
          >
            <Tab fontWeight="semibold" px={6} py={3} borderRadius="full" _selected={{ color: 'white', bg: 'orange.500' }}>
              <HStack spacing={2}>
                <Icon as={FiTruck} />
                <Text>Aceitar ({fretesParaAceitar.length})</Text>
              </HStack>
            </Tab>
            <Tab fontWeight="semibold" px={6} py={3} borderRadius="full" _selected={{ color: 'white', bg: 'green.500' }}>
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} />
                <Text>Confirmados ({fretesAceitos.length})</Text>
              </HStack>
            </Tab>
            <Tab fontWeight="semibold" px={6} py={3} borderRadius="full" _selected={{ color: 'white', bg: 'purple.500' }}>
              <HStack spacing={2}>
                <Icon as={FiDollarSign} />
                <Text>Concluídos ({fretesConcluidos.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <MotionFlex direction="column" variants={tabVariants} initial="hidden" animate="visible">
                {fretesParaAceitar.length === 0 ? (
                  <EmptyState message="Não há fretes pendentes para aceitar." />
                ) : (
                  fretesParaAceitar.map((frete, index) => <FreteCard key={frete.id} frete={frete} index={index} />)
                )}
              </MotionFlex>
            </TabPanel>

            <TabPanel p={0}>
              <MotionFlex direction="column" variants={tabVariants} initial="hidden" animate="visible">
                {fretesAceitos.length === 0 ? (
                  <EmptyState message="Você não possui fretes confirmados." />
                ) : (
                  fretesAceitos.map((frete, index) => <FreteCard key={frete.id} frete={frete} index={index} />)
                )}
              </MotionFlex>
            </TabPanel>

            <TabPanel p={0}>
              <MotionFlex direction="column" variants={tabVariants} initial="hidden" animate="visible">
                {fretesConcluidos.length === 0 ? (
                  <EmptyState message="Você não possui fretes concluídos." />
                ) : (
                  fretesConcluidos.map((frete, index) => <FreteCard key={frete.id} frete={frete} index={index} />)
                )}
              </MotionFlex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
