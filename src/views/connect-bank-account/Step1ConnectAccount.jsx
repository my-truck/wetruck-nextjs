import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Flex,
  useToast,
} from '@chakra-ui/react';
import axiosInstance from '../../axiosInstance';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function Step1ConnectAccount({ onNext }) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleConnectAccount = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post('/stripe/custom-connect/create');
      toast({
        title: 'Conta criada com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onNext(); // Avança para a próxima etapa
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={5}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
      maxW="600px"
      mx="auto"
      mt={10}
    >
      {/* Indicador de progresso */}
      <Flex justify="center" mb={6}>
        <Flex direction="row" wrap="nowrap" align="center" gap={4}>
          <Box
            bg="blue.500"
            color="white"
            w="40px"
            h="40px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            1
          </Box>
          <Box
            bg="gray.300"
            color="white"
            w="40px"
            h="40px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            2
          </Box>
          <Box
            bg="gray.300"
            color="white"
            w="40px"
            h="40px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            3
          </Box>
        </Flex>
      </Flex>

      <VStack spacing={4} textAlign="center">
        <Heading size="lg">Conectar Conta Bancária</Heading>
        <Text>
          Clique no botão abaixo para conectar sua conta bancária ao Stripe.
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleConnectAccount}
          isLoading={isLoading}
        >
          Conectar Conta
        </Button>
      </VStack>
    </MotionBox>
  );
}
