// src/views/perfil/page.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Text,
  Button,
  Input,
  Select,
  VStack,
  useToast,
  useColorModeValue,
  Image,
  Grid,
  FormControl,
  FormLabel,
  Flex, // Importação do Flex
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FaCamera } from 'react-icons/fa';
import axiosInstance from '../../axiosInstance';

export default function Profile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    driverDocument: {
      driverLicenseNumber: '',
      dateOfIssue: '',
      expirationDate: '',
      issuingState: '',
      cpf: '',
      category: '',
    },
    imageProfileUrl: '',
    imageDocumentUrl: '',
  });

  const [imageProfile, setImageProfile] = useState(null);
  const [imageDocument, setImageDocument] = useState(null);

  const bg = 'white'; // Definindo fundo branco
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  // Máscara de CPF
  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    setProfile((prev) => ({
      ...prev,
      driverDocument: {
        ...prev.driverDocument,
        cpf: value,
      },
    }));
  };

  // Dropzones
  const onDropProfile = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) setImageProfile(file);
  };

  const onDropDocument = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) setImageDocument(file);
  };

  const { getRootProps: getProfileRootProps, getInputProps: getProfileInputProps } = useDropzone({
    onDrop: onDropProfile,
    accept: 'image/*',
  });
  const { getRootProps: getDocumentRootProps, getInputProps: getDocumentInputProps } = useDropzone({
    onDrop: onDropDocument,
    accept: 'image/*',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          console.error('Usuário não autenticado. Redirecionando para login.');
          window.location.href = '/auth/login';
          return;
        }
        const response = await axiosInstance.get(`/profile/${userId}`);

        setProfile((prev) => ({
          ...prev,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          gender: response.data.gender || '',
          email: response.data.email || '',
          driverDocument: {
            driverLicenseNumber: response.data.driverLicenseNumber || '',
            dateOfIssue: response.data.dateOfIssue || '',
            expirationDate: response.data.expirationDate || '',
            issuingState: response.data.issuingState || '',
            cpf: response.data.cpf || '',
            category: response.data.category || '',
          },
          imageProfileUrl: response.data.imageProfileUrl || '',
          imageDocumentUrl: response.data.imageDocumentUrl || '',
        }));
      } catch (error) {
        toast({
          title: 'Erro ao carregar perfil',
          description: error.response?.data?.message || error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchProfile();
  }, [toast]);

  // Preview local ou do backend
  const profileImagePreview = imageProfile
    ? URL.createObjectURL(imageProfile)
    : profile.imageProfileUrl || 'https://via.placeholder.com/300';

  const documentImagePreview = imageDocument
    ? URL.createObjectURL(imageDocument)
    : profile.imageDocumentUrl || 'https://via.placeholder.com/300';

  // Envio ao clicar em "Salvar Alterações"
  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('gender', profile.gender);
      formData.append('email', profile.email);
      formData.append('driverDocument', JSON.stringify(profile.driverDocument));

      // Envia imageProfile e imageDocument mesmo se vazios (back-end não quebra)
      if (imageProfile) formData.append('imageProfile', imageProfile);
      else formData.append('imageProfile', '');

      if (imageDocument) formData.append('imageDocument', imageDocument);
      else formData.append('imageDocument', '');

      await axiosInstance.put('/profile/update', formData);

      toast({
        title: 'Perfil atualizado com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro no servidor:', error.response?.data || error.message);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    // Contêiner Flex para centralizar o conteúdo
    <Flex
      minHeight="100vh"
      align="center"
      justify="center"
      bg="white" // Definindo fundo branco
      p={4}
    >
      <Box
        bg={bg} // Fundo branco
        maxW="800px" // Reduzido para 800px para evitar espaços brancos excessivos
        w="100%"
        p={{ base: 4, md: 8 }}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={6} textAlign="center">
          Perfil do Usuário
        </Text>

        {/*
          Grid responsivo: 1 coluna no mobile, 2 no desktop
        */}
        <Grid
          templateColumns={{ base: '1fr', md: '300px 1fr' }}
          gap={8}
          alignItems={{ base: 'center', md: 'start' }} // Centraliza no mobile
          justifyContent={{ base: 'center', md: 'flex-end' }} // Centraliza no mobile e alinha à direita no desktop
        >
          {/* Foto do perfil + Documento à esquerda */}
          <Box textAlign={{ base: 'center', md: 'center' }}> {/* Centraliza texto no mobile */}
            {/* Avatar / Foto de perfil */}
            <Box
              position="relative"
              w="fit-content"
              mx={{ base: 'auto', md: 'auto' }}
              mb={6}
              {...getProfileRootProps()}
              cursor="pointer"
            >
              <input {...getProfileInputProps()} />
              <Avatar
                name={profile.firstName}
                src={profileImagePreview}
                width="300px"
                height="300px"
                borderRadius="md"
                objectFit="cover"
              />
              <Box
                position="absolute"
                bottom="2"
                right="2"
                bg="gray.700"
                p="2"
                borderRadius="full"
                opacity={0.8}
                _hover={{ opacity: 1 }}
              >
                <FaCamera color="#fff" />
              </Box>
            </Box>

            {/* Documento menor */}
            <VStack
              spacing={4}
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="md"
              p={6}
              {...getDocumentRootProps()}
              cursor="pointer"
              mx="auto"
            >
              <input {...getDocumentInputProps()} />
              <Image
                src={documentImagePreview}
                alt="Documento"
                boxSize="80px"
                objectFit="cover"
                mb={2}
              />
              <Text fontSize="sm" color="gray.500">
                Arraste ou selecione um documento
              </Text>
            </VStack>
          </Box>

          {/* Campos à direita */}
          <VStack
            spacing={4}
            align={{ base: 'center', md: 'start' }} // Alinha centralizado no mobile e à esquerda no desktop
            w={{ base: '100%', md: 'auto' }}
          >
            {/* Nome */}
            <FormControl id="firstName">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Nome:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                placeholder="Primeiro Nome"
              />
            </FormControl>

            {/* Sobrenome */}
            <FormControl id="lastName">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Sobrenome:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                placeholder="Sobrenome"
              />
            </FormControl>

            {/* Gênero (Select) */}
            <FormControl id="gender">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Gênero:
              </FormLabel>
              <Select
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                placeholder="Selecione o gênero"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </Select>
            </FormControl>

            {/* Email */}
            <FormControl id="email">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Email:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Email"
              />
            </FormControl>

            {/* CPF */}
            <FormControl id="cpf">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                CPF:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.driverDocument.cpf}
                onChange={handleCPFChange}
                placeholder="CPF"
              />
            </FormControl>

            {/* Número CNH */}
            <FormControl id="driverLicenseNumber">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Número CNH:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.driverDocument.driverLicenseNumber}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    driverDocument: {
                      ...prev.driverDocument,
                      driverLicenseNumber: e.target.value,
                    },
                  }))
                }
                placeholder="Número da CNH"
              />
            </FormControl>

            {/* Data de Emissão */}
            <FormControl id="dateOfIssue">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Data de Emissão:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                type="date"
                value={profile.driverDocument.dateOfIssue}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    driverDocument: {
                      ...prev.driverDocument,
                      dateOfIssue: e.target.value,
                    },
                  }))
                }
              />
            </FormControl>

            {/* Data de Expiração */}
            <FormControl id="expirationDate">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Data de Expiração:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                type="date"
                value={profile.driverDocument.expirationDate}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    driverDocument: {
                      ...prev.driverDocument,
                      expirationDate: e.target.value,
                    },
                  }))
                }
              />
            </FormControl>

            {/* Estado Emissor */}
            <FormControl id="issuingState">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Estado Emissor:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.driverDocument.issuingState}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    driverDocument: {
                      ...prev.driverDocument,
                      issuingState: e.target.value,
                    },
                  }))
                }
                placeholder="Estado Emissor"
              />
            </FormControl>

            {/* Categoria */}
            <FormControl id="category">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Categoria:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }} // Responsivo
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.driverDocument.category}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    driverDocument: {
                      ...prev.driverDocument,
                      category: e.target.value,
                    },
                  }))
                }
                placeholder="A, B, AB..."
              />
            </FormControl>

            {/* Botão Salvar */}
            <Button
              colorScheme="orange"
              onClick={handleUpdateProfile}
              w={{ base: '100%', md: '360px' }} // Responsivo
            >
              Salvar Alterações
            </Button>
          </VStack>
        </Grid>
      </Box>
    </Flex>
  );
}
