// src/views/origemedestino/page.jsx

import React, { useState, useContext } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { FormContext } from '../../contexts/FormContext'; // Usando FormContext

export default function EscolhaOrigemDestino() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useContext(FormContext); // Uso do FormContext
  const [originInput, setOriginInput] = useState(formData.origin?.address || '');
  const [destinationInput, setDestinationInput] = useState(formData.destination?.address || '');
  const [endereco, setEndereco] = useState(null);
  const [complemento, setComplemento] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipoEndereco, setTipoEndereco] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Função para buscar endereço pela API do ViaCEP
  const fetchEndereco = async (cep, tipo) => {
    try {
      setLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setEndereco(data);
        setTipoEndereco(tipo);
        setComplemento('');
        onOpen();
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar o endereço",
        description: "Verifique o CEP e tente novamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOriginChange = (e) => {
    const value = e.target.value;
    setOriginInput(value);
    if (value.length === 8 && /^[0-9]+$/.test(value)) {
      fetchEndereco(value, 'Origin');
    }
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestinationInput(value);
    if (value.length === 8 && /^[0-9]+$/.test(value)) {
      fetchEndereco(value, 'Destination');
    }
  };

  const handleAtualizarEndereco = () => {
    if (!endereco) {
      toast({
        title: "Erro",
        description: "Endereço não carregado.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Construir o endereço completo com o complemento
    const enderecoCompleto = `${endereco.logradouro}, ${complemento}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
    if (tipoEndereco === 'Origin') {
      updateFormData({ origin: { 
        ...formData.origin, // Preserva outras propriedades
        address: enderecoCompleto,
        city: endereco.localidade,
        state: endereco.uf,
        postalCode: endereco.cep,
        complement: complemento || '', // Garantir string
      } }); // Atualiza 'origin' como objeto completo
    } else {
      updateFormData({ destination: { 
        ...formData.destination, // Preserva outras propriedades
        address: enderecoCompleto,
        city: endereco.localidade,
        state: endereco.uf,
        postalCode: endereco.cep,
        complement: complemento || '', // Garantir string
      } }); // Atualiza 'destination' como objeto completo
    }
    onClose();
  };

  // Permitir que o usuário atualize o endereço pressionando "Enter"
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAtualizarEndereco();
    }
  };

  const handleNext = () => {
    // Verificar se 'origin.address' e 'destination.address' estão preenchidos
    if (!formData.origin?.address || !formData.destination?.address) {
      toast({
        title: "Preencha todos os campos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    navigate('/admin/agendar'); // Atualize para a próxima etapa
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 150px)"
      bg={useColorModeValue("white", "gray.800")}
      p={4}
    >
      <VStack
        spacing={6}
        align="center"
        maxW="600px"
        w="100%"
        mt={{ base: "0", md: "-100px" }} // Subir apenas em telas maiores
        mb="0" // Remove o espaço inferior
      >
        {/* Título da página */}
        <Text
          fontSize={{ base: "28px", md: "40px" }}
          fontWeight="extrabold"
          textAlign="center"
          fontFamily="'Work Sans', sans-serif"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="block">
            Escolha da
          </Text>
          <Text as="span" color="#ED8936" display="inline">
            Origem
          </Text>
          <Text as="span" color="#2D3748" display="inline">
            {" e "}
          </Text>
          <Text as="span" color="#ED8936" display="inline">
            Destino
          </Text>
        </Text>

        {/* Formulário para entrada de origem e destino */}
        <VStack spacing={4} w="100%" align="start">
          <Text fontSize="md" fontWeight="semibold" color="gray.600">
            Digite o CEP ou Endereço de Origem e Destino*
          </Text>

          <Input
            placeholder="CEP ou Endereço de Origem"
            size="lg"
            borderColor="gray.300"
            focusBorderColor="blue.500"
            borderRadius="md"
            w="100%"
            maxW="600px"
            value={formData.origin?.address || originInput}
            onChange={handleOriginChange}
            isDisabled={loading}
          />

          <Input
            placeholder="CEP ou Endereço de Destino"
            size="lg"
            borderColor="gray.300"
            focusBorderColor="blue.500"
            borderRadius="md"
            w="100%"
            maxW="600px"
            value={formData.destination?.address || destinationInput}
            onChange={handleDestinationChange}
            isDisabled={loading}
          />

          {loading && <Spinner size="md" />}
        </VStack>

        {/* Botões de Ação */}
        <HStack spacing={4} mt={4} w="100%" justifyContent="center">
          <Button
            variant="outline"
            colorScheme="gray"
            w="40%"
            maxW="200px"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            w="40%"
            maxW="200px"
            onClick={handleNext}
          >
            Próxima etapa
          </Button>
        </HStack>

        {/* Modal para exibir o endereço e adicionar complemento */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent maxW="500px">
            <ModalHeader>
              Detalhes do Endereço de {tipoEndereco}
              <IconButton
                icon={<CloseIcon />}
                aria-label="Fechar"
                size="sm"
                position="absolute"
                top="10px"
                right="10px"
                onClick={onClose}
              />
            </ModalHeader>
            <ModalBody>
              {endereco && (
                <Box textAlign="left" ml={4} mr={4}>
                  <Text><strong>Logradouro:</strong> {endereco.logradouro}</Text>
                  <Text><strong>Bairro:</strong> {endereco.bairro}</Text>
                  <Text><strong>Cidade:</strong> {endereco.localidade}</Text>
                  <Text><strong>Estado:</strong> {endereco.uf}</Text>
                  <Input
                    placeholder="Complemento (ex: Apt 101, Bloco B)"
                    size="md"
                    mt={3}
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    onKeyDown={handleKeyDown}
                    w="100%"
                    borderColor="gray.300"
                  />
                </Box>
              )}
            </ModalBody>
            <ModalFooter justifyContent="center">
              <Button colorScheme="blue" onClick={handleAtualizarEndereco}>
                Atualizar Endereço
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}
