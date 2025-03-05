import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Spinner,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Radio,
  RadioGroup,
  useColorModeValue,
  Flex,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { 
  FaLock, 
  FaCreditCard, 
  FaShieldAlt,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaCcDinersClub,
  FaCcJcb,
} from 'react-icons/fa';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const cardBrandIcons = {
  visa: FaCcVisa,
  mastercard: FaCcMastercard,
  amex: FaCcAmex,
  discover: FaCcDiscover,
  diners: FaCcDinersClub,
  jcb: FaCcJcb,
  // Ícone padrão se necessário
};

const PaymentOptionsModal = ({ isOpen, onClose, handlePayment }) => {
  const [paymentChoice, setPaymentChoice] = useState('saved');
  const [loading, setLoading] = useState(false);
  const [cardLast4, setCardLast4] = useState('');
  const [cardBrand, setCardBrand] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  // Adaptações de cores e responsividade
  const boxBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const accentColor = useColorModeValue('blue.600', 'blue.300');
  const modalSize = useBreakpointValue({ base: 'sm', md: 'lg' });
  const cardLast4Bg = useColorModeValue('gray.100', 'gray.600');

  const elementStyle = {
    base: {
      fontSize: '16px',
      fontFamily: '"Inter", sans-serif',
      color: useColorModeValue('#2D3748', '#E2E8F0'),
      '::placeholder': { 
        color: useColorModeValue('#A0AEC0', '#718096') 
      },
    },
    invalid: {
      color: '#E53E3E',
      iconColor: '#E53E3E'
    }
  };

  // Ao abrir a modal, busca os 4 últimos dígitos do cartão utilizando o token armazenado
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('authToken');
      fetch('https://etc.wetruckhub.com/wallet/payment-method-last4', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data && data.data.last4) {
            setCardLast4(data.data.last4);
          }
        })
        .catch((err) =>
          console.error('Erro ao buscar últimos 4 dígitos:', err)
        );
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (paymentChoice === 'new') {
        if (!stripe || !elements) {
          throw new Error('Erro na configuração de pagamento');
        }
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          throw new Error('Elemento de cartão não encontrado');
        }
        
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardNumberElement,
        });

        if (error) {
          throw error;
        }
        // Chama handlePayment passando o id do payment method para novo método
        await handlePayment('new', paymentMethod.id);
      } else {
        // Se usar cartão salvo, não envia paymentMethodId
        await handlePayment('saved');
      }
      onClose();
    } catch (error) {
      console.error('Erro de pagamento:', error);
      // TODO: Implementar tratamento de erro amigável para o usuário
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered 
      size={modalSize}
      scrollBehavior="inside"
    >
      <ModalOverlay 
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        borderRadius="xl"
        boxShadow="2xl"
        bg={boxBg}
        overflow="hidden"
      >
        <ModalHeader 
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderBottom="1px solid"
          borderColor={borderColor}
          py={5}
        >
          <Flex align="center">
            <Icon as={FaCreditCard} mr={3} color={accentColor} boxSize={6} />
            <Text fontWeight="bold" fontSize="xl">
              Escolha seu método de pagamento
            </Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton 
          m={3} 
          color={useColorModeValue('gray.600', 'gray.200')}
          _hover={{ 
            bg: useColorModeValue('gray.100', 'gray.600'),
            color: useColorModeValue('gray.800', 'white')
          }}
        />
        <ModalBody p={6}>
          <VStack spacing={5} align="stretch">
            <Box 
              bg={useColorModeValue('gray.50', 'gray.700')} 
              p={4} 
              borderRadius="lg"
              boxShadow="md"
            >
              <RadioGroup 
                onChange={setPaymentChoice} 
                value={paymentChoice} 
                mb={4}
              >
                <VStack align="start" spacing={3}>
                  <Radio 
                    value="saved" 
                    colorScheme="blue"
                    size="lg"
                  >
                    <HStack>
                      <Text>Usar cartão salvo</Text>
                      {cardLast4 && (
                        <HStack spacing={1} ml={2}>
                          <Icon as={FaCreditCard} boxSize={4} color="gray.500" />
                          <Text 
                            fontSize="sm" 
                            color="gray.500" 
                            bg={cardLast4Bg} 
                            px={2} 
                            py={1} 
                            borderRadius="md"
                          >
                            Final {cardLast4}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  </Radio>
                  <Radio 
                    value="new" 
                    colorScheme="blue"
                    size="lg"
                  >
                    <Text>Adicionar novo cartão</Text>
                  </Radio>
                </VStack>
              </RadioGroup>

              {paymentChoice === 'new' && (
                <VStack spacing={4} mt={4}>
                  <Box position="relative" w="full" border="1px solid" borderColor={borderColor} p={3} borderRadius="md">
                    <CardNumberElement
                      options={{
                        placeholder: 'Número do Cartão',
                        style: elementStyle,
                      }}
                      onChange={(e) => {
                        if (e.brand) setCardBrand(e.brand);
                      }}
                    />
                    {cardBrand && (
                      <Box position="absolute" right="8px" top="50%" transform="translateY(-50%)">
                        <Icon as={cardBrandIcons[cardBrand] || FaCreditCard} boxSize={6} />
                      </Box>
                    )}
                  </Box>
                  <HStack w="full" spacing={3}>
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
            </Box>

            <Flex 
              justifyContent="center" 
              alignItems="center" 
              bg={useColorModeValue('gray.50', 'gray.700')}
              p={4}
              borderRadius="lg"
              boxShadow="md"
            >
              <VStack spacing={2} textAlign="center">
                <HStack>
                  <Icon as={FaShieldAlt} color="green.500" boxSize={6} />
                  <Text fontWeight="bold" color={useColorModeValue('gray.700', 'gray.200')}>
                    Pagamento 100% Seguro
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Seus dados são criptografados e protegidos com os mais altos padrões de segurança
                </Text>
              </VStack>
            </Flex>
          </VStack>
        </ModalBody>
        <ModalFooter 
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderTop="1px solid"
          borderColor={borderColor}
          py={5}
        >
          <HStack spacing={4} w="full" justifyContent="center">
            <Button 
              variant="outline" 
              onClick={onClose}
              size="lg"
            >
              Cancelar
            </Button>
            <Button
              bg={accentColor}
              color="white"
              _hover={{ 
                bg: useColorModeValue('blue.700', 'blue.400') 
              }}
              onClick={handleSubmit}
              isLoading={loading}
              size="lg"
              leftIcon={<FaLock />}
              minWidth="200px"
            >
              {loading ? <Spinner /> : 'Pagar'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentOptionsModal;
