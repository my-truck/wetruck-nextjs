import React from 'react';
import { Box, Image, Text } from '@chakra-ui/react';

const FreightCard = ({ image, alt, title, categoria, subcategoria, onSelect }) => {
  return (
    <Box
      onClick={() => onSelect(categoria, subcategoria)}
      width={{ base: '320px', md: '240px', lg: '216px' }} // Aumentado no mobile
      minHeight={{ base: 'auto', md: '290px', lg: '261px' }}
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      p={4}
      cursor="pointer"
      transition="all 0.3s"
      display="flex"
      flexDirection={{ base: 'column', lg: 'column' }} // Coluna para ambos
      alignItems="center" // Centraliza conteúdo
      justifyContent="center" // Centraliza conteúdo
      textAlign="center" // Centraliza texto
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
        boxSize={{ base: '64px', lg: '64px' }} // Tamanho ajustado no mobile
        objectFit="cover"
        mb={3} // Margem abaixo no mobile e desktop
      />
      {/* Texto do card */}
      <Text
        fontWeight="bold"
        color="gray.700"
        fontSize={{ base: 'lg', md: 'lg', lg: 'xl' }} // Fonte maior no mobile
        whiteSpace="normal"
        wordWrap="break-word"
      >
        {title}
      </Text>
    </Box>
  );
};

export default FreightCard;
