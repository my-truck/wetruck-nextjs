// src/components/FreightCard.jsx

import React from 'react';
import {
  Box,
  Text,
  Image,
} from "@chakra-ui/react";

const FreightCard = ({ image, alt, title, onClick }) => {
  return (
    <Box
      onClick={onClick}
      width={{ base: "130px", md: "160px", lg: "200px" }}
      height={{ base: "180px", md: "220px", lg: "260px" }}
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      transition="all 0.3s"
      cursor="pointer"
      _hover={{
        transform: "scale(1.05)",
        boxShadow: "xl",
        bg: "gray.50",
      }}
    >
      <Image
        src={image}
        alt={alt}
        boxSize={{ base: "70px", md: "100px", lg: "120px" }}
        mb={3}
      />
      <Text
        fontWeight="bold"
        color="gray.700"
        fontSize={{ base: "sm", md: "md", lg: "lg" }}
        textAlign="center"
        whiteSpace="normal"
        wordBreak="break-word"
        maxW="100%"
      >
        {title}
      </Text>
    </Box>
  );
};

export default FreightCard;
