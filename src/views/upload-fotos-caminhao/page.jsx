// src/views/upload-fotos-caminhao/page.jsx

import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  SimpleGrid,
  IconButton,
  useColorModeValue,
  useToast,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { CloseIcon, ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';
import VehicleFormContext from '../../contexts/VehicleFormContext';

export default function UploadFotosCaminhao() {
  const [files, setFiles] = useState([]);
  const { formData } = useContext(VehicleFormContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const onDrop = (acceptedFiles) => {
    const totalFiles = files.length + acceptedFiles.length;
    if (totalFiles > 10) {
      toast({
        title: "Limite de imagens excedido",
        description: "Você pode enviar no máximo 10 imagens.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const newFiles = acceptedFiles.map(file =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemove = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
  });

  useEffect(() => {
    // Revoke data uri quando o componente desmonta
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Por favor, envie pelo menos uma imagem do caminhão.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Usuário não autenticado",
        description: "Por favor, faça login novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate('/auth/login');
      return;
    }

    const form = new FormData();
    // Adicionar dados do formulário com nomes alinhados ao backend
    form.append('vehicleClassId', formData.vehicleClass);    // Renomeado para 'vehicleClassId'
    form.append('vehicleTypeId', formData.vehicleType);      // Renomeado para 'vehicleTypeId'
    form.append('description', formData.description);
    form.append('loadTypeId', formData.loadTypeId);
    form.append('licensePlate', formData.licensePlate);
    form.append('postalCode', formData.postalCode);

    // Adicionar imagens
    files.forEach((file) => {
      form.append('images', file); // Assumindo que o backend espera 'images' como array
    });

    // Log para verificar os dados enviados
    console.log("FormData a ser enviado:");
    for (let pair of form.entries()) {
      if (pair[0] === 'images') {
        console.log(`${pair[0]}: ${pair[1].name}`); // Mostrar apenas o nome do arquivo
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    try {
      const response = await axios.post('https://etc.wetruckhub.com/vehicles', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Caminhão cadastrado com sucesso!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate('/'); // Redireciona para a página inicial ou outra página desejada
      } else {
        toast({
          title: "Erro ao cadastrar caminhão",
          description: response.data.message || "Tente novamente.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Erro no cadastro do caminhão:", error);
      toast({
        title: "Erro no cadastro",
        description: error.response?.data?.message || "Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      mt={{ base: "-50px", md: "-100px" }}
      position="relative"
    >
      <VStack spacing={6} align="center" maxW="600px" w="100%">
        {/* Botão de Voltar */}
        <Box alignSelf="flex-start" mb={2}>
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/motorista')}
            aria-label="Voltar para a página anterior"
            size="lg"
            variant="ghost"
            colorScheme="orange"
          />
        </Box>

        {/* Título da página */}
        <Text
          fontSize={{ base: "24px", md: "36px" }}
          fontWeight="extrabold"
          textAlign="center"
          fontFamily="'Work Sans', sans-serif"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="block">
            Por favor, inclua agora
          </Text>
          <Text as="span" color="#ED8936" display="block">
            a imagem do seu anúncio.
          </Text>
        </Text>

        {/* Área de upload de imagens */}
        <Box
          {...getRootProps()}
          borderWidth="2px"
          borderRadius="md"
          borderStyle="dashed"
          borderColor="gray.300"
          p={6}
          w="100%"
          bg="gray.50"
          textAlign="center"
          cursor="pointer"
          _hover={{ bg: "gray.100" }}
        >
          <input {...getInputProps()} />
          <FaCloudUploadAlt size={50} color="#A0AEC0" />
          <Text mt={2} color="gray.600" fontSize="lg">
            Clique ou arraste as fotos aqui para selecionar
          </Text>
          <Text color="gray.500" fontSize="sm">
            (Máximo de 10 imagens)
          </Text>
        </Box>

        {/* Contêiner de imagens com rolagem */}
        <Box
          w="100%"
          maxH="200px"
          overflowY="auto"
          mt={4}
        >
          <SimpleGrid columns={{ base: 3, md: 4 }} spacing={{ base: 1, md: 2 }}>
            {files.map((file, index) => (
              <Box
                key={index}
                position="relative"
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                width="80px"
                height="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  top="2px"
                  left="2px"
                  zIndex="1"
                  onClick={() => handleRemove(index)}
                  aria-label="Remover imagem"
                />
                <Image
                  src={file.preview}
                  alt={`Imagem do Caminhão ${index + 1}`}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Botões de Ação */}
        <HStack spacing={4} mt={4}>
          <Button variant="outline" onClick={() => navigate('/admin/motorista')}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Finalizar Cadastro
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
