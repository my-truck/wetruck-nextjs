import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Spinner,
  Center,
  Text,
  VStack,
  Grid,
  GridItem,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../../contexts/FormContext';

// Import framer-motion
import { motion } from 'framer-motion';

import "./FreightSelection.css";

import residentialTruck from '../../assets/images/residentialTruck.png';
import commercialTruck from '../../assets/images/commercialTruck.png';
import heavyLoad from '../../assets/images/heavyLoad.png';
import refrigeratedTruck from '../../assets/images/refrigeratedTruck.png';
import specialTruck from '../../assets/images/specialTruck.png';

import FreightCard from './componentes/FreightCard';
import { freightToAxes } from '../../utils/freightMapping';

export default function FreightSelection() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();
  const { updateFormData } = useContext(FormContext);
  const toast = useToast();

  // Variants do container (stagger)
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Variants de cada item (card)
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

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

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return (
      <Center height="100vh" bg="white">
        <Spinner size="xl" />
      </Center>
    );
  }

  const handleSelectFreight = (categoria, subcategoria) => {
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

    updateFormData({ categoria, subcategoria, classTypeId, vehicleTypeId });
    const allowedAxes = freightToAxes[categoria] || [];
    updateFormData({ allowedAxes });
    navigate('/admin/dadoscarga');
  };

  return (
    <Box
      width="100%"
      bg="white"
      p={4}
      display="flex"
      alignItems="center"
      justifyContent="center"
      mt={{ base: 0, lg: 20 }}
    >
      <VStack
        spacing={4}
        maxW={{ base: "100%", md: "90%", lg: "80%" }}
        align="center"
        textAlign="center"
        width="100%"
      >
        {/* Botão de Voltar */}
        <Box alignSelf="flex-start">
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

        {/* Container animado do Framer Motion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ width: '100%' }}
        >
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(3, auto)',
              lg: 'repeat(5, auto)',
            }}
            gap={{ base: 2, md: 4 }}
            justifyContent="center"    // Centraliza os cards
            width="100%"
          >
            <GridItem as={motion.div} variants={itemVariants}>
              <FreightCard
                image={residentialTruck}
                alt="Frete Residencial"
                title="Frete Residencial"
                categoria="Frete Residencial"
                subcategoria="Carga Geral"
                onSelect={handleSelectFreight}
              />
            </GridItem>

            <GridItem as={motion.div} variants={itemVariants}>
              <FreightCard
                image={commercialTruck}
                alt="Frete Comercial"
                title="Frete Comercial"
                categoria="Frete Comercial"
                subcategoria="Conteinerizada"
                onSelect={handleSelectFreight}
              />
            </GridItem>

            <GridItem as={motion.div} variants={itemVariants}>
              <FreightCard
                image={heavyLoad}
                alt="Frete Cargas Pesadas"
                title="Frete Cargas Pesadas"
                categoria="Frete Cargas Pesadas"
                subcategoria="Granel Sólido"
                onSelect={handleSelectFreight}
              />
            </GridItem>

            <GridItem as={motion.div} variants={itemVariants}>
              <FreightCard
                image={refrigeratedTruck}
                alt="Frete Refrigerado"
                title="Frete Refrigerado ou Congelado"
                categoria="Frete Refrigerado, Congelado ou Aquecido"
                subcategoria="Frigorificada ou Aquecida"
                onSelect={handleSelectFreight}
              />
            </GridItem>

            <GridItem as={motion.div} variants={itemVariants}>
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
        </motion.div>
      </VStack>
    </Box>
  );
}
