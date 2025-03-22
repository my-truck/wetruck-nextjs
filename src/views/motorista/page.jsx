import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Textarea,
  useToast,
  IconButton,
  Flex,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Image,
  Heading,
  SimpleGrid,
  Badge,
  Card,
  CardBody,
  Progress,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronDownIcon, CheckCircleIcon, InfoIcon, TruckIcon } from "@chakra-ui/icons";
import { FaTruck, FaTag, FaMapMarkerAlt, FaInfoCircle, FaBox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import VehicleFormContext from '../../contexts/VehicleFormContext';
import axios from 'axios';

export default function Motorista() {
  const toast = useToast();
  const navigate = useNavigate();
  const { formData, setFormData } = useContext(VehicleFormContext);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [options, setOptions] = useState({
    vehicleTypes: [],
    vehicleClasses: [],
    loadTypes: [],
  });
  const [errorOptions, setErrorOptions] = useState('');
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);

  // Cores do tema
  const primaryColor = "orange.500";
  const secondaryColor = "orange.200";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("orange.100", "orange.700");
  
  const fetchFormOptions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Usuário não autenticado.');
      }
      const response = await axios.get('https://etc.wetruckhub.com/vehicles/form-options', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setOptions(response.data);
    } catch (error) {
      console.error('Erro ao buscar opções de formulário:', error);
      setErrorOptions(
        error.response?.data?.message ||
        error.message ||
        'Erro ao carregar opções do formulário. Tente novamente.'
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchFormOptions();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      vehicleClass,
      vehicleType,
      description,
      loadTypeIds,
      licensePlate,
      postalCode,
    } = formData;

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (
      !vehicleClass ||
      !vehicleType ||
      !description ||
      !licensePlate ||
      !postalCode ||
      !(loadTypeIds && loadTypeIds.length > 0)
    ) {
      toast({
        title: "Preenchimento incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
      return;
    }

    toast({
      title: "Dados salvos com sucesso!",
      description: "Agora vamos para o upload de fotos do seu caminhão.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
      variant: "solid",
    });

    navigate('/admin/upload-fotos-caminhao');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Atualiza o progresso com base nos campos preenchidos
    updateProgress();
  };
  
  const updateProgress = () => {
    const requiredFields = ['vehicleClass', 'vehicleType', 'description', 'licensePlate', 'postalCode'];
    const filledFields = requiredFields.filter(field => formData[field]);
    
    // Adiciona verificação para loadTypeIds (que é um array)
    const hasLoadTypes = formData.loadTypeIds && formData.loadTypeIds.length > 0;
    
    const progressValue = Math.round(((filledFields.length + (hasLoadTypes ? 1 : 0)) / (requiredFields.length + 1)) * 100);
    setProgress(progressValue);
  };
  
  const handleLoadTypeChange = (values) => {
    const parsedValues = values.map((val) => parseInt(val, 10));
    setFormData((prev) => ({
      ...prev,
      loadTypeIds: parsedValues,
    }));
    
    // Atualiza o progresso
    updateProgress();
  };
  
  const removeLoadType = (idToRemove) => {
    const updatedLoadTypes = formData.loadTypeIds.filter(id => id !== idToRemove);
    setFormData((prev) => ({
      ...prev,
      loadTypeIds: updatedLoadTypes,
    }));
    
    // Atualiza o progresso
    updateProgress();
  };

  const changeStep = (newStep) => {
    if (newStep <= 3 && newStep >= 1) {
      setStep(newStep);
    }
  };

  if (loadingOptions) {
    return (
      <Flex direction="column" align="center" justify="center" minHeight="100vh" bg="orange.50">
        <Image src="https://via.placeholder.com/150" alt="WeTruckHub Logo" mb={4} />
        <Text fontSize="xl" mb={4} color="orange.600" fontWeight="bold">Carregando formulário...</Text>
        <Spinner size="xl" color="orange.500" thickness="4px" />
      </Flex>
    );
  }

  if (errorOptions) {
    return (
      <Flex align="center" justify="center" minHeight="100vh" bg="orange.50" p={4}>
        <Card bg="white" shadow="md" p={6} borderRadius="lg" maxW="md" w="full">
          <CardBody>
            <VStack spacing={4}>
              <InfoIcon boxSize={12} color="red.500" />
              <Heading size="md" textAlign="center">Ops! Tivemos um problema</Heading>
              <Text color="red.500" textAlign="center">{errorOptions}</Text>
              <Button 
                colorScheme="orange" 
                onClick={() => fetchFormOptions()}
                leftIcon={<InfoIcon />}
              >
                Tentar novamente
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  const getVehicleClassName = (id) => {
    const foundClass = options.vehicleClasses.find(c => String(c.id) === String(id));
    return foundClass ? foundClass.name : '';
  };

  const getVehicleTypeName = (id) => {
    const foundType = options.vehicleTypes.find(t => String(t.id) === String(id));
    return foundType ? foundType.name : '';
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
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            variant="ghost"
            colorScheme="white"
            color="white"
            mr={3}
            _hover={{ bg: "orange.600" }}
          />
          <Box>
            <Flex align="center">
              <FaTruck color="white" size="1.5em" />
              <Heading size="lg" ml={2} color="white">
                Cadastre seu Caminhão
              </Heading>
            </Flex>
            <Text color="white" opacity={0.9} mt={1}>
              É rápido, fácil e você já pode começar a transportar cargas!
            </Text>
          </Box>
        </Flex>
        
        {/* Barra de progresso */}
        <Box mt={4}>
          <Flex justify="space-between" mb={1}>
            <Text color="white" fontWeight="medium">{progress}% completo</Text>
            <Text color="white">Etapa 1 de 2</Text>
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
      <form onSubmit={handleSubmit}>
        <VStack spacing={8} align="stretch">
          {/* Informações básicas */}
          <Box>
            <Flex align="center" mb={4}>
              <Heading size="md" color={primaryColor}>
                Informações do Veículo
              </Heading>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Classe do Caminhão */}
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  <Flex align="center">
                    <FaTruck color="#ED8936" />
                    <Text ml={2}>Classe do Caminhão</Text>
                  </Flex>
                </FormLabel>
                <Select
                  name="vehicleClass"
                  placeholder="Selecione a classe"
                  value={formData.vehicleClass || ''}
                  onChange={handleChange}
                  bg="white"
                  borderWidth={2}
                  borderColor={borderColor}
                  _hover={{ borderColor: primaryColor }}
                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                  height="50px"
                  icon={<ChevronDownIcon color={primaryColor} />}
                >
                  {options.vehicleClasses.map((classe) => (
                    <option key={classe.id} value={classe.id}>
                      {classe.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Tipo de Veículo */}
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  <Flex align="center">
                    <FaTag color="#ED8936" />
                    <Text ml={2}>Tipo de Veículo</Text>
                  </Flex>
                </FormLabel>
                <Select
                  name="vehicleType"
                  placeholder="Selecione o tipo"
                  value={formData.vehicleType || ''}
                  onChange={handleChange}
                  isDisabled={!formData.vehicleClass}
                  bg="white"
                  borderWidth={2}
                  borderColor={borderColor}
                  _hover={{ borderColor: primaryColor }}
                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                  height="50px"
                  icon={<ChevronDownIcon color={primaryColor} />}
                >
                  {options.vehicleTypes
                    .filter((tipo) => tipo.vehicleClassId === parseInt(formData.vehicleClass))
                    .map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.name}
                      </option>
                    ))}
                </Select>
              </FormControl>
            </SimpleGrid>

            {/* Descrição */}
            <FormControl isRequired mt={6}>
              <FormLabel fontWeight="bold" color="gray.700">
                <Flex align="center">
                  <FaInfoCircle color="#ED8936" />
                  <Text ml={2}>Descrição do Veículo</Text>
                </Flex>
              </FormLabel>
              <Textarea
                name="description"
                placeholder="Descreva seu caminhão (modelo, ano, capacidade, diferenciais...)"
                value={formData.description || ''}
                onChange={handleChange}
                borderWidth={2}
                borderColor={borderColor}
                _hover={{ borderColor: primaryColor }}
                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                minHeight="120px"
                bg="white"
              />
              <Text mt={1} fontSize="sm" color="gray.500">
                Uma boa descrição aumenta suas chances de conseguir fretes. Seja detalhista!
              </Text>
            </FormControl>

            {/* Tipo de Carga */}
            <FormControl isRequired mt={6}>
              <FormLabel fontWeight="bold" color="gray.700">
                <Flex align="center">
                  <FaBox color="#ED8936" />
                  <Text ml={2}>Tipos de Carga que Transporta</Text>
                </Flex>
              </FormLabel>
              
              {/* Menu Dropdown para seleção de cargas */}
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  w="full"
                  bg="white"
                  borderWidth={2}
                  borderColor={borderColor}
                  _hover={{ bg: "orange.50", borderColor: primaryColor }}
                  _active={{ bg: "orange.50" }}
                  height="50px"
                  textAlign="left"
                  py={2}
                >
                  Selecionar tipos de carga
                </MenuButton>
                <MenuList minWidth="240px">
                  <MenuOptionGroup
                    type="checkbox"
                    value={formData.loadTypeIds?.map(String) || []}
                    onChange={handleLoadTypeChange}
                  >
                    {options.loadTypes.map((carga) => (
                      <MenuItemOption
                        key={carga.id}
                        value={String(carga.id)}
                        _hover={{ bg: "orange.50" }}
                        _focus={{ bg: "orange.50" }}
                      >
                        {carga.name}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
              
              {/* Exibição das cargas selecionadas como tags */}
              {formData.loadTypeIds && formData.loadTypeIds.length > 0 && (
                <Box mt={4}>
                  <HStack spacing={2} flexWrap="wrap">
                    {formData.loadTypeIds.map(id => {
                      const loadType = options.loadTypes.find(lt => lt.id === id);
                      return (
                        <Tag 
                          key={id} 
                          size="md" 
                          borderRadius="full" 
                          variant="solid" 
                          colorScheme="orange" 
                          mb={2}
                        >
                          <TagLabel>{loadType?.name || id}</TagLabel>
                          <TagCloseButton onClick={() => removeLoadType(id)} />
                        </Tag>
                      );
                    })}
                  </HStack>
                </Box>
              )}
            </FormControl>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
              {/* Placa */}
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  <Flex align="center">
                    <FaTruck color="#ED8936" />
                    <Text ml={2}>Placa do Veículo</Text>
                  </Flex>
                </FormLabel>
                <Input
                  name="licensePlate"
                  placeholder="AAA-0000"
                  value={formData.licensePlate || ''}
                  onChange={handleChange}
                  bg="white"
                  borderWidth={2}
                  borderColor={borderColor}
                  _hover={{ borderColor: primaryColor }}
                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                  height="50px"
                />
              </FormControl>

              {/* CEP */}
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  <Flex align="center">
                    <FaMapMarkerAlt color="#ED8936" />
                    <Text ml={2}>CEP de Referência</Text>
                  </Flex>
                </FormLabel>
                <Input
                  name="postalCode"
                  placeholder="00000-000"
                  value={formData.postalCode || ''}
                  onChange={handleChange}
                  bg="white"
                  borderWidth={2}
                  borderColor={borderColor}
                  _hover={{ borderColor: primaryColor }}
                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                  height="50px"
                />
                <Text mt={1} fontSize="sm" color="gray.500">
                  Usamos o CEP para encontrar fretes próximos à sua região
                </Text>
              </FormControl>
            </SimpleGrid>
          </Box>
                    
          {/* Preview do veículo (se já tiver selecionado classe e tipo) */}
          {formData.vehicleClass && formData.vehicleType && (
            <Box 
              borderWidth="1px" 
              borderRadius="lg" 
              overflow="hidden" 
              bg="orange.50" 
              p={4}
              borderColor="orange.200"
            >
              <Flex align="center" mb={2}>
                <FaTruck size="1.5em" color="#ED8936" />
                <Heading size="md" ml={2} color="orange.600">
                  Resumo do Veículo
                </Heading>
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.700">Classe:</Text>
                  <Text>{getVehicleClassName(formData.vehicleClass)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.700">Tipo:</Text>
                  <Text>{getVehicleTypeName(formData.vehicleType)}</Text>
                </Box>
                {formData.loadTypeIds && formData.loadTypeIds.length > 0 && (
                  <Box gridColumn={{ md: "span 2" }}>
                    <Text fontWeight="bold" color="gray.700">Cargas:</Text>
                    <Flex flexWrap="wrap" gap={2} mt={1}>
                      {formData.loadTypeIds.map(id => {
                        const loadType = options.loadTypes.find(lt => lt.id === id);
                        return (
                          <Badge 
                            key={id} 
                            colorScheme="orange" 
                            px={2} 
                            py={1} 
                            borderRadius="full"
                          >
                            {loadType?.name || id}
                          </Badge>
                        );
                      })}
                    </Flex>
                  </Box>
                )}
              </SimpleGrid>
            </Box>
          )}

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
              onClick={() => navigate(-1)}
              colorScheme="orange"
              border="2px solid"
              height="50px"
              flex={{ sm: 1 }}
            >
              Cancelar
            </Button>
            <Button 
              colorScheme="orange" 
              type="submit" 
              height="50px"
              flex={{ sm: 2 }}
              _hover={{ bg: "orange.600" }}
              rightIcon={<CheckCircleIcon />}
              shadow="md"
            >
              Avançar para Upload de Fotos
            </Button>
          </Flex>
        </VStack>
      </form>

      {/* Informação adicional */}
      <Flex 
        mt={8} 
        p={4} 
        borderRadius="md" 
        bg="orange.50" 
        borderLeft="4px solid" 
        borderColor="orange.400"
        align="center"
      >
        <InfoIcon color="orange.500" mr={3} />
        <Text fontSize="sm" color="gray.600">
          <Text as="span" fontWeight="medium">Preço dinâmico:</Text> Iremos atualizá-lo de acordo com a localização 
          do pedido, adicionando o valor da comissão correspondente. Calculado com base na ANTT.
        </Text>
      </Flex>
    </Box>
  );
}