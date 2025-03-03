
import React, { useEffect, useState } from 'react';
import {
  Box,
  Spinner,
  Center,
  Text,
  Button,
  Image,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom'; // Utilizando react-router-dom

// Corrige o caminho da imagem
import dashboardImage from '../../../assets/images/svg.png';

export default function UserReports() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  // Redireciona para a página de login se não estiver autenticado
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  // Estado de carregamento ou verificação em progresso
  if (isAuthenticated === null) {
    return (
      <Center height="100vh" bg="white">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box
      width="100%"
      bg="white"
      p={4}
      pt="0"
      pb="0"
      overflow="hidden"
      border="none"
      boxShadow="none"
      display="flex"
      alignItems="flex-start" // Alinha ao topo
      justifyContent="center"
      minHeight="100vh" // Garante que o Box ocupe pelo menos a altura total da tela
    >
      <VStack
        spacing={4}
        maxW={{ base: "100%", md: "80%", lg: "60%" }}
        align="center"
        textAlign="center"
        width="100%"
        border="none"
        boxShadow="none"
        bg="white"
        mt="60px" // Remove a margem superior
        mb="0" // Garante que não há margem inferior
      >
        {/* Título para Desktop e Mobile, com espessura maior no desktop */}
        <Text
          fontSize={{ base: "28px", md: "40px", lg: "48px" }}
          fontWeight={{ base: "extrabold", md: "extrabold" }}
          fontFamily="'Work Sans', sans-serif"
          textAlign="center"
          maxW="85%"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="block">
            Faça seu pedido
          </Text>
          <Text as="span" color="#ED8936" display="block">
            de forma fácil
          </Text>
        </Text>

        {/* Subtítulo com largura expandida no mobile */}
        <Text
          fontSize={{ base: "16px", md: "18px", lg: "20px" }}
          fontWeight="semibold"
          fontFamily="'Inter', sans-serif"
          color="gray.600"
          px={{ base: 4, md: 8 }}
          maxW={{ base: "100%", md: "80%", lg: "50%" }}
          width="100%" // Estica a largura no mobile
        >
          Seu frete com segurança. Torne-se nosso parceiro e
          anuncie seu frete, clique em
          "Sou Motorista".
        </Text>

        {/* Botões de ação lado a lado */}
        <HStack
          spacing={4}
          mt="8px"
          flexWrap="nowrap"
          justify="center"
        >
          <Button
            colorScheme="orange"
            size={{ base: "md", md: "lg" }}
            fontWeight="bold"
            onClick={() => navigate('/admin/motorista')} // Navegação programática
          >
            Sou Motorista
          </Button>
          <Button
            variant="outline"
            colorScheme="gray"
            size={{ base: "md", md: "lg" }}
            fontWeight="bold"
            onClick={() => navigate('/admin/frete')} // Navegação programática
          >
            Preciso de um Frete
          </Button>
        </HStack>

        {/* Imagem ilustrativa */}
        <Image
          src={dashboardImage}
          alt="Ilustração de pedidos de frete"
          boxSize={{ base: "300px", md: "450px", lg: "540px" }}
          objectFit="contain"
          mt={{ base: "-20px", md: "0px" }} // Ajuste de margem no mobile
        />
      </VStack>
    </Box>
  );
}
