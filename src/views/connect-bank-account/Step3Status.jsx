import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import axiosInstance from '../../axiosInstance';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function Step3Status() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/stripe/custom-connect/status');
      setStatus(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao buscar status',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStatusMessage = () => {
    if (!status) {
      return <Text textAlign="center">Nenhum status disponível.</Text>;
    }

    const pendingMessages = [];
    const { charges_enabled, payouts_enabled, requirements, verification } = status;

    // Verifica os principais flags
    if (!charges_enabled) {
      pendingMessages.push("Ativação de cobranças não habilitada");
    }
    if (!payouts_enabled) {
      pendingMessages.push("Pagamentos não habilitados");
    }

    // Verifica as pendências em requirements
    if (requirements) {
      if (Array.isArray(requirements.currently_due) && requirements.currently_due.length > 0) {
        pendingMessages.push("Requisitos pendentes: " + requirements.currently_due.join(", "));
      }
      if (Array.isArray(requirements.alternatives) && requirements.alternatives.length > 0) {
        pendingMessages.push("Alternativas pendentes: " + requirements.alternatives.join(", "));
      }
      if (Array.isArray(requirements.errors) && requirements.errors.length > 0) {
        pendingMessages.push("Erros encontrados: " + requirements.errors.join(", "));
      }
      if (Array.isArray(requirements.eventually_due) && requirements.eventually_due.length > 0) {
        pendingMessages.push(
          "Requisitos que eventualmente serão necessários: " +
            requirements.eventually_due.join(", ")
        );
      }
      if (Array.isArray(requirements.past_due) && requirements.past_due.length > 0) {
        pendingMessages.push("Requisitos em atraso: " + requirements.past_due.join(", "));
      }
      if (Array.isArray(requirements.pending_verification) && requirements.pending_verification.length > 0) {
        // Substitui "individual.verification.document" por "Documento sendo Registrado"
        const pendingVerificationMessages = requirements.pending_verification.map(item =>
          item === "individual.verification.document" ? "Documento sendo Registrado" : item
        );
        pendingMessages.push("Verificações pendentes: " + pendingVerificationMessages.join(", "));
      }
      if (requirements.current_deadline !== null) {
        pendingMessages.push("Prazo atual: " + requirements.current_deadline);
      }
    }

    // Verifica o objeto de verification (se existir)
    if (verification) {
      if (verification.status === "pending") {
        if (verification.document) {
          if (!verification.document.front) {
            pendingMessages.push("Documento de identidade (frente) ausente");
          }
          if (!verification.document.back) {
            pendingMessages.push("Documento de identidade (verso) ausente");
          }
        }
        if (verification.additional_document) {
          if (!verification.additional_document.front) {
            pendingMessages.push("Documento adicional (frente) ausente");
          }
          if (!verification.additional_document.back) {
            pendingMessages.push("Documento adicional (verso) ausente");
          }
        }
        if (!verification.details && !verification.details_code) {
          pendingMessages.push("Detalhes de verificação pendentes");
        }
      }
    }

    // Exibe mensagem de sucesso se não houver pendências
    if (pendingMessages.length === 0) {
      return (
        <Text textAlign="center" fontWeight="bold" color="green.500">
          Sua conta foi validada e está conectada!
        </Text>
      );
    } else {
      return (
        <Box>
          <Text textAlign="center" color="red.500" mb={2}>
            Existem pendências na sua conta:
          </Text>
          {pendingMessages.map((msg, index) => (
            <Text key={index} textAlign="center" color="red.500">
              - {msg}
            </Text>
          ))}
        </Box>
      );
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      p={5}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
      maxW="600px"
      mx="auto"
      mt={10}
    >
      <VStack spacing={4}>
        <Heading size="lg" textAlign="center">
          Status da Conta
        </Heading>
        {isLoading ? <Spinner size="xl" /> : renderStatusMessage()}
        <Button colorScheme="blue" onClick={fetchStatus} isLoading={isLoading}>
          Atualizar Status
        </Button>
      </VStack>
    </MotionBox>
  );
}
