import React from 'react';
import { Box, Text, Heading, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const PlansPage = () => {
  const navigate = useNavigate();

  return (
    <Box p={8} minH="100vh" bg="gray.50">
      <VStack spacing={6} align="center">
        <Heading>Planos de Assinatura</Heading>
        <Text>Aproveite nossos planos para fazer consultas ilimitadas.</Text>
        {/* Aqui você pode adicionar mais informações sobre os planos */}

        <Button colorScheme="blue" onClick={() => navigate('/')}>
          Voltar para o início
        </Button>
      </VStack>
    </Box>
  );
};

export default PlansPage;
