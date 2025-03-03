import React, { useState, useEffect } from 'react';
import { 
  Box, 
  HStack, 
  Text, 
  useColorModeValue,
  Container,
  Progress,
  Divider
} from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import Step1ConnectAccount from './Step1ConnectAccount';
import Step2KycForm from './Step2KycForm';
import Step3Status from './Step3Status';
import axiosInstance from '../../axiosInstance';

const steps = [
  { id: 1, label: 'Conectar Conta' },
  { id: 2, label: 'Atualizar KYC' },
  { id: 3, label: 'Verificar Status' },
];

// Função auxiliar para verificar se a conta está pronta
const isAccountReady = (status) => {
  if (!status) return false;
  
  const { charges_enabled, payouts_enabled, requirements } = status;
  if (!charges_enabled || !payouts_enabled) return false;
  if (!requirements) return false;

  // Verifica se todas as arrays estão vazias
  const arrays = [
    requirements.currently_due,
    requirements.alternatives,
    requirements.errors,
    requirements.eventually_due,
    requirements.past_due,
    requirements.pending_verification,
  ];
  const arraysEmpty = arrays.every(arr => Array.isArray(arr) && arr.length === 0);

  return arraysEmpty && requirements.current_deadline === null && requirements.disabled_reason === null;
};

export default function ConnectBankAccount() {
  const [currentStep, setCurrentStep] = useState(1);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const stepBgActive = useColorModeValue('blue.500', 'blue.400');
  const stepBgInactive = useColorModeValue('gray.200', 'gray.600');
  const stepTextActive = useColorModeValue('white', 'white');
  const stepTextInactive = useColorModeValue('gray.600', 'gray.200');
  const progressValue = ((currentStep - 1) / (steps.length - 1)) * 100;

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const restartProcess = () => setCurrentStep(1);

  // Verifica o status da conta assim que o componente for montado
  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const response = await axiosInstance.get('/stripe/custom-connect/status');
        const statusData = response.data;
        // Se a conta estiver pronta, pula direto para a etapa 3
        if (isAccountReady(statusData)) {
          setCurrentStep(3);
        }
      } catch (error) {
        console.error('Erro ao verificar status da conta', error);
        // Em caso de erro, pode-se optar por seguir o fluxo normal
      }
    };

    checkAccountStatus();
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ConnectAccount onNext={nextStep} />;
      case 2:
        return <Step2KycForm onNext={nextStep} />;
      case 3:
        return <Step3Status onRestart={restartProcess} />;
      default:
        return null;
    }
  };

  return (
    <Box
      p={[4, 6, 8]}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg={bgColor}
    >
      <Container maxW="container.md" pb={8}>
        {/* Título */}
        <Text 
          fontSize={["xl", "2xl"]} 
          fontWeight="bold" 
          textAlign="center" 
          mb={6}
          color={useColorModeValue('blue.600', 'blue.300')}
        >
          Conecte sua conta bancária 
        </Text>
        
        {/* Progresso */}
        <Box mb={8}>
          <Progress 
            value={progressValue} 
            size="sm" 
            colorScheme="blue" 
            borderRadius="full" 
            mb={4}
          />
          
          {/* Indicador de etapas */}
          <HStack
            spacing={[2, 4, 6]}
            justify="space-between"
            mb={4}
            px={[2, 4]}
          >
            {steps.map((step) => (
              <Box
                key={step.id}
                display="flex"
                flexDirection="column"
                alignItems="center"
                width={`${100/steps.length}%`}
              >
                <Box
                  width={["36px", "48px"]}
                  height={["36px", "48px"]}
                  borderRadius="full"
                  bg={step.id <= currentStep ? stepBgActive : stepBgInactive}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={2}
                  boxShadow={step.id === currentStep ? "0 0 0 4px rgba(66, 153, 225, 0.3)" : "none"}
                  transition="all 0.3s ease"
                >
                  <Text
                    fontSize={["md", "lg"]}
                    fontWeight="bold"
                    color={step.id <= currentStep ? stepTextActive : stepTextInactive}
                  >
                    {step.id}
                  </Text>
                </Box>
                <Text
                  fontSize={["xs", "sm"]}
                  fontWeight={step.id === currentStep ? "bold" : "medium"}
                  color={step.id <= currentStep ? "blue.500" : "gray.500"}
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  {step.label}
                </Text>
              </Box>
            ))}
          </HStack>
        </Box>

        <Divider mb={8} />

        {/* Conteúdo da etapa com animação */}
        <AnimatePresence mode="wait">
          <Box key={currentStep} width="100%">
            {renderStep()}
          </Box>
        </AnimatePresence>
      </Container>
    </Box>
  );
}