import React from 'react';
import { Box, Image, Text } from '@chakra-ui/react';

const FreightCard = ({ image, alt, title, categoria, subcategoria, onSelect }) => {
  return (
    <Box
      onClick={() => onSelect(categoria, subcategoria)}
      width={{ base: '298px', md: '223px', lg: '201px' }} // Reduzido em 7%
      minHeight={{ base: 'auto', md: '270px', lg: '243px' }} // Reduzido em 7%
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      p={3.72} // Reduzido em 7% (antes era 4)
      cursor="pointer"
      transition="all 0.3s"
      display="flex"
      flexDirection={{ base: 'column', lg: 'column' }} // Coluna para ambos
      alignItems="center" // Centraliza conteúdo no card
      justifyContent="center" // Centraliza conteúdo no card
      textAlign="center" // Centraliza texto
      mx="auto" // Centraliza o card na página
      _hover={{
        transform: 'scale(1.05)',
        boxShadow: 'xl',
        bg: 'gray.50',
      }}
    >
      {/* Imagem configurada para ambos os dispositivos */}
      <Image
        src={image}
        alt={alt}
        boxSize={{ base: '59.52px', lg: '59.52px' }} // Reduzido em 7% (antes era 64px)
        objectFit="cover"
        mb={2.79} // Reduzido em 7% (antes era 3)
      />
      {/* Texto do card */}
      <Text
        fontWeight="bold"
        color="gray.700"
        fontSize={{ base: 'lg', md: 'lg', lg: 'xl' }} // Mantido claro para legibilidade
        whiteSpace="normal"
        wordWrap="break-word"
      >
        {title}
      </Text>
    </Box>
  );
};

export default FreightCard;
