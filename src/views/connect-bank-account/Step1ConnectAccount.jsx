// Step1ConnectAccount.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useToast,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaLink, FaCheck } from 'react-icons/fa';
import axiosInstance from '../../axiosInstance';

const MotionBox = motion(Box);

export default function Step1ConnectAccount({ onNext }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleConnectAccount = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post('/stripe/custom-connect/create');
      setIsCreated(true);
      toast({
        title: 'Conta criada com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Delay para mostrar a confirmação antes de avançar
      setTimeout(() => {
        onNext();
      }, 1500);
      
    } catch (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      mx="auto"
    >
      <VStack spacing={6} textAlign="center">
        <Box 
          p={4} 
          bg="blue.50" 
          borderRadius="full" 
          color="blue.500"
        >
          <Icon 
            as={isCreated ? FaCheck : FaLink} 
            boxSize={12} 
            transition="all 0.3s"
          />
        </Box>
        
        <Heading size="lg" color="blue.600">
          Conectar Conta Bancária
        </Heading>
        
        <Text color="gray.600" fontSize="md" maxW="400px">
          Para receber seus pagamentos, precisamos conectar sua conta bancária ao nosso sistema de processamento seguro. 
          Clique no botão abaixo para iniciar.
        </Text>
        
        <Button
          size="lg"
          colorScheme="blue"
          onClick={handleConnectAccount}
          isLoading={isLoading}
          loadingText="Conectando..."
          disabled={isCreated}
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s"
          width="100%"
          maxW="300px"
          mt={4}
          leftIcon={<FaLink />}
        >
          {isCreated ? 'Conta Conectada' : 'Conectar Conta'}
        </Button>
      </VStack>
    </MotionBox>
  );
}