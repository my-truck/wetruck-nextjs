import React from "react";
import {
  Box,
  Heading,
  Text,
  Progress,
  SimpleGrid,
  Flex,
  Center,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

// Exemplo de dados das etapas
const stepsData = [
  {
    title: "Crie seu Anúncio",
    isCompleted: true,
    description:
      "Anuncie seu Truck e informe o tipo de carga que você pode transportar."
  },
  {
    title: "Complete seu perfil",
    isCompleted: true,
    description:
      "Forneça dados atualizados, incluindo documentos e informações para contato."
  },
  {
    title: "Conecte sua conta bancária",
    isCompleted: false,
    description:
      "Cadastre uma conta para receber pagamentos com segurança e rapidez."
  }
];

export default function FinalizarEtapas() {
  // Cores principais
  const primaryColor = "#F27A1A";  // Laranja
  const secondaryColor = "#002F34"; // Azul escuro/verde
  const bgLight = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue(secondaryColor, "whiteAlpha.900");

  // Cálculo do percentual de conclusão
  const completedSteps = stepsData.filter((step) => step.isCompleted).length;
  const totalSteps = stepsData.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <Box
      minH="100vh"
      w="100%"
      bg={bgLight}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      // Espaço superior e inferior para evitar sobreposição e corte
      pt={{ base: 20, md: 16 }}
      pb={{ base: 20, md: 10 }}
    >
      <Box w="90%" maxW="1200px" textAlign="center">
        {/* Títulos */}
        <Box mb={10}>
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="bold"
            color={textColor}
          >
            Para ser nosso motorista
          </Heading>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="bold"
            color={primaryColor}
            mt={2}
          >
            você precisa finalizar essas etapas!
          </Heading>
        </Box>

        {/* Barra de progresso */}
        <Box maxW="600px" mx="auto" mb={10}>
          <Progress
            value={completionPercentage}
            size="md"
            borderRadius="full"
            colorScheme="orange"
            bg="gray.200"
            h="10px"
          />
          <Text mt={2} fontSize="sm" color="gray.600">
            {completionPercentage}% concluído
          </Text>
        </Box>

        {/* Grid responsivo de cards de etapas */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={8}
          maxW="900px"
          mx="auto"
        >
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              textColor={textColor}
              primaryColor={primaryColor}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}

// Componente individual para cada card de etapa
function StepCard({ step, textColor, primaryColor }) {
  // Cores condicionais para o status
  const circleBg = step.isCompleted ? "green.50" : "red.50";
  const iconColor = step.isCompleted ? "green.500" : "red.500";
  const statusTextColor = step.isCompleted ? "green.600" : "red.600";

  // Background do card (modo claro/escuro)
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = step.isCompleted ? "green.200" : "gray.200";

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 6, md: 6 }}
      position="relative"
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
        borderColor: step.isCompleted ? "green.300" : primaryColor
      }}
      overflow="hidden"
    >
      {/* Faixa decorativa no topo do card */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="4px"
        bg={step.isCompleted ? "green.400" : primaryColor}
      />

      {/* Ícone circular */}
      <Center
        w={{ base: "56px", md: "64px" }}
        h={{ base: "56px", md: "64px" }}
        borderRadius="full"
        bg={circleBg}
        mx="auto"
        mb={4}
        boxShadow="sm"
      >
        <Icon
          as={step.isCompleted ? CheckIcon : CloseIcon}
          boxSize={{ base: 6, md: 7 }}
          color={iconColor}
        />
      </Center>

      {/* Título */}
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        color={textColor}
        mb={2}
      >
        {step.title}
      </Text>

      {/* Linha divisória */}
      <Box
        w="36px"
        h="3px"
        bg={step.isCompleted ? "green.400" : primaryColor}
        mx="auto"
        mb={3}
      />

      {/* Descrição breve */}
      <Text
        fontSize={{ base: "sm", md: "md" }}
        color="gray.600"
        lineHeight="1.4"
      >
        {step.description}
      </Text>

      {/* Status (Concluído ou Pendente) */}
      <Flex justify="center" align="center" mt={4}>
        <Box
          px={3}
          py={1}
          borderRadius="full"
          bg={step.isCompleted ? "green.100" : "red.100"}
          color={statusTextColor}
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="semibold"
        >
          {step.isCompleted ? "Concluído" : "Pendente"}
        </Box>
      </Flex>
    </Box>
  );
}
