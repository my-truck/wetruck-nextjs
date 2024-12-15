// src/components/menu/ItemContent.js

import { Icon, Flex, Text, useColorModeValue, Box, VStack } from "@chakra-ui/react";
import { MdLocalShipping, MdCheckCircle } from "react-icons/md";
import React from "react";
import AcceptButton from "./AcceptButton";
import PropTypes from "prop-types";

// Função para formatar o endereço
const formatAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  const { address: addr, city, state, complement, postalCode } = address;
  return `${addr}${complement ? ", " + complement : ""}, ${city} - ${state}, ${postalCode}`;
};

// Função para formatar a data de forma segura
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleString();
};

export function ItemContent({ type, info, onAccept, fetchNotifications }) {
  const textColor = useColorModeValue("navy.700", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");

  let icon = MdLocalShipping;
  let title = "Novo Frete Disponível";
  let description = "Há um novo frete que corresponde aos seus critérios.";

  if (type === "freteAceito") {
    icon = MdCheckCircle;
    title = "Frete Aceito";
    description = "Seu pedido de frete foi aceito com sucesso!";
  }

  // Define a cor de fundo com base no tipo de notificação
  const bgGradient = type === "freteAceito"
    ? "linear(to-r, green.400, green.600)" // Verde para aceitação
    : "linear(to-r, purple.400, purple.600)"; // Roxo para novo frete

  // Extrai as informações da notificação
  const { origin, destination, name, time, id } = info;

  return (
    <Flex
      direction="column"
      p="12px"
      borderRadius="12px"
      bg={useColorModeValue("gray.50", "gray.800")}
      boxShadow="base"
      transition="all 0.2s ease-in-out"
      _hover={{ transform: "scale(1.02)" }}
    > 
      {/* Cabeçalho com ícone e título */}
      <Flex align="center">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius="full"
          minH="60px"
          h="60px"
          minW="60px"
          w="60px"
          me="16px"
          bg={bgGradient}
          boxShadow="md"
        >
          <Icon as={icon} color="black" w={10} h={10} />
        </Box>
        <Flex flexDirection="column">
          <Text
            mb="4px"
            fontWeight="bold"
            color={textColor}
            fontSize="lg"
          >
            {title}
          </Text>
          <Text
            fontSize="sm"
            lineHeight="short"
            color={useColorModeValue("gray.600", "gray.300")}
          >
            {description}
          </Text>
        </Flex>
      </Flex>
      
      {/* Detalhes do frete com espaçamento adicionado */}
      <VStack align="start" spacing={2} mt="12px">
        <Text fontSize="sm" color={subTextColor}>
          <strong>Origem:</strong> {formatAddress(origin)}
        </Text>
        <Text fontSize="sm" color={subTextColor}>
          <strong>Destino:</strong> {formatAddress(destination)}
        </Text>
        <Text fontSize="sm" color={subTextColor}>
          <strong>Motorista:</strong> {name}
        </Text>
        <Text fontSize="sm" color={subTextColor}>
          <strong>Horário:</strong> {formatDate(time)}
        </Text>
      </VStack>
      
      {/* Botão Aceitar */}
      <Box mt="12px">
        <AcceptButton
          notificationId={id}
          onAccept={onAccept}
          fetchNotifications={fetchNotifications}
        />
      </Box>
    </Flex>
  );
}

// Validação de Props com PropTypes
ItemContent.propTypes = {
  type: PropTypes.string.isRequired,
  info: PropTypes.shape({
    id: PropTypes.string.isRequired,
    origin: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        address: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        complement: PropTypes.string,
        postalCode: PropTypes.string,
      }),
    ]).isRequired,
    destination: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        address: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        complement: PropTypes.string,
        postalCode: PropTypes.string,
      }),
    ]).isRequired,
    name: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
  }).isRequired,
  onAccept: PropTypes.func,
  fetchNotifications: PropTypes.func, // Adicionado para re-fetch das notificações
};
