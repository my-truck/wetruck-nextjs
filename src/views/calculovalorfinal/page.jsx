// src/views/calculoValorFinal/page.jsx

import React, { useEffect, useContext, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  Spinner,
  useToast,
  HStack,
  Icon,
  Stack,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../../contexts/FormContext'; // Caminho correto
import axios from '../../axiosInstance';
import moment from 'moment-timezone';

import CaminhaoModelo from '../../assets/images/caminhaomodelo.png';

export default function CalculoValorFinal() {
  const { formData, updateFormData, resetFormData } = useContext(FormContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [valorFinal, setValorFinal] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Mapeamentos Reversos
  const categoriaParaId = {
    'Frete Residencial': 1,
    'Frete Comercial': 2,
    'Frete Cargas Pesadas': 3,
    'Frete Refrigerado, Congelado ou Aquecido': 4,
    'Frete Cargas Especiais': 5,
  };

  const subcategoriaParaId = {
    'Carga Geral': 1,
    'Conteinerizada': 2,
    'Granel Sólido': 3,
    'Granel Líquido': 4,
    'Neogranel': 5,
    'Carga Granel Pressurizada': 6,
    'Frigorificada ou Aquecida': 7,
    'Perigosa (frigorificada ou aquecida)': 8,
    'Perigosa (granel sólido)': 9,
    'Perigosa (granel líquido)': 10,
    'Perigosa (conteinerizada)': 11,
    // Adicione outras subcategorias conforme necessário
  };

  // Criar Mapeamentos Reversos (ID para String)
  const idParaCategoria = Object.fromEntries(
    Object.entries(categoriaParaId).map(([key, value]) => [value, key])
  );

  const idParaSubcategoria = Object.fromEntries(
    Object.entries(subcategoriaParaId).map(([key, value]) => [value, key])
  );

  useEffect(() => {
    console.log('Form Data no CalculoValorFinal:', formData);

    // Logs individuais para depuração
    console.log('Origin:', formData.origin);
    console.log('Destination:', formData.destination);
    console.log('Class Type ID:', formData.classTypeId);
    console.log('Vehicle Type ID:', formData.vehicleTypeId);
    console.log('Axle Number:', formData.eixoNumber);

    // Definir os campos obrigatórios para o cálculo do frete
    const requiredFields = ['origin', 'destination', 'classTypeId', 'vehicleTypeId', 'eixoNumber'];
    const missingFields = requiredFields.filter((field) => {
      if (field === 'origin' || field === 'destination') {
        // Verificar se o objeto está preenchido e todos os subcampos estão preenchidos
        return (
          !formData[field] ||
          !formData[field].address ||
          !formData[field].city ||
          !formData[field].state ||
          !formData[field].postalCode
        );
      }
      return !formData[field];
    });

    if (missingFields.length > 0) {
      toast({
        title: 'Etapas Incompletas',
        description: `Por favor, complete todas as etapas antes de calcular o valor final. Faltando: ${missingFields.join(
          ', '
        )}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/freight-selection'); // Atualize para a rota correta
      return;
    }

    if (!hasCalculated) {
      calcularValor();
    }
    // Adicione 'formData' e 'hasCalculated' como dependências
  }, [formData, hasCalculated, navigate, toast]);

  const calcularValor = async () => {
    try {
      setLoading(true);

      // Garantir que os IDs existam no mapeamento
      const categoriaString = idParaCategoria[formData.classTypeId];
      const subcategoriaString = idParaSubcategoria[formData.vehicleTypeId];

      console.log('Categoria String:', categoriaString);
      console.log('Subcategoria String:', subcategoriaString);

      if (!categoriaString || !subcategoriaString) {
        throw new Error('Categoria ou Subcategoria inválida.');
      }

      // Construir o endereço completo de origem e destino
      const originAddress = `${formData.origin.address}, ${formData.origin.city}, ${formData.origin.state}, ${formData.origin.postalCode}`;
      const destinationAddress = `${formData.destination.address}, ${formData.destination.city}, ${formData.destination.state}, ${formData.destination.postalCode}`;

      // Obter o número do eixo selecionado e ajustar conforme necessário
      let axleNumber = formData.eixoNumber;
      if (axleNumber === 1 || axleNumber === 2) {
        axleNumber = 2;
      }

      console.log('Axle Number Adjusted:', axleNumber);

      // Construir o payload conforme especificado
      const requestBody = {
        origins: originAddress,
        destinations: destinationAddress,
        loadType: [categoriaString, subcategoriaString],
        axle: axleNumber,
      };

      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      // Enviar a requisição para o endpoint correto
      console.log(`Enviando requisição para: /work/calculate-freight`);

      const response = await axios.post('/work/calculate-freight', requestBody);

      console.log('Response Data:', response.data);

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Erro no cálculo do frete');
      }

      const dadosFrete = response.data.data;

      // **Convertendo totalFreight para número**
      const totalFreight = Number(dadosFrete.totalFreight);
      if (isNaN(totalFreight)) {
        throw new Error('O valor total do frete não é um número válido.');
      }

      setValorFinal(totalFreight);
      setDetalhes([
        `Nome: ${dadosFrete.name}`,
        `Descrição: ${dadosFrete.description}`,
        `Distância: ${dadosFrete.distance} km`,
        `Tipo de Carga: ${dadosFrete.typeOfLoad}`,
        `Tipo de Caminhão: ${dadosFrete.typeOfTruck}`,
      ]);

      // Atualizar o FormContext com o valor final e distância
      updateFormData({
        value: totalFreight,
        distance: dadosFrete.distance,
      });

      setHasCalculated(true);
    } catch (error) {
      console.error('Erro ao calcular o valor final:', error);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message || 'Erro no cálculo do frete';
        toast({
          title: 'Erro',
          description: `Erro ${error.response.status}: ${errorMessage}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.request) {
        console.error('Request:', error.request);
        toast({
          title: 'Erro',
          description: 'Nenhuma resposta recebida do servidor. Verifique sua conexão.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error('Error Message:', error.message);
        toast({
          title: 'Erro',
          description: `Erro: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePedido = async () => {
    try {
      console.log('Iniciando handlePedido');
      console.log('Form Data:', formData);
      // Removido: console.log('userId:', formData.userId, 'Tipo:', typeof formData.userId);

      setLoading(true);

      // Garantir que classTypeId e vehicleTypeId sejam números
      const classTypeId = formData.classTypeId ? Number(formData.classTypeId) : null;
      const vehicleTypeId = formData.vehicleTypeId ? Number(formData.vehicleTypeId) : null;

      const pedidoBody = {
        name: `Frete de ${formData.origin.city} para ${formData.destination.city}`,
        description: `Transporte de carga de ${formData.origin.city} para ${formData.destination.city}`,
        value: formData.value,
        distance: formData.distance,
        // Removido: userId: formData.userId, // Removido o userId do payload
        origin: {
          address: formData.origin.address,
          city: formData.origin.city,
          state: formData.origin.state,
          postalCode: formData.origin.postalCode,
          complement: formData.origin.complement || '', // Garantir string
        },
        destination: {
          address: formData.destination.address,
          city: formData.destination.city,
          state: formData.destination.state,
          postalCode: formData.destination.postalCode,
          complement: formData.destination.complement || '', // Garantir string
        },
        scheduleStart: moment(formData.scheduleStart).tz('America/Sao_Paulo').toISOString(),
        scheduleEnd: moment(formData.scheduleEnd).tz('America/Sao_Paulo').toISOString(),
        classTypeId: classTypeId, // Número
        vehicleTypeId: vehicleTypeId, // Número
      };

      console.log('Pedido Body:', JSON.stringify(pedidoBody, null, 2));

      // Enviar a requisição para o endpoint correto
      console.log(`Enviando requisição para: /work`);

      const response = await axios.post('/work', pedidoBody);

      console.log('Response Data (Pedido):', response.data);

      if (response.status >= 200 && response.status < 300) { // Verificar status HTTP real
        const pedidoId = response.data.data?.id || response.data.id || 'N/A'; // Ajuste conforme a estrutura da resposta
        toast({
          title: 'Pedido realizado com sucesso',
          description: `Seu pedido foi criado com ID: ${pedidoId}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // **Resetar o formulário após o pedido ser realizado com sucesso**
        resetFormData();

        navigate('/admin/default');
      } else {
        throw new Error(response.data.message || 'Erro ao criar o pedido');
      }
    } catch (error) {
      console.error('Erro ao criar o pedido:', error);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message || 'Erro ao criar o pedido';
        toast({
          title: 'Erro',
          description: `Erro ${error.response.status}: ${errorMessage}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.request) {
        console.error('Request:', error.request);
        toast({
          title: 'Erro',
          description: 'Nenhuma resposta recebida do servidor. Verifique sua conexão.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error('Error Message:', error.message);
        toast({
          title: 'Erro',
          description: `Erro: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // **Resetar o formulário e navegar para /admin/default**
    resetFormData(); // Reseta o formulário
    navigate('/admin/default'); // Navega para a rota desejada
  };

  if (loading) {
    return (
      <Box
        bg="white"
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={8}
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
      mt={{ base: 0, md: '-100px' }}
    >
      <VStack spacing={8} align="center" maxW="1200px" w="100%">
        {/* Título */}
        <Text
          fontSize={{ base: '28px', md: '40px' }}
          fontWeight="extrabold"
          fontFamily="'Work Sans', sans-serif"
          textAlign="center"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="inline">
            Cálculo do
          </Text>
          <Text as="span" color="#ED8936" display="inline">
            {' '}Valor Final
          </Text>
        </Text>

        {/* Remover o componente UserIdDisplay */}

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={8}
          align="center"
          justify="center"
          w="100%"
        >
          {/* Seção de Imagem do Caminhão */}
          <VStack
            bg="#E6F0FB"
            borderRadius="24px"
            boxShadow="lg"
            p={4}
            w={{ base: '100%', md: '50%' }}
            align="center"
            spacing={4}
          >
            <Box
              w={{ base: '100%', md: '400px' }}
              h={{ base: '300px', md: '400px' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="24px"
              overflow="hidden"
            >
              <Image
                src={CaminhaoModelo}
                alt="Caminhão"
                objectFit="contain" // Ajuste para conter a imagem sem esticar
                w="100%"
                h="100%"
              />
            </Box>
          </VStack>

          {/* Informações sobre o Caminhão e Cálculo */}
          <VStack
            align="flex-start"
            spacing={4}
            w={{ base: '100%', md: '40%' }}
            pl={{ base: 0, md: 4 }}
          >
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2D3748">
              {formData.detalhesCarga || 'Descrição da Carga'}
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500">
              {formData.dimensoes || 'Dimensões da Carga'}
            </Text>

            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="#ED8936">
              {valorFinal !== null ? `R$ ${valorFinal.toFixed(2)}` : 'Calculando...'}
            </Text>

            {/* Lista com Ícones de Check */}
            {detalhes && detalhes.length > 0 && (
              <VStack align="start" spacing={2} fontSize={{ base: 'sm', md: 'md' }} color="gray.700">
                {detalhes.map((item, index) => (
                  <HStack key={index}>
                    <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                    <Text>{item}</Text>
                  </HStack>
                ))}
              </VStack>
            )}

            {/* Botões de Ação */}
            <HStack spacing={4} mt={4} w="100%" justifyContent="space-between">
              {/* Botão "Cancelar" */}
              <Button
                variant="outline"
                colorScheme="red"
                size="lg"
                w="45%"
                onClick={handleCancelar}
              >
                Cancelar
              </Button>

              {/* Botão "Pedir agora" */}
              <Button
                colorScheme="blue"
                size="lg"
                w="45%"
                onClick={handlePedido}
                isLoading={loading} // Adiciona estado de loading no botão
              >
                Pedir agora
              </Button>
            </HStack>
          </VStack>
        </Stack>
      </VStack>
    </Box>
  );
}
