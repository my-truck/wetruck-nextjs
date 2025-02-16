// src/views/calculovalorfinal/page.jsx

import React, { useEffect, useContext, useState } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../../contexts/FormContext';
import axios from '../../axiosInstance';
import moment from 'moment-timezone';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import CaminhaoModelo from '../../assets/images/caminhaomodelo.png';
import StripeLogo from '../../assets/images/2035148938.png'; // ajuste o caminho conforme sua estrutura

// Componente de Modal para opções de pagamento
const PaymentOptionsModal = ({ isOpen, onClose, handlePayment }) => {
  const [paymentChoice, setPaymentChoice] = useState('saved'); // 'saved' ou 'new'
  const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const boxBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  const elementStyle = {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (paymentChoice === 'new') {
        if (!stripe || !elements) {
          console.error('Stripe ou Elements não foram inicializados.');
          setLoading(false);
          return;
        }
        // Obtém o elemento do número do cartão (os demais elementos já fazem parte dele)
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          console.error('Elemento de cartão não encontrado.');
          setLoading(false);
          return;
        }
        const { error, paymentMethod: stripePaymentMethod } =
          await stripe.createPaymentMethod({
            type: 'card',
            card: cardNumberElement,
          });
        if (error) {
          console.error('Erro ao criar PaymentMethod:', error);
          setLoading(false);
          return;
        }
        // Chama a função de pagamento passando o id gerado
        await handlePayment('new', stripePaymentMethod.id);
      } else {
        // Se o usuário optou por usar o cartão salvo, você pode obter o id do cartão salvo (por exemplo, do formData)
        // Neste exemplo, chamamos a função com "saved" (você pode adaptar conforme sua lógica)
        await handlePayment('saved');
      }
      onClose();
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Escolha o método de pagamento</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box bg={boxBg} boxShadow="md" borderRadius="md" p={4}>
            <RadioGroup
              onChange={setPaymentChoice}
              value={paymentChoice}
              mb={6}
            >
              <VStack align="start" spacing={4}>
                <Radio value="saved">Usar cartão salvo</Radio>
                <Radio value="new">Adicionar novo cartão</Radio>
              </VStack>
            </RadioGroup>
            {paymentChoice === 'new' && (
              <VStack spacing={3} align="stretch">
                {/* Número do Cartão */}
                <Box
                  border="1px solid"
                  borderColor={borderColor}
                  p={3}
                  borderRadius="md"
                  w="100%"
                >
                  <CardNumberElement
                    options={{
                      placeholder: 'Número do Cartão',
                      style: elementStyle,
                    }}
                  />
                </Box>
                {/* Validade e CVC */}
                <HStack w="100%" spacing={3}>
                  <Box
                    flex="1"
                    border="1px solid"
                    borderColor={borderColor}
                    p={3}
                    borderRadius="md"
                  >
                    <CardExpiryElement
                      options={{
                        placeholder: 'Validade (MM/AA)',
                        style: elementStyle,
                      }}
                    />
                  </Box>
                  <Box
                    flex="1"
                    border="1px solid"
                    borderColor={borderColor}
                    p={3}
                    borderRadius="md"
                  >
                    <CardCvcElement
                      options={{
                        placeholder: 'CVC',
                        style: elementStyle,
                      }}
                    />
                  </Box>
                </HStack>
              </VStack>
            )}
            <HStack mt={4} spacing={4} justify="center" align="center">
              <Box
                as="img"
                src={StripeLogo}
                alt="Stripe"
                h="40px"
                objectFit="contain"
              />
              <HStack spacing={1}>
                <FaLock color="#3996C0" size="13px" />
                <Text fontSize="sm" color="gray.600">
                  Criptografia Avançada
                </Text>
              </HStack>
            </HStack>
          </Box>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              bg="blue.500"
              color="white"
              _hover={{ bg: 'blue.600' }}
              onClick={handleSubmit}
              isLoading={loading}
              minWidth="150px"
            >
              {loading ? <Spinner /> : 'Confirmar Pagamento'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function CalculoValorFinal() {
  const { formData, updateFormData, resetFormData } = useContext(FormContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [valorFinal, setValorFinal] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  // Instâncias do Stripe para o componente principal (usado pela modal)
  const stripe = useStripe();
  const elements = useElements();

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
    Object.entries(categoriaParaId).map(([key, value]) => [value, key]),
  );
  const idParaSubcategoria = Object.fromEntries(
    Object.entries(subcategoriaParaId).map(([key, value]) => [value, key]),
  );

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
        description: `Complete todas as etapas. Faltando: ${missingFields.join(
          ', ',
        )}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, hasCalculated, navigate, toast]);

  const calcularValor = async () => {
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
  };

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
      const pedidoBody = {
        workDetails: {
          origins: formData.originCoordinates || '-20.3475276, -40.3365387',
          destinations:
            formData.destinationCoordinates || '-20.3475264, -40.3545634',
          loadType: [categoriaString, subcategoriaString],
          axle: axleNumber,
        },
        paymentMethod: 'stripe',
        paymentData: {
          // Se o usuário escolheu "new", usamos o paymentMethodId criado; caso contrário, você pode buscar o cartão salvo
          paymentMethodId: paymentMethodId || null,
          savePaymentMethod:
            formData.savePaymentMethod !== undefined
              ? formData.savePaymentMethod
              : true,
        },
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
