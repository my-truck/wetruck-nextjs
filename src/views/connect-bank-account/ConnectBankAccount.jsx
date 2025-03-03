// ConnectBankAccount.jsx - Main Container Component
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Flex, 
  HStack, 
  Text, 
  useBreakpointValue,
  useColorModeValue
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
  const [accountStatus, setAccountStatus] = useState(null);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const stepSizes = useBreakpointValue({ base: 'xs', md: 'sm', lg: 'md' });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const restartProcess = () => setCurrentStep(1);

  // Verifica o status da conta assim que o componente for montado
  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const response = await axiosInstance.get('/stripe/custom-connect/status');
        const statusData = response.data;
        setAccountStatus(statusData);
        
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
        return <Step3Status accountStatus={accountStatus} onRestart={restartProcess} />;
      default:
        return null;
    }
  };

  return (
    <Box
      bg={bgColor}
      minHeight="100vh"
      py={8}
    >
      <Container maxW="container.md">
        {/* Barra de progresso */}
        <Flex 
          justify="center" 
          mb={8}
          position="relative"
          px={4}
        >
          <HStack 
            spacing={0} 
            justify="space-between"
            width="100%"
            maxW="400px"
          >
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Círculo do passo */}
                <Flex 
                  direction="column" 
                  align="center"
                  zIndex={2}
                >
                  <Flex
                    w={stepSizes === 'xs' ? "36px" : stepSizes === 'sm' ? "40px" : "50px"}
                    h={stepSizes === 'xs' ? "36px" : stepSizes === 'sm' ? "40px" : "50px"}
                    borderRadius="full"
                    bg={currentStep >= step.id ? "blue.500" : "gray.300"}
                    color="white"
                    justify="center"
                    align="center"
                    fontWeight="bold"
                    boxShadow={currentStep === step.id ? "0 0 0 4px rgba(66, 153, 225, 0.3)" : "none"}
                    transition="all 0.3s"
                  >
                    {step.id}
                  </Flex>
                  <Text
                    mt={2}
                    fontSize={stepSizes}
                    fontWeight={currentStep === step.id ? "semibold" : "normal"}
                    color={currentStep >= step.id ? "blue.600" : "gray.500"}
                    textAlign="center"
                  >
                    {step.label}
                  </Text>
                </Flex>
                
                {/* Linha de conexão */}
                {index < steps.length - 1 && (
                  <Box 
                    flex={1} 
                    h="3px" 
                    bg={currentStep > step.id ? "blue.500" : "gray.300"}
                    transition="all 0.3s"
                    position="relative"
                    top={stepSizes === 'xs' ? "-18px" : stepSizes === 'sm' ? "-20px" : "-25px"}
                    zIndex={1}
                  />
                )}
              </React.Fragment>
            ))}
          </HStack>
        </Flex>

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