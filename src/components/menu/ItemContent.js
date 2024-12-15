// src/components/menu/ItemContent.js

import React from "react";
import {
  Icon,
  Flex,
  Text,
  useColorModeValue,
  Box,
  VStack,
} from "@chakra-ui/react";
import { MdLocalShipping, MdCheckCircle } from "react-icons/md";
import PropTypes from "prop-types";
import AcceptButton from "./AcceptButton";

// Função para formatar o endereço
const formatAddress = (addressObj) => {
  if (!addressObj) return "";
  if (typeof addressObj === "string") return addressObj;
  const { address, city, state, complement, postalCode } = addressObj;
  return `${address}, ${complement ? complement + ", " : ""}${city}, ${state}, ${postalCode}`;
};

// Função para formatar a data de forma segura
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "Data inválida" : date.toLocaleString();
};

export function ItemContent({ type, info, onAccept }) {
  // Cores baseadas no modo de cor
  const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");

  // Desestruturando os dados da notificação
  const { origin, destination, name, time, id } = info; // 'id' agora está corretamente mapeado

  // Configurações baseadas no tipo de notificação
  const notificationConfig = {
    default: {
      icon: MdLocalShipping,
      title: "Novo Frete",
      description: "Você recebeu um novo frete.",
      bgGradient: "linear(to-r, yellow.400, yellow.600)",
      iconColor: "black", // Ícone preto
    },
    freteAceito: {
      icon: MdCheckCircle,
      title: "Frete Aceito",
      description: "Seu frete foi aceito.",
      bgGradient: "linear(to-r, green.400, green.600)",
      iconColor: "white",
    },
    // Adicione outros tipos de notificações aqui, se necessário
  };

  const { icon, title, description, bgGradient, iconColor } =
    notificationConfig[type] || notificationConfig.default;

  return (
    <Flex
      align="center"
      p={{ base: "12px", md: "16px" }}
      borderRadius="md"
      bg={bgColor}
      boxShadow="sm"
      transition="background-color 0.2s ease-in-out"
      _hover={{ bg: hoverBgColor }}
      mb="8px"
      role="group"
      aria-label={`${title} - ${description}`}
      flexDirection={{ base: "column", md: "row" }} // Layout responsivo
      textAlign={{ base: "center", md: "left" }} // Alinhamento responsivo
    >
      {/* Ícone da Notificação */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius="md"
        minH="60px"
        h="60px"
        minW="60px"
        w="60px"
        mb={{ base: "8px", md: "0" }} // Margem responsiva
        me={{ base: "0", md: "16px" }}
        bg={bgGradient}
        boxShadow="md"
        aria-hidden="true"
      >
        <Icon
          as={icon}
          color={iconColor}
          w={{ base: 6, md: 8 }}
          h={{ base: 6, md: 8 }}
        />
      </Box>

      {/* Conteúdo da Notificação */}
      <VStack
        align={{ base: "center", md: "start" }}
        spacing={1}
        flex="1"
        width={{ base: "100%", md: "auto" }} // Responsividade na largura
      >
        <Text
          fontWeight="600" // Mais espessura para legibilidade
          color={textColor}
          fontSize={{ base: "md", md: "lg" }}
        >
          {title}
        </Text>
        <Text
          fontSize="sm"
          lineHeight="short"
          color={subTextColor}
          fontWeight="500" // Mais espessura para legibilidade
        >
          {description}
        </Text>
        <Box
          as="section"
          mt="2"
          aria-label="Detalhes do Frete"
          width="100%"
        >
          <Flex direction="column" gap={1}>
            <Text fontSize="sm" color={subTextColor} fontWeight="500">
              <strong>Origem:</strong> {formatAddress(origin)}
            </Text>
            <Text fontSize="sm" color={subTextColor} fontWeight="500">
              <strong>Destino:</strong> {formatAddress(destination)}
            </Text>
            <Text fontSize="sm" color={subTextColor} fontWeight="500">
              <strong>Motorista:</strong> {name}
            </Text>
            <Text fontSize="sm" color={subTextColor} fontWeight="500">
              <strong>Horário:</strong> {formatDate(time)}
            </Text>
          </Flex>
        </Box>
      </VStack>

      {/* Botão de Aceitar em Todas as Notificações */}
      <Box mt={{ base: "8px", md: "0" }} ml={{ base: "0", md: "auto" }}>
        <AcceptButton notificationId={id} onAccept={onAccept} />
      </Box>
    </Flex>
  );
}

// Validação de Props com PropTypes
ItemContent.propTypes = {
  type: PropTypes.string.isRequired,
  info: PropTypes.shape({
    id: PropTypes.string.isRequired, // Atualizado para string devido à concatenação
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
    time: PropTypes.string.isRequired, // Garantir que time é uma string
  }).isRequired,
  onAccept: PropTypes.func,
};
