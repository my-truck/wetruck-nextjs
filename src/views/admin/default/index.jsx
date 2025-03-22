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
  Flex,
  Badge,
  Container,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaMapMarkerAlt, FaSearch, FaUserAlt } from 'react-icons/fa';

// Imagem
import dashboardImage from '../../../assets/images/svg.png';

export default function UserReports() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Cores principais
  const primaryColor = "#F27A1A"; // Laranja
  const secondaryColor = "#002F34"; // Azul escuro
  const bgLight = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue(secondaryColor, "white");

  // Verificação de autenticação + busca da role no LocalStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);

      // Pegamos a role que já foi salva no LocalStorage no momento do login
      const roleInStorage = localStorage.getItem('Role');
      if (roleInStorage) {
        setUserRole(roleInStorage);
      } else {
        // Fallback caso não haja "Role" salva
        setUserRole('CUSTOMER');
      }

    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  // Exibe Spinner enquanto não sabe se está autenticado
  if (isAuthenticated === null) {
    return (
      <Center height="100vh" bg={bgLight}>
        <Spinner size="xl" color={primaryColor} thickness="4px" />
      </Center>
    );
  }

  // Função que retorna o conteúdo específico para cada role
  const getContent = () => {
    if (userRole === 'DRIVER') {
      return {
        title1: "Encontre cargas",
        title2: "para sua próxima viagem",
        subtitle:
          "Conectamos você com fretadores que precisam de seus serviços. Encontre cargas disponíveis e gerencie seus fretes em um só lugar.",
        primaryButton: {
          text: "Ver Cargas Disponíveis",
          action: () => navigate('/admin/cargas-disponiveis'),
          icon: FaSearch
        },
        secondaryButton: {
          text: "Minhas Viagens",
          action: () => navigate('/admin/minhas-viagens'),
          icon: FaTruck
        },
        highlights: [
          { icon: FaTruck, text: "Cargas verificadas" },
          { icon: FaMapMarkerAlt, text: "Rotas otimizadas" },
          { icon: FaUserAlt, text: "Clientes confiáveis" },
        ],
      };
    } else {
      // Role CUSTOMER (ou fallback)
      return {
        title1: "Faça seu pedido",
        title2: "de forma fácil",
        subtitle:
          "Seu frete com segurança. Torne-se nosso parceiro e anuncie seu frete, clique em \"Sou Motorista\".",
        primaryButton: {
          text: "Sou Motorista",
          action: () => navigate('/admin/motorista'),
          icon: FaTruck
        },
        secondaryButton: {
          text: "Preciso de um Frete",
          action: () => navigate('/admin/frete'),
          icon: FaSearch
        },
        highlights: [
          { icon: FaTruck, text: "Motoristas verificados" },
          { icon: FaMapMarkerAlt, text: "Entregas em todo o Brasil" },
          { icon: FaUserAlt, text: "Experiência garantida" },
        ],
      };
    }
  };

  const content = getContent();

  return (
    <Box
      width="100%"
      bg={bgLight}
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      position="relative"
    >
      {/* Elementos de design decorativos */}
      <Box
        position="absolute"
        top="0"
        right="0"
        height="300px"
        width="300px"
        borderRadius="full"
        bg={`${primaryColor}20`}
        transform="translate(100px, -150px)"
        zIndex="0"
      />
      <Box
        position="absolute"
        bottom="0"
        left="0"
        height="400px"
        width="400px"
        borderRadius="full"
        bg={`${secondaryColor}10`}
        transform="translate(-200px, 200px)"
        zIndex="0"
      />

      {/* Conteúdo principal */}
      <Container maxW="1200px" zIndex="1" mt="-5%">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          py={{ base: 8, md: 12 }}
          px={{ base: 4, md: 0 }}
        >
          {/* Coluna de texto/descrição */}
          <VStack
            spacing={{ base: 6, md: 8 }}
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            width={{ base: "100%", lg: "50%" }}
            pr={{ base: 0, lg: 8 }}
            mb={{ base: 8, lg: 0 }}
          >
            <Badge 
              colorScheme="orange" 
              fontSize="md" 
              px="4" 
              py="2" 
              borderRadius="full"
              bg={`${primaryColor}20`}
              color={primaryColor}
              fontWeight="bold"
            >
              {userRole === 'DRIVER' ? 'Área do Motorista' : 'Área do Cliente'}
            </Badge>
            
            <Box>
              <Text
                fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                fontWeight="900"
                fontFamily="'Work Sans', sans-serif"
                lineHeight="1.1"
                pb={2}
                color={textColor}
              >
                {content.title1}{" "}
                <Text as="span" color={primaryColor}>
                  {content.title2}
                </Text>
              </Text>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="medium"
                color="gray.600"
                maxW={{ base: "100%", lg: "90%" }}
                mt={4}
              >
                {content.subtitle}
              </Text>
            </Box>
            
            {/* Destaques com ícones */}
            <Flex 
              width="100%" 
              justify={{ base: "center", lg: "flex-start" }}
              wrap="wrap"
              gap={4}
              mt={6}
            >
              {content.highlights.map((highlight, index) => (
                <HStack 
                  key={index} 
                  spacing={3} 
                  p={3} 
                  borderRadius="md"
                  bg={`${primaryColor}05`}
                  border="1px"
                  borderColor={`${primaryColor}20`}
                >
                  <Center 
                    bg={`${primaryColor}20`}
                    p={2}
                    borderRadius="md"
                    color={primaryColor}
                  >
                    <Icon as={highlight.icon} boxSize={5} />
                  </Center>
                  <Text fontWeight="medium">{highlight.text}</Text>
                </HStack>
              ))}
            </Flex>

            {/* Botões */}
            <HStack
              spacing={4}
              mt={4}
              flexWrap={{ base: "wrap", md: "nowrap" }}
              width="100%"
              justify={{ base: "center", lg: "flex-start" }}
            >
              <Button
                size="lg"
                bg={primaryColor}
                color="white"
                px={8}
                py={7}
                _hover={{ bg: `${primaryColor}d0` }}
                _active={{ bg: `${primaryColor}b0` }}
                borderRadius="full"
                fontWeight="bold"
                leftIcon={<Icon as={content.primaryButton.icon} />}
                onClick={content.primaryButton.action}
                boxShadow="md"
              >
                {content.primaryButton.text}
              </Button>
              <Button
                size="lg"
                variant="outline"
                px={8}
                py={7}
                borderColor={secondaryColor}
                color={secondaryColor}
                borderWidth="2px"
                _hover={{ bg: `${secondaryColor}10` }}
                borderRadius="full"
                fontWeight="bold"
                leftIcon={<Icon as={content.secondaryButton.icon} />}
                onClick={content.secondaryButton.action}
              >
                {content.secondaryButton.text}
              </Button>
            </HStack>
          </VStack>

          {/* Imagem ilustrativa */}
          <Box
            width={{ base: "100%", lg: "50%" }}
            position="relative"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Image
              src={dashboardImage}
              alt="Ilustração de pedidos de frete"
              maxW="90%"
              objectFit="contain"
              zIndex="1"
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
