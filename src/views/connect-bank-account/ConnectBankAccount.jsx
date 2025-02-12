import React, { useState, useEffect } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
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

  const nextStep = () => setCurrentStep((prev) => prev + 1);
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
      p={[2, 4]}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      {/* Indicador de etapas */}
      <HStack
        spacing={[1, 2]}
        justify="center"
        mb={[2, 4]}
        overflowX="auto"
        whiteSpace="nowrap"
      >
        {steps.map((step) => (
          <Box
            key={step.id}
            px={[2, 3]}
            py={[1, 2]}
            borderRadius="md"
            bg={step.id === currentStep ? 'blue.500' : 'gray.300'}
          >
            <Text
              whiteSpace="nowrap"
              fontSize={['xs', 'sm']}
              color={step.id === currentStep ? 'white' : 'black'}
            >
              {step.label}
            </Text>
          </Box>
        ))}
      </HStack>

      {/* Conteúdo da etapa com animação */}
      <AnimatePresence exitBeforeEnter>
        <Box key={currentStep} width="100%" maxW="600px">
          {renderStep()}
        </Box>
      </AnimatePresence>
    </Box>
  );
}
