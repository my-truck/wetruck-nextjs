// src/views/perfil/page.js

import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Text,
  Button,
  Input,
  Grid,
  Select,
  IconButton,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiCamera } from 'react-icons/fi';

export default function Profile() {
  const [cnhImage, setCnhImage] = useState(null);
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setCnhImage(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <Box
      bg={bg}
      maxW="1100px"
      mx="auto"
      mt="40px"
      p={{ base: 4, md: 8 }}
      borderRadius="lg"
      boxShadow="lg"
    >
      {/* Título da Página */}
      <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={6} textAlign="center">
        Perfil do Usuário
      </Text>

      <Grid templateColumns={{ base: '1fr', md: '350px 1fr' }} gap={10}>
        {/* Seção da Foto */}
        <Box
          position="relative"
          textAlign="center"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Avatar
            name="User Name"
            src="https://via.placeholder.com/300"
            mb={4}
            width="300px"
            height="400px"
            borderRadius="md"
            objectFit="cover"
          />
          {/* Ícone da Câmera */}
          <IconButton
            icon={<FiCamera />}
            aria-label="Upload Photo"
            size="lg"
            position="absolute"
            bottom="10px"
            right="10px"
            bg="orange.400"
            color="white"
            _hover={{ bg: 'orange.500' }}
            boxShadow="lg"
            borderRadius="full"
          />
        </Box>

        {/* Seção de Informações */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
            Nome:
          </Text>
          <Input
            placeholder="Seu nome completo"
            variant="filled"
            focusBorderColor="orange.400"
            mb={4}
          />

          <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
            Gênero:
          </Text>
          <Select placeholder="Selecione o gênero" mb={4} focusBorderColor="orange.400">
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </Select>

          <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
            Endereço:
          </Text>
          <Input
            placeholder="Digite seu endereço completo"
            variant="filled"
            focusBorderColor="orange.400"
            mb={4}
          />

          <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
            Cidade, Estado, País:
          </Text>
          <Input
            placeholder="Cidade, Estado, País"
            variant="filled"
            focusBorderColor="orange.400"
            mb={4}
          />
        </Box>
      </Grid>

      {/* Upload de CNH com react-dropzone */}
      <VStack
        spacing={4}
        border="2px dashed"
        borderColor={borderColor}
        borderRadius="md"
        p={6}
        mt={8}
        textAlign="center"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Text fontSize="sm" color="orange.500">
            Solte a imagem aqui...
          </Text>
        ) : (
          <>
            {cnhImage ? (
              <Box>
                <img src={cnhImage} alt="CNH Upload" style={{ maxWidth: '100%' }} />
              </Box>
            ) : (
              <>
                <Text fontSize="sm" color="gray.500">
                  Arraste e solte sua CNH aqui, ou clique para selecionar
                </Text>
                <Button
                  as="label"
                  colorScheme="orange"
                  cursor="pointer"
                >
                  Selecione uma Imagem
                </Button>
              </>
            )}
          </>
        )}
      </VStack>

      {/* E-mail */}
      <Box mt={8}>
        <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
          MEU ENDEREÇO DE EMAIL:
        </Text>
        <Text fontSize="md" color="gray.500">
          teste@teste.com
        </Text>
      </Box>
    </Box>
  );
}
