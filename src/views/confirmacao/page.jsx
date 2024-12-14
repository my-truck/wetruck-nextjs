// src/views/confirmacao/page.jsx

import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function Confirmacao() {
  const navigate = useNavigate();

  const handleVoltarInicio = () => {
    navigate('/admin/default'); // conforme a rota inicia
  };

  return (
    <Box
      width="100%"
      bg="gray.50"
      p={{ base: 4, md: 8 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <VStack
        spacing={6}
        bg="white"
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow="lg"
        maxW={{ base: "90%", md: "500px" }}
        w="100%"
        textAlign="center"
      >
        {/* Título de Confirmação */}
        <Text
          fontSize={{ base: "24px", md: "32px", lg: "40px" }}
          fontWeight="extrabold"
          fontFamily="'Work Sans', sans-serif"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="block">
            Confirmação
          </Text>
          <Text as="span" color="#ED8936" display="block">
            Sucesso
          </Text>
        </Text>

        {/* Mensagem de Sucesso */}
        <Box>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            Sua disponibilidade foi definida com sucesso!
          </Text>
        </Box>

        {/* Botão para Voltar ao Início */}
        <Button
          colorScheme="blue"
          onClick={handleVoltarInicio}
          width={{ base: "100%", md: "auto" }}
          height="40px"
          fontSize={{ base: "sm", md: "md" }}
        >
          Voltar ao Início
        </Button>
      </VStack>
    </Box>
  );
}
