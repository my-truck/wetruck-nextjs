// src/components/menu/ItemContent.js

import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Flex,
  Text,
  Icon,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdLocalShipping, MdCheckCircle } from "react-icons/md";
import AcceptButton from "./AcceptButton";

// Função para formatar o endereço
const formatAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  const { address: addr, city, state, complement, postalCode } = address;
  return `${addr}${complement ? `, ${complement}` : ""}, ${city} - ${state}, ${postalCode}`;
};

// Função para formatar a data de forma segura
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleString();
};

export function ItemContent({ type, info, onAccept, fetchNotifications }) {
  const labelColor = useColorModeValue("gray.800", "white");
  const valueColor = useColorModeValue("gray.600", "gray.400");
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Configurações baseadas no tipo de notificação
  const config = {
    freteDisponivel: {
      icon: MdLocalShipping,
      title: "Novo Frete Disponível",
      description: "Há um novo frete que corresponde aos seus critérios.",
      bgGradient: "linear(to-r, orange.400, orange.600)",
    },
    freteAceito: {
      icon: MdCheckCircle,
      title: "Frete Aceito",
      description: "Seu frete foi aceito com sucesso!",
      bgGradient: "linear(to-r, orange.400, orange.600)", // Mantendo laranja para consistência
    },
  };

  const currentConfig = config[type] || config.freteDisponivel;
  const { icon, title, description, bgGradient } = currentConfig;

  const { origin, destination, name, time, id } = info;

  return (
    <Box
      w="100%"
      p={{ base: "16px", md: "20px" }}
      borderRadius="md"
      bg={bgColor}
      boxShadow="md"
      border="1px"
      borderColor={borderColor}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "scale(1.02)", boxShadow: "lg" }}
    >
      {/* Cabeçalho */}
      <HStack spacing={4} mb={4}>
        <Box
          p={4}
          bgGradient={bgGradient}
          borderRadius="full"
          boxShadow="sm"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} color="white" boxSize={6} />
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color={labelColor}>
            {title}
          </Text>
          <Text fontSize="sm" color={valueColor}>
            {description}
          </Text>
        </Box>
      </HStack>

      {/* Detalhes */}
      <VStack align="start" spacing={3} mb={4}>
        <HStack w="100%" align="start">
          <Text fontWeight="semibold" color={labelColor} w="30%">
            Origem:
          </Text>
          <Text color={valueColor} wordBreak="break-word">
            {formatAddress(origin)}
          </Text>
        </HStack>
        <HStack w="100%" align="start">
          <Text fontWeight="semibold" color={labelColor} w="30%">
            Destino:
          </Text>
          <Text color={valueColor} wordBreak="break-word">
            {formatAddress(destination)}
          </Text>
        </HStack>
        <HStack w="100%" align="start">
          <Text fontWeight="semibold" color={labelColor} w="30%">
            Motorista:
          </Text>
          <Text color={valueColor}>{name}</Text>
        </HStack>
        <HStack w="100%" align="start">
          <Text fontWeight="semibold" color={labelColor} w="30%">
            Horário:
          </Text>
          <Text color={valueColor}>{formatDate(time)}</Text>
        </HStack>
      </VStack>

      {/* Ação */}
      {type !== "freteAceito" && (
        <Flex justify="flex-end">
          <AcceptButton
            notificationId={id}
            onAccept={onAccept}
            fetchNotifications={fetchNotifications}
          />
        </Flex>
      )}
    </Box>
  );
}

// Validação de Props com PropTypes
ItemContent.propTypes = {
  type: PropTypes.oneOf(["freteDisponivel", "freteAceito"]).isRequired,
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
  fetchNotifications: PropTypes.func,
};
