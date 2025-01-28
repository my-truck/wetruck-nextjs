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
  Flex,
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

  const [profileImagePreview, setProfileImagePreview] = useState('https://via.placeholder.com/300');
  const [documentImagePreview, setDocumentImagePreview] = useState('https://via.placeholder.com/300');

  const [isLoading, setIsLoading] = useState(true);

  const bg = 'white'; 
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  // Log do estado profile para depuração
  useEffect(() => {
    console.log('Profile state:', profile);
  }, [profile]);

  // Função para formatar o CPF enquanto o usuário digita
  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/[^\d.-]/g, ''); // Permite apenas números, pontos e hífen
    value = value.slice(0, 14); // Limita a 14 caracteres (com formatação)
    setProfile((prev) => ({
      ...prev,
      driverDocument: { ...prev.driverDocument, cpf: value },
    }));
  };

  // Configuração dos dropzones
  const onDropProfile = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) setImageProfile(file);
  };
  const onDropDocument = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) setImageDocument(file);
  };

  // Usando a lib react-dropzone
  const {
    getRootProps: getProfileRootProps,
    getInputProps: getProfileInputProps,
  } = useDropzone({
    onDrop: onDropProfile,
    accept: 'image/*',
  });
  const {
    getRootProps: getDocumentRootProps,
    getInputProps: getDocumentInputProps,
  } = useDropzone({
    onDrop: onDropDocument,
    accept: 'image/*',
  });

  // Carrega os dados de perfil (GET /profile) quando o componente monta
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/profile');
        const data = response.data.data;

        if (data) {
          setProfile((prev) => ({
            ...prev,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            gender: data.gender || '',
            email: data.email || '',
            driverDocument: {
              driverLicenseNumber: data.driverDocument?.driverLicenseNumber || '',
              dateOfIssue: data.driverDocument?.dateOfIssue || '',
              expirationDate: data.driverDocument?.expirationDate || '',
              issuingState: data.driverDocument?.issuingState || '',
              cpf: data.driverDocument?.cpf || '',
              category: data.driverDocument?.category || '',
            },
            imageProfileUrl: data.profileImageUrl || '',
            imageDocumentUrl: data.driverDocument?.scanUrl || '',
          }));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          title: 'Erro ao carregar perfil',
          description: error.response?.data?.message || error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        // Resetar o perfil para valores padrão em caso de erro
        setProfile({
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
      }
    };
    fetchProfile();
  }, [toast]);

  // Atualiza a pré-visualização da imagem de perfil
  useEffect(() => {
    if (imageProfile) {
      const objectUrl = URL.createObjectURL(imageProfile);
      setProfileImagePreview(objectUrl);

      // Limpa a URL anterior quando o componente desmonta ou a imagem muda
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setProfileImagePreview(profile.imageProfileUrl || 'https://via.placeholder.com/300');
    }
  }, [imageProfile, profile.imageProfileUrl]);

  // Atualiza a pré-visualização do documento
  useEffect(() => {
    if (imageDocument) {
      const objectUrl = URL.createObjectURL(imageDocument);
      setDocumentImagePreview(objectUrl);

      // Limpa a URL anterior quando o componente desmonta ou a imagem muda
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setDocumentImagePreview(profile.imageDocumentUrl || 'https://via.placeholder.com/300');
    }
  }, [imageDocument, profile.imageDocumentUrl]);

  // Atualiza o perfil ao clicar em "Salvar"
  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();

      // Adiciona campos simples
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('gender', profile.gender);
      formData.append('email', profile.email);

      // Processa o CPF para remover formatação (pontos e hífen)
      const cpfRaw = profile.driverDocument.cpf.replace(/\D/g, ''); // Remove todos os não-dígitos

      // Cria um novo objeto driverDocument com o CPF processado
      const driverDocumentProcessed = {
        ...profile.driverDocument,
        cpf: cpfRaw,
      };

      // Adiciona o driverDocument como JSON
      formData.append('driverDocument', JSON.stringify(driverDocumentProcessed));

      // Só adiciona arquivos se existirem
      if (imageProfile) {
        formData.append('imageProfile', imageProfile, imageProfile.name || 'profile.jpg');
      }
      if (imageDocument) {
        formData.append('imageDocument', imageDocument, imageDocument.name || 'document.jpg');
      }

      // Log dos dados que serão enviados
      console.log('Dados enviados ao backend:', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        email: profile.email,
        driverDocument: driverDocumentProcessed,
      });

      // Faz a requisição PUT para atualizar o perfil
      await axiosInstance.put('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

  // Exibir mensagem de carregamento enquanto os dados do perfil estão sendo carregados
  if (isLoading) {
    return (
      <Flex
        minHeight="100vh"
        align="center"
        justify="center"
        bg="white"
        p={4}
      >
        <Text>Carregando perfil...</Text>
      </Flex>
    );
  }

  return (
    // Container flex para centralizar
    <Flex
      minHeight="100vh"
      align="center"
      justify="center"
      bg="white"
      p={4}
    >
      <Box
        bg={bg}
        maxW="800px"
        w="100%"
        p={{ base: 4, md: 8 }}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color={textColor}
          mb={6}
          textAlign="center"
        >
          Perfil do Usuário
        </Text>

        <Grid
          templateColumns={{ base: '1fr', md: '300px 1fr' }}
          gap={8}
          alignItems={{ base: 'center', md: 'start' }}
          justifyContent={{ base: 'center', md: 'flex-end' }}
        >
          {/* Foto do perfil + Documento à esquerda */}
          <Box textAlign={{ base: 'center', md: 'center' }}>
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
                name={profile?.firstName || 'Usuário'}
                src={profileImagePreview || 'https://via.placeholder.com/300'}
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

            {/* Documento (pequeno preview) */}
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
                src={documentImagePreview || 'https://via.placeholder.com/80'}
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

          {/* Campos de texto à direita */}
          <VStack
            spacing={4}
            align={{ base: 'center', md: 'start' }}
            w={{ base: '100%', md: 'auto' }}
          >
            {/* Nome */}
            <FormControl id="firstName">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Nome:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }}
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                placeholder="Primeiro Nome"
              />
            </FormControl>

            {/* Sobrenome */}
            <FormControl id="lastName">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Sobrenome:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }}
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                placeholder="Sobrenome"
              />
            </FormControl>

            {/* Gênero */}
            <FormControl id="gender">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Gênero:
              </FormLabel>
              <Select
                w={{ base: '100%', md: '360px' }}
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
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
                w={{ base: '100%', md: '360px' }}
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="Email"
              />
            </FormControl>

            {/* CPF */}
            <FormControl id="cpf">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                CPF:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }}
                size="sm"
                borderRadius="md"
                variant="filled"
                focusBorderColor="orange.400"
                value={profile.driverDocument.cpf}
                onChange={handleCPFChange}
                placeholder="CPF"
              />
            </FormControl>

            {/* Número da CNH */}
            <FormControl id="driverLicenseNumber">
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.500">
                Número CNH:
              </FormLabel>
              <Input
                w={{ base: '100%', md: '360px' }}
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
                w={{ base: '100%', md: '360px' }}
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
                w={{ base: '100%', md: '360px' }}
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
                w={{ base: '100%', md: '360px' }}
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
                w={{ base: '100%', md: '360px' }}
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
              w={{ base: '100%', md: '360px' }}
            >
              Salvar Alterações
            </Button>
          </VStack>
        </Grid>
      </Box>
    </Flex>
  );
}
