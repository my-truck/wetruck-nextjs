// src/components/menu/AcceptButton.js

import React, { useState } from "react";
import {
  Button,
  useToast,
  Tooltip,
  Spinner,
  Icon,
  Text,
} from "@chakra-ui/react";
import { MdCheck } from "react-icons/md";
import PropTypes from "prop-types";
import axiosInstance from "../../axiosInstance";

export default function AcceptButton({ notificationId, onAccept }) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Adicionando log para verificar o notificationId
  console.log("AcceptButton - notificationId:", notificationId);

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
    console.log(`Enviando requisição para: /work/${notificationId}/accept`);
    try {
      const response = await axiosInstance.post(`/work/${notificationId}/accept`);
      if (response.status === 200) {
        toast({
          title: "Frete Aceito",
          description: "O frete foi aceito com sucesso.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        if (onAccept) onAccept(notificationId);
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
        borderRadius="full" // Torna o botão totalmente redondo
        size="sm" // Tamanho pequeno para manter a sutileza
        p={4} // Padding para garantir um bom espaçamento interno
        display="flex"
        flexDirection="column" // Organiza o ícone e o texto verticalmente
        alignItems="center"
        justifyContent="center"
        width="60px" // Define uma largura fixa para manter o formato circular
        height="60px" // Define uma altura fixa para manter o formato circular
        boxShadow="md"
        _hover={{ bg: "green.600" }} // Aumenta a tonalidade no hover
      >
        {isLoading ? (
          <Spinner size="sm" color="white" />
        ) : (
          <>
            <Icon as={MdCheck} w={6} h={6} color="white" />
            <Text fontSize="xs" color="white" mt="1">
              Aceitar
            </Text>
          </>
        )}
      </Button>
    </Tooltip>
  );
}

AcceptButton.propTypes = {
  notificationId: PropTypes.string.isRequired, // Atualizado para string
  onAccept: PropTypes.func,
};
