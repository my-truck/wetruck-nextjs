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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../axiosInstance';
import AcceptButton from '../../components/menu/AcceptButton';

// Enum para status de pagamento e frete
const FRETE_STATUS = {
  AUTHORIZED: 'authorized',
  PAID: 'paid',
  COMPLETED: 'completed',
};

// Variantes para a animação dos cards (efeito cascata)
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

const MotionBox = motion(Box);

export default function FreteDetalhes() {
  const navigate = useNavigate();
  const toast = useToast();
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar dados de frete
  const fetchFreteData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/work');
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [response.data];
      setFretes(data);
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

  // Funções de navegação
  const handleVoltarInicio = () => navigate('/admin/default');
  const handleVerMais = () => navigate('/corridas');

  // Componentes de estados
  const LoadingState = () => (
    <Box
      w="100%"
      bg="#F6F8FA"
      p={{ base: 4, md: 8 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
    >
      <Spinner size="xl" color="teal.500" />
    </Box>
  );

  const ErrorState = ({ message }) => (
    <Box
      w="100%"
      bg="#F6F8FA"
      p={{ base: 4, md: 8 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
    >
      <Text color="red.500" fontSize="lg">
        Erro: {message}
      </Text>
    </Box>
  );

  const EmptyState = ({ message }) => (
    <Box
      w="100%"
      bg="#F6F8FA"
      p={{ base: 4, md: 8 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
    >
      <Text fontSize="lg" color="gray.600">
        {message}
      </Text>
    </Box>
  );

  // Determina propriedades do badge com base no status
  const getBadgeProps = (frete) => {
    if (frete.paymentStatus === FRETE_STATUS.AUTHORIZED) {
      return { label: 'Aguardando Aceite', color: 'orange' };
    }
    if (frete.paymentStatus === FRETE_STATUS.PAID) {
      return { label: 'Pedido Confirmado', color: 'green' };
    }
    if (frete.status === FRETE_STATUS.COMPLETED) {
      return { label: 'Frete Finalizado', color: 'purple' };
    }
    return { label: 'Desconhecido', color: 'gray' };
  };

  // Card de frete com animação e hover mais suave
  const FreteCard = ({ frete, index }) => {
    const { label } = getBadgeProps(frete);
    const podeAceitar = frete.paymentStatus === FRETE_STATUS.AUTHORIZED;

    return (
      <MotionBox
        bg="white"
        boxShadow="md"
        borderRadius="lg"
        p={{ base: 4, md: 6 }}
        mb={4}
        borderLeftWidth={4}
        // Borda laranja conforme solicitado
        borderLeftColor="orange.500"
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="center">
            <Badge colorScheme="orange" fontSize="sm" variant="subtle">
              {label}
            </Badge>
            <Text fontSize="sm" color="gray.600">
              Solicitado em:{' '}
              <Text as="span" fontWeight="bold" color="red.500">
                {new Date(frete.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </Text>
          </HStack>

          <VStack align="stretch" spacing={1}>
            <Text fontWeight="bold" fontSize="lg" color="#2D3748">
              {frete.name || 'Frete sem nome'}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="#2D3748">
              Valor: R${parseFloat(frete.amount || 0).toFixed(2)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {frete.description || '(Sem descrição)'}
            </Text>
          </VStack>

          <VStack align="stretch" spacing={1}>
            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="bold">
                Origem:
              </Text>{' '}
              {frete.address?.street || 'N/A'}, {frete.address?.city || 'N/A'}
            </Text>
            <Text fontSize="sm" color="gray.600">
              <Text as="span" fontWeight="bold">
                Destino:
              </Text>{' '}
              {frete.destinationAddress?.street || 'N/A'},{' '}
              {frete.destinationAddress?.city || 'N/A'}
            </Text>
          </VStack>

          <HStack spacing={4} justify={{ base: 'center', md: 'flex-start' }}>
            {podeAceitar && (
              <AcceptButton
                size="md"
                notificationId={String(frete.id)}
                onAccept={() => {
                  toast({
                    title: 'Frete Aceito',
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                  });
                  fetchFreteData();
                }}
              />
            )}
            <Button
              colorScheme="blue"
              onClick={handleVerMais}
              fontWeight="bold"
              size="md"
              px={4}
              py={2}
              transition="background 0.2s ease-out"
              _hover={{ bg: 'blue.600' }}
            >
              Ver Mais
            </Button>
          </HStack>
        </VStack>
      </MotionBox>
    );
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!fretes.length) return <EmptyState message="Nenhum frete encontrado." />;

  // Ajuste nos filtros: os pedidos confirmados são os que retornam paymentStatus "paid"
  const fretesParaAceitar = fretes.filter((f) => f.paymentStatus === FRETE_STATUS.AUTHORIZED);
  const fretesAceitos = fretes.filter((f) => f.paymentStatus === FRETE_STATUS.PAID);
  const fretesConcluidos = fretes.filter((f) => f.status === FRETE_STATUS.COMPLETED);

  return (
    <Box bg="#F6F8FA" minH="100vh" p={{ base: 4, md: 8 }}>
      <Tabs variant="soft-rounded" colorScheme="blue" defaultIndex={0}>
        <TabList mb={4} flexWrap="wrap" gap={2}>
          <Tab fontWeight="semibold" px={4} py={2}>
            Aceitar/Recusar
          </Tab>
          <Tab fontWeight="semibold" px={4} py={2}>
            Pedidos Confirmados
          </Tab>
          <Tab fontWeight="semibold" px={4} py={2}>
            Fretes Concluídos
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            {fretesParaAceitar.length === 0 ? (
              <Text color="gray.500">Nenhum frete pendente.</Text>
            ) : (
              fretesParaAceitar.map((frete, index) => (
                <FreteCard key={frete.id} frete={frete} index={index} />
              ))
            )}
          </TabPanel>
          <TabPanel p={0}>
            {fretesAceitos.length === 0 ? (
              <Text color="gray.500">Nenhum frete aceito.</Text>
            ) : (
              fretesAceitos.map((frete, index) => (
                <FreteCard key={frete.id} frete={frete} index={index} />
              ))
            )}
          </TabPanel>
          <TabPanel p={0}>
            {fretesConcluidos.length === 0 ? (
              <Text color="gray.500">Nenhum frete concluído.</Text>
            ) : (
              fretesConcluidos.map((frete, index) => (
                <FreteCard key={frete.id} frete={frete} index={index} />
              ))
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Button
        variant="outline"
        colorScheme="blue"
        onClick={handleVoltarInicio}
        fontWeight="bold"
        mt={6}
        _hover={{ bg: 'blue.50' }}
      >
        Voltar ao Início
      </Button>
    </Box>
  );
}
