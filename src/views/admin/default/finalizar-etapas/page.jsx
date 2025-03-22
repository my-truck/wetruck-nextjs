import React, { useEffect, useState } from "react";
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
  Spinner,
  Button,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import axiosInstance from "../../../../axiosInstance"; // Ajuste se necessário

// Passamos também a rota em cada etapa
const INITIAL_STEPS = [
  {
    title: "Crie seu Anúncio",
    isCompleted: false,
    description: "Anuncie seu Truck e informe o tipo de carga que você pode transportar.",
    route: "/admin/motorista",
  },
  {
    title: "Complete seu perfil",
    isCompleted: false,
    description: "Forneça dados atualizados, incluindo documentos e informações para contato.",
    route: "/admin/perfil",
  },
  {
    title: "Conecte sua conta bancária",
    isCompleted: false,
    description: "Cadastre uma conta para receber pagamentos com segurança e rapidez.",
    route: "/admin/connect-bank-account",
  },
];

// Componente do Card de cada etapa
function StepCard({ step, stepIndex, stepsData, textColor, primaryColor }) {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = step.isCompleted ? "green.200" : "gray.200";

  // Cores de ícone/bolinha/status
  const circleBg = step.isCompleted ? "green.50" : "red.50";
  const iconColor = step.isCompleted ? "green.500" : "red.500";
  const statusTextColor = step.isCompleted ? "green.600" : "red.600";

  // Verifica se o botão (e a etapa) deve estar "liberado"
  // Se for a primeira etapa (index 0), sempre liberado
  // Caso contrário, precisa que a etapa anterior esteja completa
  const showButton = stepIndex === 0 || stepsData[stepIndex - 1].isCompleted;

  // Se não pode mostrar o botão, significa que o card está "bloqueado"
  const isLocked = !showButton;

  // Cores e estilos para o card bloqueado
  const lockedBg = useColorModeValue("gray.100", "gray.700");
  const lockedTextColor = useColorModeValue("gray.400", "gray.500");

  return (
    <Box
      // Se está bloqueado, muda o bg para lockedBg; senão, usa cardBg normal
      bg={isLocked ? lockedBg : cardBg}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 6, md: 6 }}
      position="relative"
      transition="all 0.2s ease"
      // Se está bloqueado, não aplicamos hover; caso contrário, sim
      _hover={
        isLocked
          ? {}
          : {
              transform: "translateY(-4px)",
              boxShadow: "lg",
              borderColor: step.isCompleted ? "green.300" : primaryColor,
            }
      }
      overflow="hidden"
    >
      {/* Faixa colorida no topo */}
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
        bg={isLocked ? "gray.200" : circleBg}
        mx="auto"
        mb={4}
        boxShadow="sm"
      >
        <Icon
          as={step.isCompleted ? CheckIcon : CloseIcon}
          boxSize={{ base: 6, md: 7 }}
          color={isLocked ? "gray.400" : iconColor}
        />
      </Center>

      {/* Título da etapa */}
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        color={isLocked ? lockedTextColor : textColor}
        mb={2}
      >
        {step.title}
      </Text>

      {/* Barra divisória */}
      <Box
        w="36px"
        h="3px"
        bg={step.isCompleted ? "green.400" : primaryColor}
        mx="auto"
        mb={3}
      />

      {/* Descrição */}
      <Text
        fontSize={{ base: "sm", md: "md" }}
        color={isLocked ? lockedTextColor : "gray.600"}
        lineHeight="1.4"
      >
        {step.description}
      </Text>

      {/* Status (Concluído / Pendente) */}
      <Flex justify="center" align="center" mt={4}>
        <Box
          px={3}
          py={1}
          borderRadius="full"
          bg={step.isCompleted ? "green.100" : "red.100"}
          color={isLocked ? lockedTextColor : statusTextColor}
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="semibold"
        >
          {step.isCompleted ? "Concluído" : "Pendente"}
        </Box>
      </Flex>

      {/* Botão para rota da etapa - exibido apenas se showButton for true */}
      {showButton && (
        <Flex justify="center" mt={4}>
          <Button
            as="a"
            href={step.route}
            colorScheme={step.isCompleted ? "green" : "orange"}
            size="sm"
          >
            {step.isCompleted ? "Ver / Editar" : "Completar Agora"}
          </Button>
        </Flex>
      )}
    </Box>
  );
}

// Componente principal
export default function FinalizarEtapas() {
  const primaryColor = "#F27A1A"; // Laranja
  const secondaryColor = "#002F34"; // Azul escuro/verde
  const bgLight = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue(secondaryColor, "whiteAlpha.900");

  const [stepsData, setStepsData] = useState(INITIAL_STEPS);
  const [isChecking, setIsChecking] = useState(true);

  // Checa se cada etapa está concluída
  useEffect(() => {
    const checkSteps = async () => {
      try {
        // Faz 3 chamadas aos endpoints de verificação
        const [hasVehicleRes, isProfileCompleteRes, isAccountConnectedRes] =
          await Promise.all([
            axiosInstance.get("/vehicles/has-vehicle"),           // true/false
            axiosInstance.get("/profile/is-complete"),            // true/false
            axiosInstance.get("/stripe/is-account-connected"),   // true/false
          ]);

        const hasVehicle = hasVehicleRes.data;
        const isProfileComplete = isProfileCompleteRes.data;
        const isAccountConnected = isAccountConnectedRes.data;

        // Atualiza o status de cada etapa
        setStepsData((prev) => {
          const updated = [...prev];
          updated[0].isCompleted = !!hasVehicle;          // "Crie seu Anúncio"
          updated[1].isCompleted = !!isProfileComplete;   // "Complete seu perfil"
          updated[2].isCompleted = !!isAccountConnected;  // "Conecte sua conta bancária"
          return updated;
        });
      } catch (error) {
        console.error("Erro ao verificar etapas:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSteps();
  }, []);

  // Cálculo da porcentagem concluída
  const completedSteps = stepsData.filter((step) => step.isCompleted).length;
  const totalSteps = stepsData.length;
  const completionPercentage = Math.round(
    (completedSteps / totalSteps) * 100
  );

  // Enquanto carrega as requisições, mostra spinner
  if (isChecking) {
    return (
      <Box
        minH="100vh"
        w="100%"
        bg={bgLight}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" thickness="4px" />
      </Box>
    );
  }

  // Renderização final
  return (
    <Box
      minH="100vh"
      w="100%"
      bg={bgLight}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
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

        {/* Grid responsivo de cards */}
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
              stepIndex={index}
              stepsData={stepsData}
              textColor={textColor}
              primaryColor={primaryColor}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
