// src/views/dadoscarga/page.jsx

import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Textarea,
  Select,
  Button,
  useColorModeValue,
  FormControl,
  FormLabel,
  useToast,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  List,
  ListItem,
  ListIcon,
  RadioGroup,
  Radio,
  Stack,
  Divider,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { FormContext } from "../../contexts/FormContext";

// Importar os mapeamentos
import { 
  categoryToSubcategories, 
  freightToAxes, 
  eixoToVehicles, 
  categoryEixoToVehicles, // Novo mapeamento
  subcategoriaParaId, 
  categoriaParaId 
} from '../../utils/freightMapping';

// Importação de uma imagem padrão ou use um placeholder
import CaminhaoModelo from "../../assets/images/caminhaomodelo.png";

// Definição das classes de peso com um único eixo
const weightClasses = [
  { label: "Leve", range: "0kg a 3 toneladas", eixo: 1 },
  { label: "Médio", range: "3 a 8 toneladas", eixo: 2 },
  { label: "Pesado", range: "8 a 15 toneladas", eixo: 3 },
  { label: "Muito Pesado", range: "15 a 30 toneladas", eixo: 4 },
];

// Função utilitária para obter as subcategorias com base na categoria selecionada
const getSubcategories = (categoria) => {
  return categoryToSubcategories[categoria] || [];
};

// Função para extrair min e max em kg do range
const parseRangeToKg = (rangeStr) => {
  // Exemplo de rangeStr: "0kg a 3 toneladas"
  const regexKgTon = /(\d+)\s*kg\s*a\s*(\d+)\s*toneladas/i;
  const matchKgTon = rangeStr.match(regexKgTon);
  if (matchKgTon) {
    const min = parseInt(matchKgTon[1], 10);
    const max = parseInt(matchKgTon[2], 10) * 1000; // Convertendo toneladas para kg
    return { min, max };
  }

  // Exemplo de rangeStr: "3 a 8 toneladas"
  const regexTon = /(\d+)\s*a\s*(\d+)\s*toneladas/i;
  const matchTon = rangeStr.match(regexTon);
  if (matchTon) {
    const min = parseInt(matchTon[1], 10) * 1000;
    const max = parseInt(matchTon[2], 10) * 1000;
    return { min, max };
  }

  // Se não corresponder, retorna { min: 0, max: 0 }
  return { min: 0, max: 0 };
};

export default function DetalhesCarga() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useContext(FormContext);
  const { categoria, allowedAxes } = formData;

  const [tipoCarga, setTipoCarga] = useState(formData.tipoCarga || "");
  const [detalhesCarga, setDetalhesCarga] = useState(formData.detalhesCarga || "");
  const [pesoEstimado, setPesoEstimado] = useState(formData.pesoEstimado || 0);
  const [selectedEixo, setSelectedEixo] = useState(formData.selectedEixo || null); // Estado para a classe de peso selecionada
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do modal
  const [chosenEixoType, setChosenEixoType] = useState("eixo1"); // Novo estado para escolher entre Eixo 1 ou Eixo 2
  const toast = useToast();

  useEffect(() => {
    if (!categoria) {
      toast({
        title: "Categoria Não Selecionada",
        description: "Por favor, selecione um tipo de frete primeiro.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/admin/freight-selection");
    } else {
      // Atualizar allowedAxes com base na categoria selecionada
      const axes = freightToAxes[categoria] || [];
      // Verificar se axes é diferente de allowedAxes antes de atualizar
      const axesAreDifferent = 
        axes.length !== allowedAxes.length || 
        !axes.every((axis, index) => axis === allowedAxes[index]);

      if (axesAreDifferent) {
        updateFormData({ allowedAxes: axes });
        console.log('allowedAxes set to:', axes);
      }

      // Obter as subcategorias com base na categoria selecionada
      const subcategorias = getSubcategories(categoria);

      // Se há apenas uma subcategoria, pré-selecionar
      if (subcategorias.length === 1 && !tipoCarga) {
        setTipoCarga(subcategorias[0]);
        updateFormData({ tipoCarga: subcategorias[0] });
        console.log(`Pré-selecionada a subcategoria: ${subcategorias[0]}`);
      }

      // **REMOVER** a pré-seleção automática do eixo e abertura do modal
      // Isso garante que o modal só seja aberto quando o usuário selecionar manualmente uma classe de peso
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria, navigate, toast, updateFormData, allowedAxes, tipoCarga]);

  // Obter as subcategorias com base na categoria selecionada
  const subcategorias = getSubcategories(categoria);

  // Filtrar as classes de peso com base nos eixos permitidos
  const filteredWeightClasses = weightClasses.filter((wc) =>
    allowedAxes.includes(wc.eixo)
  );

  // Função para abrir o modal com informações sobre a classe de peso selecionada
  const handleEixoInfo = (wc) => {
    setSelectedEixo(wc);
    setChosenEixoType("eixo1"); // Resetar a escolha do eixo ao abrir o modal
    setIsModalOpen(true);
  };

  // Função para confirmar a seleção da classe de peso
  const handleSelectEixo = () => {
    console.log('Tipo de Carga Selecionado:', tipoCarga); // Log adicionado
    if (selectedEixo) {
      // Mapeamento de subcategoria para vehicleTypeId
      const vehicleTypeId = subcategoriaParaId[tipoCarga];

      console.log('Vehicle Type ID Mapeado:', vehicleTypeId); // Log adicionado

      // Verificar se o ID foi mapeado corretamente
      if (!vehicleTypeId) {
        toast({
          title: "Erro de Mapeamento",
          description: "Não foi possível mapear a subcategoria selecionada.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error(`Falha no mapeamento: subcategoria '${tipoCarga}' não encontrada em subcategoriaParaId.`);
        return;
      }

      // Mapear categoria para classTypeId
      const classTypeId = categoriaParaId[categoria];

      console.log('Class Type ID Mapeado:', classTypeId); // Log adicionado

      if (!classTypeId) {
        toast({
          title: "Erro de Mapeamento",
          description: "Categoria selecionada é inválida.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error(`Falha no mapeamento: categoria '${categoria}' não encontrada em categoriaParaId.`);
        return;
      }

      // **Ajuste do Eixo:** Condicional para "Frete Residencial"
      let eixoNumberAjustado;
      if (categoria === 'Frete Residencial') {
        eixoNumberAjustado = 2;
      } else {
        eixoNumberAjustado = selectedEixo.eixo;
      }

      updateFormData({
        selectedEixo,
        eixoNumber: eixoNumberAjustado, // Armazena o número do eixo ajustado
        vehicleTypeId: vehicleTypeId, // Atualiza vehicleTypeId
        classTypeId: classTypeId, // Atualiza classTypeId
        chosenEixoType: chosenEixoType, // Armazena a escolha do eixo para referência futura, se necessário
      });

      console.log('Dados atualizados no contexto após seleção de classe de peso:', {
        selectedEixo,
        eixoNumber: eixoNumberAjustado,
        vehicleTypeId: vehicleTypeId,
        classTypeId: classTypeId,
        chosenEixoType: chosenEixoType,
      });

      setIsModalOpen(false);
      toast({
        title: "Classe Selecionada",
        description: `Você selecionou a classe de peso: ${selectedEixo.label} (${categoria === 'Frete Residencial' ? 'Eixo 2' : `Eixo ${selectedEixo.eixo}`}).`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNext = () => {
    if (!tipoCarga || !selectedEixo || !detalhesCarga.trim()) {
      toast({
        title: "Campos Faltando",
        description: "Por favor, preencha todos os campos obrigatórios.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Garantir que classTypeId e vehicleTypeId estão definidos
    if (!formData.classTypeId || !formData.vehicleTypeId) {
      toast({
        title: "IDs Não Definidos",
        description: "Por favor, selecione uma classe de peso válida.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    updateFormData({
      tipoCarga,
      detalhesCarga,
      pesoEstimado,
      // classTypeId e vehicleTypeId já foram atualizados em handleSelectEixo
      // selectedEixo e eixoNumber também já foram atualizados
    });

    console.log('Dados atualizados no contexto após Detalhes da Carga:', {
      tipoCarga,
      detalhesCarga,
      pesoEstimado,
    });

    navigate("/admin/origemedestino");
  };

  // Função para obter veículos baseados na categoria e eixo escolhido
  const getVehicles = () => {
    if (categoria === 'Frete Residencial') {
      const vehiclesData = categoryEixoToVehicles[categoria];
      if (vehiclesData && vehiclesData[chosenEixoType]) {
        return vehiclesData[chosenEixoType].veiculos;
      }
    }
    // Para outras categorias ou se não for frete residencial, usa eixoToVehicles
    if (selectedEixo && selectedEixo.eixo) {
      return eixoToVehicles[selectedEixo.eixo]?.veiculos || [];
    }
    return [];
  };

  // Função para obter o range em kg da classe de peso selecionada
  const getWeightRange = () => {
    if (!selectedEixo) return { min: 0, max: 0 };
    const parsedRange = parseRangeToKg(selectedEixo.range);
    return parsedRange ? { min: 0, max: parsedRange.max } : { min: 0, max: 0 };
  };

  const { min, max } = getWeightRange();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg={useColorModeValue("white", "gray.800")}
      p={4}
    >
      <VStack
        spacing={6}
        align="center"
        maxW="800px" // Ajustado para navegadores
        w="100%"
      >
        {/* Título */}
        <Text 
          fontSize={{ base: "24px", md: "32px" }} 
          fontWeight="extrabold" 
          textAlign="center" 
          fontFamily="'Work Sans', sans-serif"
        >
          <Text as="span" color="#2D3748">Detalhes</Text>{" "}
          <Text as="span" color="#ED8936">da sua Carga</Text>
        </Text>

        {/* Seção de Seleção do Tipo de Carga (Subcategoria) */}
        <FormControl maxW="500px" w="100%" isRequired>
          <FormLabel fontSize="lg" fontWeight="semibold">Tipo de Carga*</FormLabel>
          <Select
            placeholder="Selecione o tipo de carga"
            size="lg"
            borderColor="gray.300"
            focusBorderColor="blue.500"
            borderRadius="md"
            value={tipoCarga}
            onChange={(e) => setTipoCarga(e.target.value)}
          >
            {subcategorias.map((subcategoria, index) => (
              <option key={index} value={subcategoria}>{subcategoria}</option>
            ))}
          </Select>
        </FormControl>

        {/* Seção de Seleção da Classe de Peso */}
        <FormControl maxW="500px" w="100%" isRequired>
          <FormLabel fontSize="lg" fontWeight="semibold">Classe de Peso*</FormLabel>
          <Select
            placeholder="Selecione a classe de peso"
            size="lg"
            borderColor="gray.300"
            focusBorderColor="blue.500"
            borderRadius="md"
            value={selectedEixo ? selectedEixo.label : ''}
            onChange={(e) => {
              const wc = filteredWeightClasses.find((wc) => wc.label === e.target.value);
              if (wc) {
                handleEixoInfo(wc);
              }
            }}
          >
            {filteredWeightClasses.map((wc, index) => (
              <option key={index} value={wc.label}>
                {`${wc.label} (${wc.range})`}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Modal com informações sobre a classe de peso selecionada */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          size="lg" 
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Informações sobre {selectedEixo?.label}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Seção de Imagem */}
                <Box textAlign="center">
                  <Image
                    src={CaminhaoModelo}
                    alt={selectedEixo?.label}
                    objectFit="contain"
                    w="100%"
                    h={{ base: "100px", md: "150px" }}
                  />
                </Box>

                <Divider />

                {/* Seção de Detalhes da Classe de Peso */}
                <Box>
                  <Text fontWeight="bold">Eixo Associado:</Text>
                  <Text>{selectedEixo?.eixo}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Peso Médio Suportado:</Text>
                  <Text>{selectedEixo?.range}</Text>
                </Box>

                {/* Seção de Escolha de Tipo de Eixo (Somente para Frete Residencial) */}
                {categoria === 'Frete Residencial' && (
                  <Box>
                    <FormControl as="fieldset" mb={4}>
                      <FormLabel as="legend" fontWeight="bold">Escolha o Tipo de Eixo</FormLabel>
                      <RadioGroup
                        onChange={setChosenEixoType}
                        value={chosenEixoType}
                      >
                        <Stack direction="row">
                          <Radio value="eixo1">Eixo 1</Radio>
                          <Radio value="eixo2">Eixo 2</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  </Box>
                )}

                {/* Seção de Veículos Compatíveis */}
                <Box>
                  <Text fontWeight="bold">
                    Veículos Compatíveis (
                    {categoria === 'Frete Residencial' 
                      ? (chosenEixoType === "eixo1" ? "Eixo 1" : "Eixo 2") 
                      : (selectedEixo ? `Eixo ${selectedEixo.eixo}` : "Eixo N/A")}
                    ):
                  </Text>
                  <List spacing={2} mt={2}>
                    {getVehicles().map((veiculo, idx) => (
                      <ListItem key={idx}>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        {veiculo}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                onClick={handleSelectEixo}
                isDisabled={!selectedEixo}
              >
                Confirmar Seleção
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Campos de Detalhes e Peso Estimado */}
        <VStack spacing={4} w="100%" maxW="500px" align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="lg" fontWeight="semibold">Detalhes da sua carga*</FormLabel>
            <Textarea
              placeholder="Detalhe o máximo de itens que você puder para relacionar à sua carga."
              size="lg"
              borderColor="gray.300"
              focusBorderColor="blue.500"
              borderRadius="md"
              value={detalhesCarga}
              onChange={(e) => setDetalhesCarga(e.target.value)}
            />
          </FormControl>

          {/* Novo Componente: Peso Estimado com Slider e NumberInput */}
          <FormControl>
            <FormLabel fontSize="lg" fontWeight="semibold">Peso estimado da sua carga (Opcional)</FormLabel>
            {selectedEixo && (
              <Box>
                <VStack spacing={4}>
                  {/* Slider para Ajuste do Peso */}
                  <Slider
                    aria-label="slider-peso-estimado"
                    value={pesoEstimado}
                    min={min}
                    max={max}
                    step={100}
                    onChange={(val) => setPesoEstimado(val)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Box color="tomato" />
                    </SliderThumb>
                  </Slider>

                  {/* Exibição dos Valores de Atual e Max */}
                  <HStack justify="space-between" w="100%">
                    <Text>0 kg</Text>
                    <Text fontWeight="bold">{pesoEstimado} kg</Text>
                    <Text>{max} kg</Text>
                  </HStack>

                  {/* NumberInput para Inserção Exata do Peso */}
                  <NumberInput
                    value={pesoEstimado}
                    min={0}
                    max={max}
                    step={100}
                    onChange={(valueString, valueNumber) => {
                      // Garantir que o valor seja válido antes de atualizar
                      if (!isNaN(valueNumber)) {
                        setPesoEstimado(valueNumber);
                      }
                    }}
                    w="100%" // Adicionado para igualar a largura dos Selects
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </VStack>
              </Box>
            )}
            {!selectedEixo && (
              <Text color="gray.500">Selecione uma classe de peso para ajustar o peso estimado.</Text>
            )}
          </FormControl>
        </VStack>

        {/* Botões */}
        <HStack spacing={4} mt={4} w="100%" justify="center">
          <Button 
            variant="outline" 
            colorScheme="gray" 
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleNext}
          >
            Próxima etapa
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
