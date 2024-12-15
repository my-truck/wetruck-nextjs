// src/components/menu/AcceptButton.js

import React, { useState } from "react";
import {
  Button,
  useToast,
  Tooltip,
  Spinner,
  Text,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import axiosInstance from "../../axiosInstance";

export default function AcceptButton({ notificationId, onAccept, fetchNotifications }) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleAccept = async () => {
    if (!notificationId) {
      toast({
        title: "Erro",
        description: "ID da notificação não encontrado.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/work/${notificationId}/accept`);
      
      if (response.status >= 200 && response.status < 300) { // Considera qualquer status 2xx como sucesso
        toast({
          title: "Frete Aceito",
          description: "O frete foi aceito com sucesso.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        if (onAccept) onAccept(notificationId); // Remove a notificação da lista local
        if (fetchNotifications) fetchNotifications(); // Re-fetch as notificações do backend
      } else {
        throw new Error("Falha ao aceitar o frete.");
      }
    } catch (error) {
      console.error("Erro ao aceitar o frete:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o frete. Tente novamente mais tarde.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip label="Aceitar Frete" aria-label="Aceitar Frete">
      <Button
        onClick={handleAccept}
        isLoading={isLoading}
        loadingText="Aceitando"
        variant="solid"
        colorScheme="green"
        borderRadius="md" // Bordas arredondadas suaves
        size="md"
        p={4}
        width="100%" // Largura total
      >
        {isLoading ? (
          <Spinner size="sm" color="white" />
        ) : (
          <Text fontSize="md" color="white">
            Aceitar
          </Text>
        )}
      </Button>
    </Tooltip>
  );
}

AcceptButton.propTypes = {
  notificationId: PropTypes.string.isRequired,
  onAccept: PropTypes.func,
  fetchNotifications: PropTypes.func, // Função para re-fetch das notificações
};
