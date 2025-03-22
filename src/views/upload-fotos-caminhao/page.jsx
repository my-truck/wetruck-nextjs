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
  Heading,
  Progress,
  Badge,
  Divider,
  Center,
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaTruck, FaImage, FaImages, FaCheckCircle } from 'react-icons/fa';
import { CloseIcon, ArrowBackIcon, InfoIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import VehicleFormContext from '../../contexts/VehicleFormContext';

export default function UploadFotosCaminhao() {
  const [files, setFiles] = useState([]);
  const { formData } = useContext(VehicleFormContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [progress, setProgress] = useState(66); // Estamos na etapa 2 de 2, então 66%

  // Cor principal do tema
  const primaryColor = "orange.500";

  const onDrop = (acceptedFiles) => {
    const totalFiles = files.length + acceptedFiles.length;
    if (totalFiles > 10) {
      toast({
        title: "Limite de imagens excedido",
        description: "Você pode enviar no máximo 10 imagens.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
      return;
    }

    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    // Corrigido: faz a atualização e o updateProgress usando a mesma lista
    setFiles((prev) => {
      const updatedFiles = [...prev, ...newFiles];
      updateProgress(updatedFiles.length);
      return updatedFiles;
    });
  };

  const updateProgress = (fileCount) => {
    // Base de 66% por estar na etapa 2, + até 34% para o número de fotos
    const photoProgress = Math.min(fileCount * 3.4, 34); // Cada foto vale ~3.4%
    setProgress(66 + photoProgress);
  };

  const handleRemove = (index) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      updateProgress(newFiles.length);
      return newFiles;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    multiple: true,
  });

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Por favor, envie pelo menos uma imagem do caminhão.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "solid",
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
        position: "top",
        variant: "solid",
      });
      navigate('/auth/login');
      return;
    }

    // Monta o form data
    const form = new FormData();
    form.append('vehicleClassId', formData.vehicleClass);
    form.append('vehicleTypeId', formData.vehicleType);
    form.append('description', formData.description);
    form.append('licensePlate', formData.licensePlate);
    form.append('postalCode', formData.postalCode);

    // Envie cada loadTypeIds repetidamente
    if (Array.isArray(formData.loadTypeIds)) {
      formData.loadTypeIds.forEach((id) => {
        form.append('loadTypeIds', Number(id));
      });
    }

    // Adiciona as imagens
    files.forEach((file) => {
      form.append('images', file);
    });

    try {
      const response = await axios.post(
        'https://etc.wetruckhub.com/vehicles',
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Caminhão cadastrado com sucesso!",
          description: "Seu veículo já está disponível para fretes.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
          variant: "solid",
        });
        setProgress(100);
        setTimeout(() => navigate('/'), 1500);
      } else {
        toast({
          title: "Erro ao cadastrar caminhão",
          description: response.data.message || "Tente novamente mais tarde.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
          variant: "solid",
        });
      }
    } catch (error) {
      console.error("Erro no cadastro do caminhão:", error);
      toast({
        title: "Erro no cadastro",
        description: error.response?.data?.message || "Verifique sua conexão e tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      p={{ base: 4, md: 8 }} 
      maxW="800px" 
      mx="auto" 
      bg="white" 
      borderRadius="xl" 
      shadow="lg"
      position="relative"
      my={4}
    >
      {/* Header com logo, título e progresso */}
      <Box 
        position="relative" 
        bg="orange.500" 
        p={6} 
        borderTopRadius="xl" 
        mb={6} 
        boxShadow="md"
      >
        <Flex align="center" mb={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/motorista')}
            aria-label="Voltar"
            variant="ghost"
            colorScheme="white"
            color="white"
            mr={3}
            _hover={{ bg: "orange.600" }}
          />
          <Box>
            <Flex align="center">
              <FaImages color="white" size="1.5em" />
              <Heading size="lg" ml={2} color="white">
                Adicione Fotos do seu Caminhão
              </Heading>
            </Flex>
            <Text color="white" opacity={0.9} mt={1}>
              Fotos de qualidade aumentam em até 3x suas chances de conseguir fretes!
            </Text>
          </Box>
        </Flex>
        
        {/* Barra de progresso */}
        <Box mt={4}>
          <Flex justify="space-between" mb={1}>
            <Text color="white" fontWeight="medium">{Math.round(progress)}% completo</Text>
            <Text color="white">Etapa 2 de 2</Text>
          </Flex>
          <Progress 
            value={progress} 
            size="sm" 
            colorScheme="yellow" 
            bg="orange.300" 
            borderRadius="full"
          />
        </Box>
      </Box>

      {/* Conteúdo principal */}
      <VStack spacing={8} align="stretch">
        {/* Área principal de upload */}
        <Box 
          {...getRootProps()}
          borderWidth="3px"
          borderRadius="lg"
          borderStyle="dashed"
          borderColor={isDragActive ? primaryColor : "orange.200"}
          p={8}
          bg={isDragActive ? "orange.50" : "white"}
          textAlign="center"
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{ bg: "orange.50", borderColor: primaryColor }}
          position="relative"
          minH="200px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <input {...getInputProps()} />
          <FaCloudUploadAlt size={60} color={isDragActive ? "#ED8936" : "#A0AEC0"} />
          <Text mt={4} color={isDragActive ? primaryColor : "gray.600"} fontSize="xl" fontWeight="bold">
            {isDragActive 
              ? "Solte suas fotos aqui!" 
              : "Clique ou arraste as fotos do seu caminhão"}
          </Text>
          <Text color={isDragActive ? "orange.600" : "gray.500"} fontSize="md" mt={2}>
            Adicione fotos que mostrem claramente seu caminhão
          </Text>
          <HStack mt={4} spacing={2}>
            <Badge colorScheme="orange" px={2} py={1} borderRadius="full">JPG</Badge>
            <Badge colorScheme="orange" px={2} py={1} borderRadius="full">PNG</Badge>
            <Badge colorScheme="orange" px={2} py={1} borderRadius="full">Máx. 10 fotos</Badge>
          </HStack>
        </Box>

        {/* Dicas para fotos */}
        <Box 
          borderRadius="lg" 
          bg="orange.50" 
          p={4} 
          borderLeft="4px solid" 
          borderColor="orange.400"
        >
          <Flex align="center" mb={2}>
            <InfoIcon color="orange.500" mr={2} />
            <Text fontWeight="bold" color="gray.700">
              Dicas para fotos que vendem mais rápido:
            </Text>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={2}>
            <HStack align="center">
              <Box color="orange.500" fontWeight="bold" mr={1}>1.</Box>
              <Text fontSize="sm">Fotografe em ambiente bem iluminado</Text>
            </HStack>
            <HStack align="center">
              <Box color="orange.500" fontWeight="bold" mr={1}>2.</Box>
              <Text fontSize="sm">Mostre diferentes ângulos do veículo</Text>
            </HStack>
            <HStack align="center">
              <Box color="orange.500" fontWeight="bold" mr={1}>3.</Box>
              <Text fontSize="sm">Inclua detalhes importantes do interior</Text>
            </HStack>
          </SimpleGrid>
        </Box>

        {/* Preview das imagens */}
        {files.length > 0 && (
          <Box>
            <Flex align="center" mb={4}>
              <FaImage color="#ED8936" size="1.2em" />
              <Text fontWeight="bold" color="gray.700" ml={2}>
                Fotos selecionadas ({files.length}/10)
              </Text>
            </Flex>
            
            <SimpleGrid 
              columns={{ base: 2, sm: 3, md: 4, lg: 5 }} 
              spacing={4}
              mt={2}
            >
              {files.map((file, index) => (
                <Box
                  key={index}
                  position="relative"
                  borderRadius="md"
                  overflow="hidden"
                  boxShadow="md"
                  transition="transform 0.2s"
                  _hover={{ transform: "scale(1.05)" }}
                  height="120px"
                >
                  <Image
                    src={file.preview}
                    alt={`Imagem do Caminhão ${index + 1}`}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                  <IconButton
                    icon={<CloseIcon />}
                    size="sm"
                    colorScheme="red"
                    position="absolute"
                    top="4px"
                    right="4px"
                    zIndex="1"
                    isRound={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    aria-label="Remover imagem"
                    opacity="0.8"
                    _hover={{ opacity: 1 }}
                  />
                  <Badge
                    position="absolute"
                    bottom="4px"
                    left="4px"
                    colorScheme="blackAlpha"
                    fontSize="xs"
                  >
                    {index === 0 ? "Principal" : `Foto ${index + 1}`}
                  </Badge>
                </Box>
              ))}
              
              {/* Botão adicionar mais fotos */}
              {files.length < 10 && (
                <Box
                  {...getRootProps()}
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor="orange.200"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  height="120px"
                  bg="orange.50"
                  _hover={{ bg: "orange.100", borderColor: primaryColor }}
                >
                  <VStack>
                    <AddIcon color="orange.500" />
                    <Text fontSize="sm" color="gray.600">Adicionar</Text>
                  </VStack>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        )}

        {/* Resumo do veículo */}
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          overflow="hidden" 
          bg="orange.50" 
          p={4}
          borderColor="orange.200"
        >
          <Flex align="center" mb={2}>
            <FaTruck size="1.2em" color="#ED8936" />
            <Text fontWeight="bold" color="gray.700" ml={2}>
              Resumo do veículo cadastrado
            </Text>
          </Flex>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
            <HStack>
              <Text fontWeight="medium" color="gray.600">Placa:</Text>
              <Text>{formData.licensePlate}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium" color="gray.600">CEP:</Text>
              <Text>{formData.postalCode}</Text>
            </HStack>
          </SimpleGrid>
        </Box>

        <Divider borderColor="orange.200" />

        {/* Botões de ação */}
        <Flex 
          direction={{ base: "column", sm: "row" }} 
          gap={4} 
          justify="space-between"
          mt={4}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/motorista')}
            colorScheme="orange"
            border="2px solid"
            height="50px"
            flex={{ sm: 1 }}
          >
            Voltar
          </Button>
          <Button 
            colorScheme="orange" 
            onClick={handleSubmit} 
            isLoading={loading}
            loadingText="Enviando dados..."
            height="50px"
            flex={{ sm: 2 }}
            _hover={{ bg: "orange.600" }}
            leftIcon={<FaCheckCircle />}
            shadow="md"
          >
            Finalizar Cadastro
          </Button>
        </Flex>

        {/* Mensagem de segurança */}
        <Center>
          <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
            Suas informações são protegidas com a máxima segurança.
          </Text>
        </Center>
      </VStack>
    </Box>
  );
}
