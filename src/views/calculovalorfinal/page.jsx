import React, { useEffect, useContext, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  Spinner,
  useToast,
  HStack,
  Icon,
  Stack,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../../contexts/FormContext';
import axios from '../../axiosInstance';
import moment from 'moment-timezone';
import CaminhaoModelo from '../../assets/images/caminhaomodelo.png';
import PaymentOptionsModal from './PaymentOptionsModal'; // componente de pagamento

export default function CalculoValorFinal() {
  const { formData, updateFormData, resetFormData } = useContext(FormContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [valorFinal, setValorFinal] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  // Mapeamentos reversos para tipos de carga
  const categoriaParaId = {
    'Frete Residencial': 1,
    'Frete Comercial': 2,
    'Frete Cargas Pesadas': 3,
    'Frete Refrigerado, Congelado ou Aquecido': 4,
    'Frete Cargas Especiais': 5,
  };
  const subcategoriaParaId = {
    'Carga Geral': 1,
    Conteinerizada: 2,
    'Granel Sólido': 3,
    'Granel Líquido': 4,
    Neogranel: 5,
    'Carga Granel Pressurizada': 6,
    'Frigorificada ou Aquecida': 7,
    'Perigosa (frigorificada ou aquecida)': 8,
    'Perigosa (granel sólido)': 9,
    'Perigosa (granel líquido)': 10,
    'Perigosa (conteinerizada)': 11,
  };
  const idParaCategoria = Object.fromEntries(
    Object.entries(categoriaParaId).map(([key, value]) => [value, key])
  );
  const idParaSubcategoria = Object.fromEntries(
    Object.entries(subcategoriaParaId).map(([key, value]) => [value, key])
  );

  const calcularValor = useCallback(async () => {
    try {
      setLoading(true);
      const categoriaString = idParaCategoria[formData.classTypeId];
      const subcategoriaString = idParaSubcategoria[formData.vehicleTypeId];
      if (!categoriaString || !subcategoriaString) {
        throw new Error('Categoria ou Subcategoria inválida.');
      }
      let axleNumber = formData.eixoNumber;
      if (axleNumber === 1 || axleNumber === 2) {
        axleNumber = 2;
      }
      const requestBody = {
        origins: `${formData.origin.address}, ${formData.origin.city}, ${formData.origin.state}, ${formData.origin.postalCode}`,
        destinations: `${formData.destination.address}, ${formData.destination.city}, ${formData.destination.state}, ${formData.destination.postalCode}`,
        loadType: [categoriaString, subcategoriaString],
        axle: axleNumber,
      };
      const response = await axios.post('/work/calculate-freight', requestBody);
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Erro no cálculo do frete');
      }
      const dadosFrete = response.data.data;
      const totalFreight = Number(dadosFrete.totalFreight);
      if (isNaN(totalFreight)) {
        throw new Error('O valor total do frete não é um número válido.');
      }
      setValorFinal(totalFreight);
      setDetalhes([
        `Nome: ${dadosFrete.name}`,
        `Descrição: ${dadosFrete.description}`,
        `Distância: ${dadosFrete.distance} km`,
        `Tipo de Carga: ${dadosFrete.typeOfLoad}`,
        `Tipo de Caminhão: ${dadosFrete.typeOfTruck}`,
      ]);
      updateFormData({
        value: totalFreight,
        distance: dadosFrete.distance,
      });
      setHasCalculated(true);
    } catch (error) {
      console.error('Erro ao calcular o frete:', error);
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [formData, idParaCategoria, idParaSubcategoria, updateFormData, toast]);

  useEffect(() => {
    // Verifica se os campos obrigatórios foram preenchidos
    const requiredFields = [
      'origin',
      'destination',
      'classTypeId',
      'vehicleTypeId',
      'eixoNumber',
    ];
    const missingFields = requiredFields.filter((field) => {
      if (field === 'origin' || field === 'destination') {
        return (
          !formData[field] ||
          !formData[field].address ||
          !formData[field].city ||
          !formData[field].state ||
          !formData[field].postalCode
        );
      }
      return !formData[field];
    });
    if (missingFields.length > 0) {
      toast({
        title: 'Etapas Incompletas',
        description: `Complete todas as etapas. Faltando: ${missingFields.join(', ')}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/freight-selection');
      return;
    }
    if (!hasCalculated) {
      calcularValor();
    }
  }, [calcularValor, formData, hasCalculated, navigate, toast]);

  // Função que monta o payload e envia a requisição para criar o pedido
  const processPayment = async (paymentType, paymentMethodId) => {
    try {
      setLoading(true);
      const categoriaString = idParaCategoria[formData.classTypeId];
      const subcategoriaString = idParaSubcategoria[formData.vehicleTypeId];
      if (!categoriaString || !subcategoriaString) {
        throw new Error('Categoria ou Subcategoria inválida.');
      }
      let axleNumber = formData.eixoNumber;
      if (axleNumber === 1 || axleNumber === 2) {
        axleNumber = 2;
      }
      // Se for um novo método, paymentMethodId estará preenchido; caso contrário, envia um objeto vazio.
      const pedidoBody = {
        workDetails: {
          origins: `${formData.origin.address}, ${formData.origin.city}, ${formData.origin.state}, ${formData.origin.postalCode}`,
          destinations: `${formData.destination.address}, ${formData.destination.city}, ${formData.destination.state}, ${formData.destination.postalCode}`,
          loadType: [categoriaString, subcategoriaString],
          axle: axleNumber,
        },
        paymentMethod: 'stripe',
        paymentData: paymentMethodId ? { paymentMethodId } : {},
        scheduleStart: moment(formData.scheduleStart)
          .tz('America/Sao_Paulo')
          .toISOString(),
        scheduleEnd: moment(formData.scheduleEnd)
          .tz('America/Sao_Paulo')
          .toISOString(),
      };

      const response = await axios.post('/work', pedidoBody);
      if (response.status >= 200 && response.status < 300) {
        const pedidoId = response.data.data?.id || response.data.id || 'N/A';
        toast({
          title: 'Pedido realizado com sucesso',
          description: `Seu pedido foi criado com ID: ${pedidoId}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        resetFormData();
        navigate('/admin/default');
      } else {
        throw new Error(response.data.message || 'Erro ao criar o pedido');
      }
    } catch (error) {
      console.error('Erro ao criar o pedido:', error);
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Abre a modal de pagamento
  const handlePedirAgora = () => {
    setPaymentModalOpen(true);
  };

  if (loading) {
    return (
      <Box
        bg="white"
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={8}
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
      mt={{ base: 0, md: '-100px' }}
    >
      <VStack spacing={8} align="center" maxW="1200px" w="100%">
        <Text
          fontSize={{ base: '28px', md: '40px' }}
          fontWeight="extrabold"
          fontFamily="'Work Sans', sans-serif"
          textAlign="center"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748">
            Cálculo do
          </Text>{' '}
          <Text as="span" color="#ED8936">
            Valor Final
          </Text>
        </Text>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={8}
          align="center"
          justify="center"
          w="100%"
        >
          <VStack
            bg="#E6F0FB"
            borderRadius="24px"
            boxShadow="lg"
            p={4}
            w={{ base: '100%', md: '50%' }}
            align="center"
            spacing={4}
          >
            <Box
              w={{ base: '100%', md: '400px' }}
              h={{ base: '300px', md: '400px' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="24px"
              overflow="hidden"
            >
              <Image
                src={CaminhaoModelo}
                alt="Caminhão"
                objectFit="contain"
                w="100%"
                h="100%"
              />
            </Box>
          </VStack>
          <VStack
            align="flex-start"
            spacing={4}
            w={{ base: '100%', md: '40%' }}
            pl={{ base: 0, md: 4 }}
          >
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              color="#2D3748"
            >
              {formData.detalhesCarga || 'Descrição da Carga'}
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500">
              {formData.dimensoes || 'Dimensões da Carga'}
            </Text>
            <Text
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold"
              color="#ED8936"
            >
              {valorFinal !== null
                ? `R$ ${valorFinal.toFixed(2)}`
                : 'Calculando...'}
            </Text>
            {detalhes && detalhes.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                fontSize={{ base: 'sm', md: 'md' }}
                color="gray.700"
              >
                {detalhes.map((item, index) => (
                  <HStack key={index}>
                    <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                    <Text>{item}</Text>
                  </HStack>
                ))}
              </VStack>
            )}
            <HStack spacing={4} mt={4} w="100%" justifyContent="space-between">
              <Button
                variant="outline"
                colorScheme="red"
                size="lg"
                w="45%"
                onClick={() => navigate('/admin/default')}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                size="lg"
                w="45%"
                onClick={handlePedirAgora}
              >
                Pedir agora
              </Button>
            </HStack>
          </VStack>
        </Stack>
      </VStack>

      {/* Modal de opções de pagamento */}
      <PaymentOptionsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        handlePayment={processPayment}
      />
    </Box>
  );
}
