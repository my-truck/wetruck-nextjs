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
  Heading,
  InputGroup,
  InputLeftElement,
  Icon,
  Badge,
  Container,
  Skeleton,
  useBreakpointValue,
  HStack,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { 
  FaCamera, 
  FaUser, 
  FaEnvelope, 
  FaIdCard, 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaTruck,
  FaUpload,
  FaSave
} from 'react-icons/fa';
import axiosInstance from '../../axiosInstance';

export default function Profile() {
  // Theme-dependent values - defined BEFORE any conditional returns
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const sectionBg = useColorModeValue('gray.100', 'gray.700');
  const iconColor = useColorModeValue('blue.600', 'blue.400');
  const headerBg = useColorModeValue('blue.700', 'blue.900');
  
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
  const [isSaving, setIsSaving] = useState(false);

  const avatarSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const toast = useToast();

  // Formatação de CPF
  const formatCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return cpf.replace(/(\d{3})(\d+)/, '$1.$2');
    if (cpf.length <= 9) return cpf.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
  };

  // Função para formatar o CPF enquanto o usuário digita
  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, ''); // Permite apenas números
    value = value.slice(0, 11); // Limita a 11 caracteres (sem formatação)
    const formattedValue = formatCPF(value);
    setProfile((prev) => ({
      ...prev,
      driverDocument: { ...prev.driverDocument, cpf: formattedValue },
    }));
  };

  // Formatação de CNH
  const handleCNHChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 11);
    setProfile((prev) => ({
      ...prev,
      driverDocument: { ...prev.driverDocument, driverLicenseNumber: value },
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
    isDragActive: isProfileDragActive,
  } = useDropzone({
    onDrop: onDropProfile,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
  });
  
  const {
    getRootProps: getDocumentRootProps,
    getInputProps: getDocumentInputProps,
    isDragActive: isDocumentDragActive,
  } = useDropzone({
    onDrop: onDropDocument,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
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
          position: 'top'
        });
        setIsLoading(false);
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
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setDocumentImagePreview(profile.imageDocumentUrl || 'https://via.placeholder.com/300');
    }
  }, [imageDocument, profile.imageDocumentUrl]);

  // Atualiza o perfil ao clicar em "Salvar"
  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      // Adiciona campos simples
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('gender', profile.gender);
      formData.append('email', profile.email);

      // Processa o CPF para remover formatação (pontos e hífen)
      const cpfRaw = profile.driverDocument.cpf.replace(/\D/g, '');

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
        position: 'top'
      });
    } catch (error) {
      console.error('Erro no servidor:', error.response?.data || error.message);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Exibir mensagem de carregamento enquanto os dados do perfil estão sendo carregados
  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="50px" width="300px" mx="auto" />
          <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={8}>
            <VStack spacing={4} align="center">
              <Skeleton height="300px" width="300px" borderRadius="md" />
              <Skeleton height="100px" width="300px" />
            </VStack>
            <VStack spacing={4} align="stretch">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height="40px" />
              ))}
            </VStack>
          </Grid>
        </VStack>
      </Container>
    );
  }

  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="container.lg">
        <Box
          bg={cardBg}
          borderRadius="md"
          boxShadow="md"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Box 
            bg={headerBg}
            py={4} 
            px={6}
          >
            <Flex alignItems="center">
              <Icon as={FaTruck} boxSize={6} color="white" mr={3} />
              <Box>
                <Heading as="h1" size="lg" color="white" fontWeight="bold">
                  Cadastro de Motorista
                </Heading>
                <Text color="whiteAlpha.800" fontSize="sm">
                  Mantenha seus dados sempre atualizados para operação de transporte
                </Text>
              </Box>
            </Flex>
          </Box>

          <Box p={{ base: 4, md: 6 }} mt={4}>
            <Grid
              templateColumns={{ base: '1fr', md: '300px 1fr' }}
              gap={{ base: 8, md: 12 }}
              alignItems="start"
            >
              {/* Coluna esquerda: Foto e documento */}
              <VStack spacing={6} align="center">
                {/* Foto do perfil */}
                <VStack spacing={2} width="100%">
                  <Text 
                    fontWeight="medium" 
                    color={textColor} 
                    fontSize="md"
                    alignSelf="flex-start"
                  >
                   
                  </Text>
                  <Box
                    position="relative"
                    borderRadius="md"
                    overflow="hidden"
                    boxShadow="sm"
                    transition="all 0.2s"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor={isProfileDragActive ? "blue.400" : borderColor}
                    _hover={{ borderColor: "blue.300" }}
                    {...getProfileRootProps()}
                    cursor="pointer"
                  >
                    <input {...getProfileInputProps()} />
                    <Avatar
                      name={`${profile.firstName} ${profile.lastName}`}
                      src={profileImagePreview}
                      size={avatarSize}
                      borderRadius="md"
                      objectFit="cover"
                      boxSize="250px"
                    />
                    <Flex
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      bg="blackAlpha.700"
                      color="white"
                      p={2}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaCamera} mr={2} />
                      <Text fontSize="sm">Alterar foto</Text>
                    </Flex>
                  </Box>
                </VStack>

                {/* CNH / Documento */}
                <Box 
                  bg={sectionBg} 
                  p={4} 
                  borderRadius="md" 
                  boxShadow="sm"
                  width="100%"
                >
                  <Text fontWeight="semibold" color={textColor} mb={3}>
                    Documento (CNH)
                  </Text>
                  <Box
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor={isDocumentDragActive ? "blue.400" : borderColor}
                    borderRadius="md"
                    p={4}
                    bg={inputBg}
                    transition="all 0.2s"
                    _hover={{ borderColor: "blue.300" }}
                    {...getDocumentRootProps()}
                    cursor="pointer"
                    textAlign="center"
                  >
                    <input {...getDocumentInputProps()} />
                    <Box 
                      mx="auto" 
                      mb={3} 
                      maxH="160px" 
                      overflow="hidden" 
                      bg="gray.100"
                      borderRadius="md"
                    >
                      <Image
                        src={documentImagePreview}
                        alt="Documento"
                        maxH="160px"
                        mx="auto"
                        objectFit="contain"
                      />
                    </Box>
                    <HStack spacing={2} justify="center">
                      <Icon as={FaUpload} color={iconColor} />
                      <Text fontSize="sm" color="gray.600">
                        Carregar arquivo
                      </Text>
                    </HStack>
                  </Box>
                </Box>

                {/* Validade da CNH */}
                {profile.driverDocument.expirationDate && (
                  <Box 
                    width="100%" 
                    borderRadius="md" 
                    p={3} 
                    bg={
                      new Date(profile.driverDocument.expirationDate) < new Date() 
                        ? "red.50" 
                        : "green.50"
                    }
                    borderWidth="1px"
                    borderColor={
                      new Date(profile.driverDocument.expirationDate) < new Date() 
                        ? "red.200" 
                        : "green.200"
                    }
                  >
                    <HStack>
                      <Icon 
                        as={FaCalendarAlt} 
                        color={
                          new Date(profile.driverDocument.expirationDate) < new Date() 
                            ? "red.500" 
                            : "green.500"
                        } 
                      />
                      <Text fontSize="sm" fontWeight="medium">
                        Status da CNH: {
                          new Date(profile.driverDocument.expirationDate) < new Date() 
                            ? "Vencida" 
                            : "Válida"
                        }
                      </Text>
                    </HStack>
                    <Text fontSize="xs" mt={1} ml={6}>
                      Data de validade: {new Date(profile.driverDocument.expirationDate).toLocaleDateString('pt-BR')}
                    </Text>
                  </Box>
                )}
              </VStack>

              {/* Coluna direita: Formulários */}
              <Box>
                {/* Seção Informações Pessoais */}
                <Box mb={6}>
                  <Flex 
                    align="center" 
                    bg={headerBg}
                    color="white" 
                    p={2} 
                    ps={4}
                    borderRadius="md" 
                    mb={4}
                  >
                    <Icon as={FaUser} mr={2} />
                    <Text fontWeight="medium" fontSize="md">
                      Informações Pessoais
                    </Text>
                  </Flex>
                  
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    {/* Nome */}
                    <FormControl id="firstName">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Nome
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaUser} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
                          value={profile.firstName}
                          onChange={(e) =>
                            setProfile({ ...profile, firstName: e.target.value })
                          }
                          placeholder="Primeiro Nome"
                        />
                      </InputGroup>
                    </FormControl>

                    {/* Sobrenome */}
                    <FormControl id="lastName">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Sobrenome
                      </FormLabel>
                      <Input
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor="blue.500"
                        value={profile.lastName}
                        onChange={(e) =>
                          setProfile({ ...profile, lastName: e.target.value })
                        }
                        placeholder="Sobrenome"
                      />
                    </FormControl>

                    {/* Email */}
                    <FormControl id="email">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Email
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaEnvelope} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                          placeholder="Email"
                          type="email"
                        />
                      </InputGroup>
                    </FormControl>

                    {/* Gênero */}
                    <FormControl id="gender">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Gênero
                      </FormLabel>
                      <Select
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor="blue.500"
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
                  </Grid>
                </Box>

                {/* Seção Documentos */}
                <Box>
                  <Flex 
                    align="center" 
                    bg={headerBg}
                    color="white" 
                    p={2} 
                    ps={4}
                    borderRadius="md" 
                    mb={4}
                  >
                    <Icon as={FaIdCard} mr={2} />
                    <Text fontWeight="medium" fontSize="md">
                      Informações da CNH
                    </Text>
                  </Flex>
                  
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    {/* CPF */}
                    <FormControl id="cpf">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        CPF
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaIdCard} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
                          value={profile.driverDocument.cpf}
                          onChange={handleCPFChange}
                          placeholder="000.000.000-00"
                        />
                      </InputGroup>
                    </FormControl>

                    {/* Número da CNH */}
                    <FormControl id="driverLicenseNumber">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Número CNH
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaIdCard} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
                          value={profile.driverDocument.driverLicenseNumber}
                          onChange={handleCNHChange}
                          placeholder="00000000000"
                        />
                      </InputGroup>
                    </FormControl>

                    {/* Data de Emissão */}
                    <FormControl id="dateOfIssue">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Data de Emissão
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaCalendarAlt} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
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
                      </InputGroup>
                    </FormControl>

                    {/* Data de Expiração */}
                    <FormControl id="expirationDate">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Data de Expiração
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaCalendarAlt} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
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
                      </InputGroup>
                    </FormControl>

                    {/* Estado Emissor */}
                    <FormControl id="issuingState">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Estado Emissor
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaMapMarkerAlt} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
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
                          placeholder="UF"
                          maxLength={2}
                        />
                      </InputGroup>
                    </FormControl>

                    {/* Categoria */}
                    <FormControl id="category">
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Categoria
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaTruck} color={iconColor} opacity={0.6} />
                        </InputLeftElement>
                        <Input
                          bg={inputBg}
                          borderRadius="md"
                          pl={10}
                          focusBorderColor="blue.500"
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
                      </InputGroup>
                      <Flex mt={2} flexWrap="wrap" gap={1}>
                        {['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'].map(cat => (
                          <Badge 
                            key={cat}
                            colorScheme={profile.driverDocument.category === cat ? "blue" : "gray"}
                            variant={profile.driverDocument.category === cat ? "solid" : "outline"}
                            cursor="pointer"
                            onClick={() => 
                              setProfile((prev) => ({
                                ...prev,
                                driverDocument: {
                                  ...prev.driverDocument,
                                  category: cat,
                                },
                              }))
                            }
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </Flex>
                    </FormControl>
                  </Grid>
                </Box>

                {/* Botão Salvar */}
                <Flex justify="flex-end" mt={8}>
                  <Button
                    colorScheme="blue"
                    size="md"
                    onClick={handleUpdateProfile}
                    leftIcon={<FaSave />}
                    isLoading={isSaving}
                    loadingText="Salvando..."
                    boxShadow="sm"
                    _hover={{ bg: "blue.600" }}
                    transition="all 0.2s"
                  >
                    Salvar Alterações
                  </Button>
                </Flex>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}