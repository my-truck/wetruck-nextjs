// src/views/motorista/page.jsx

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
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
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
      setErrorOptions(error.response?.data?.message || error.message || 'Erro ao carregar opções do formulário. Tente novamente.');
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação simples
    const { vehicleClass, vehicleType, loadTypeId, description, licensePlate, postalCode } = formData;
    if (!vehicleClass || !vehicleType || !loadTypeId || !description || !licensePlate || !postalCode) {
      toast({
        title: "Preenchimento incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Proceder para a próxima etapa (upload de fotos)
    toast({
      title: "Dados salvos.",
      description: "Próxima etapa: Upload de fotos.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    navigate('/admin/upload-fotos-caminhao');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loadingOptions) {
    return (
      <Flex align="center" justify="center" minHeight="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (errorOptions) {
    return (
      <Flex align="center" justify="center" minHeight="100vh">
        <Text color="red.500">{errorOptions}</Text>
      </Flex>
    );
  }

  return (
    <Box p={8} maxW="500px" mx="auto">
      {/* Título e Botão de Voltar na mesma linha */}
      <Flex align="center" mb={4}>
        <IconButton
          icon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          size="lg"
          variant="ghost"
          colorScheme="orange"
          mr={2}
        />
        <Text fontSize="2xl" fontWeight="bold">
          Cadastre seu Caminhão
        </Text>
      </Flex>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* Seleção da Classe do Veículo */}
          <FormControl isRequired>
            <FormLabel>Classe do Caminhão</FormLabel>
            <Select
              name="vehicleClass"
              placeholder="Selecione"
              value={formData.vehicleClass}
              onChange={handleChange}
            >
              {options.vehicleClasses.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Seleção do Tipo de Veículo */}
          <FormControl isRequired>
            <FormLabel>Tipo de Veículo</FormLabel>
            <Select
              name="vehicleType" // Renomeado de 'bodyType' para 'vehicleType'
              placeholder="Selecione"
              value={formData.vehicleType}
              onChange={handleChange}
              isDisabled={!formData.vehicleClass} // Desabilita até que uma classe seja selecionada
            >
              {options.vehicleTypes
                .filter(tipo => tipo.vehicleClassId === parseInt(formData.vehicleClass))
                .map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.name}
                  </option>
              ))}
            </Select>
          </FormControl>

          {/* Descrição */}
          <FormControl isRequired>
            <FormLabel>Descrição</FormLabel>
            <Textarea
              name="description"
              placeholder="Descreva o seu caminhão"
              value={formData.description}
              onChange={handleChange}
            />
          </FormControl>

          {/* Seleção do Tipo de Carga */}
          <FormControl isRequired>
            <FormLabel>Tipo de Carga</FormLabel>
            <Select
              name="loadTypeId"
              placeholder="Selecione"
              value={formData.loadTypeId}
              onChange={handleChange}
            >
              {options.loadTypes.map((carga) => (
                <option key={carga.id} value={carga.id}>
                  {carga.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Placa do Veículo */}
          <FormControl isRequired>
            <FormLabel>Placa</FormLabel>
            <Input
              name="licensePlate"
              placeholder="Digite a placa do veículo"
              value={formData.licensePlate}
              onChange={handleChange}
            />
          </FormControl>

          {/* CEP */}
          <FormControl isRequired>
            <FormLabel>Digite o CEP</FormLabel>
            <Input
              name="postalCode"
              placeholder="CEP"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </FormControl>

          {/* Botões */}
          <Button colorScheme="blue" type="submit" w="full">
            Próxima Etapa
          </Button>

          <Button variant="outline" w="full" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </VStack>
      </form>

      {/* Informação Adicional */}
      <Text mt={8} fontSize="sm" color="gray.500">
        Preço dinâmico: iremos atualizá-lo de acordo com a localização do pedido, adicionando o valor da comissão correspondente. Calculado com base da ANTT.
      </Text>
    </Box>
  );
}
