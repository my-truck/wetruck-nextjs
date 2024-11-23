// src/views/frete/page.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Spinner,
  Center,
  Text,
  Image,
  VStack,
  Grid,
  GridItem,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../../contexts/FormContext';

// Importação das imagens
import residentialTruck from '../../assets/images/residentialTruck.png';
import commercialTruck from '../../assets/images/commercialTruck.png';
import heavyLoad from '../../assets/images/heavyLoad.png';
import refrigeratedTruck from '../../assets/images/refrigeratedTruck.png';
import specialTruck from '../../assets/images/specialTruck.png';

// Importar o mapeamento de frete para eixos e subcategorias
import { categoryToSubcategories, freightToAxes } from '../../utils/freightMapping';

// Componente reutilizável para os cards com navegação e atualização do formData
const FreightCard = ({ image, alt, title, categoria, subcategoria, onSelect }) => {
  return (
    <Box
      onClick={() => onSelect(categoria, subcategoria)}
      width={{ base: "130px", md: "160px", lg: "200px" }}
      height={{ base: "180px", md: "220px", lg: "260px" }}
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      transition="all 0.3s"
      cursor="pointer"
      _hover={{
        transform: "scale(1.05)",
        boxShadow: "xl",
        bg: "gray.50",
      }}
    >
      <Image
        src={image}
        alt={alt}
        boxSize={{ base: "70px", md: "100px", lg: "120px" }}
        mb={3}
      />
      <Text
        fontWeight="bold"
        color="gray.700"
        fontSize={{ base: "sm", md: "md", lg: "lg" }}
        textAlign="center"
        whiteSpace="normal"
        wordBreak="break-word"
        maxW="100%"
      >
        {title}
      </Text>
    </Box>
  );
};

export default function FreightSelection() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();
  const { updateFormData } = useContext(FormContext);
  const toast = useToast();

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

  // Função para lidar com a seleção do frete
  const handleSelectFreight = (categoria, subcategoria) => {
    // Mapeamento dos IDs
    const categoriaParaId = {
      'Frete Residencial': 1,
      'Frete Comercial': 2,
      'Frete Cargas Pesadas': 3,
      'Frete Refrigerado, Congelado ou Aquecido': 4,
      'Frete Cargas Especiais': 5,
    };

    const subcategoriaParaId = {
      'Carga Geral': 1,
      'Conteinerizada': 2,
      'Granel Sólido': 3,
      'Granel Líquido': 4,
      'Neogranel': 5,
      'Carga Granel Pressurizada': 6,
      'Frigorificada ou Aquecida': 7,
      'Perigosa (frigorificada ou aquecida)': 8,
      'Perigosa (granel sólido)': 9,
      'Perigosa (granel líquido)': 10,
      'Perigosa (conteinerizada)': 11,
      // Adicione outras subcategorias conforme necessário
    };

    const classTypeId = categoriaParaId[categoria];
    const vehicleTypeId = subcategoriaParaId[subcategoria];

    if (!classTypeId || !vehicleTypeId) {
      toast({
        title: "Seleção Inválida",
        description: "Categoria ou subcategoria inválida selecionada.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Atualiza o FormContext com a categoria, subcategoria e IDs selecionados
    updateFormData({ categoria, subcategoria, classTypeId, vehicleTypeId });

    // Armazena os eixos permitidos com base no tipo de frete selecionado
    const allowedAxes = freightToAxes[categoria] || [];
    updateFormData({ allowedAxes });

    // Navega para a próxima etapa
    navigate('/admin/dadoscarga');
  };

  return (
    <Box
      width="100%"
      bg="white"
      p={4}
      pt="0"
      pb="0"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <VStack
        spacing={4}
        maxW={{ base: "100%", md: "90%", lg: "80%" }}
        align="center"
        textAlign="center"
        width="100%"
        mt={{ base: "0", md: "-100px", lg: "-160px" }}
        mb="0"
      >
        {/* Botão de Voltar */}
        <Box alignSelf="flex-start" mb={-2}>
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            size="lg"
            variant="ghost"
            colorScheme="orange"
          />
        </Box>

        {/* Título */}
        <Text
          fontSize={{ base: "24px", md: "44px", lg: "56px" }}
          fontWeight="extrabold"
          fontFamily="'Work Sans', sans-serif"
          textAlign="center"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="block">
            Selecione o frete
          </Text>
          <Text as="span" color="#ED8936" display="block">
            que você precisa!
          </Text>
        </Text>

        {/* Grid de opções de frete */}
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }}
          gap={4}
          mt={4}
          width="100%"
          justifyItems="center"
        >
          <GridItem>
            <FreightCard
              image={residentialTruck}
              alt="Frete Residencial"
              title="Frete Residencial"
              categoria="Frete Residencial"
              subcategoria="Carga Geral"
              onSelect={handleSelectFreight}
            />
          </GridItem>

          <GridItem>
            <FreightCard
              image={commercialTruck}
              alt="Frete Comercial"
              title="Frete Comercial"
              categoria="Frete Comercial"
              subcategoria="Conteinerizada"
              onSelect={handleSelectFreight}
            />
          </GridItem>

          <GridItem>
            <FreightCard
              image={heavyLoad}
              alt="Frete Cargas Pesadas"
              title="Frete Cargas Pesadas"
              categoria="Frete Cargas Pesadas"
              subcategoria="Granel Sólido"
              onSelect={handleSelectFreight}
            />
          </GridItem>

          <GridItem>
            <FreightCard
              image={refrigeratedTruck}
              alt="Frete Refrigerado"
              title="Frete Refrigerado ou Congelado"
              categoria="Frete Refrigerado, Congelado ou Aquecido"
              subcategoria="Frigorificada ou Aquecida"
              onSelect={handleSelectFreight}
            />
          </GridItem>

          <GridItem>
            <FreightCard
              image={specialTruck}
              alt="Frete Cargas Especiais"
              title="Frete Cargas Especiais"
              categoria="Frete Cargas Especiais"
              subcategoria="Perigosa (granel sólido)"
              onSelect={handleSelectFreight}
            />
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
}
