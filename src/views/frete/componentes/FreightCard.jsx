import React from 'react';
import { Box, Image, Text } from '@chakra-ui/react';

const FreightCard = ({ image, alt, title, categoria, subcategoria, onSelect }) => {
  return (
    <Box
      onClick={() => onSelect(categoria, subcategoria)}
      width={{ base: '360px', md: '240px', lg: '216px' }}
      minHeight={{ base: 'auto', md: '290px', lg: '261px' }}
      bg="white"
      boxShadow="md"
      borderRadius="lg"
      p={4}
      cursor="pointer"
      transition="all 0.3s"
      display="flex"
      flexDirection={{ base: 'row', lg: 'column' }}
      alignItems="center"
      justifyContent="center"
      _hover={{
        transform: 'scale(1.05)',
        boxShadow: 'xl',
        bg: 'gray.50',
      }}
    >
      <Image
        src={image}
        alt={alt}
        boxSize={{ base: '80px', md: '100px', lg: '60px' }}
        mr={{ base: 3, lg: 0 }}
        mb={{ base: 0, lg: 3 }}
      />
      <Text
        fontWeight="bold"
        color="gray.700"
        fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
        textAlign={{ base: 'left', lg: 'center' }}
        whiteSpace="normal"
        wordWrap="break-word"
      >
        {title}
      </Text>
    </Box>
  );
};

export default FreightCard;
