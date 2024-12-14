// src/components/menu/ItemContent.js

import { Icon, Flex, Text, useColorModeValue, Box } from "@chakra-ui/react";
import { MdLocalShipping, MdCheckCircle } from "react-icons/md";
import React from "react";

export function ItemContent(props) {
  const { type, info } = props;
  const textColor = useColorModeValue("navy.700", "white");

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

  return (
    <Flex
      align="center"
      p="12px"
      borderRadius="12px"
      bg={useColorModeValue("gray.50", "gray.800")}
      boxShadow="base"
      transition="all 0.2s ease-in-out"
      _hover={{ transform: "scale(1.02)" }}
    > 
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius="12px"
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
          {title}: {info}
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
  );
}
