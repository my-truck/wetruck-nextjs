// src/views/react-datetime/page.jsx

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  FormControl,
  useBreakpointValue,
  Flex,
  Spacer,
  TableContainer,
} from '@chakra-ui/react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

// Importar CSS personalizado
import './DefinicaoDisponibilidade.css'; // Certifique-se de que o caminho está correto

export default function DefinicaoDisponibilidade() {
  const [availabilitySlots, setAvailabilitySlots] = useState([
    { id: 1, day: 'Segunda-feira', isAvailable: false, startTime: null, endTime: null },
    { id: 2, day: 'Terça-feira', isAvailable: false, startTime: null, endTime: null },
    { id: 3, day: 'Quarta-feira', isAvailable: false, startTime: null, endTime: null },
    { id: 4, day: 'Quinta-feira', isAvailable: false, startTime: null, endTime: null },
    { id: 5, day: 'Sexta-feira', isAvailable: false, startTime: null, endTime: null },
    { id: 6, day: 'Sábado', isAvailable: false, startTime: null, endTime: null },
    { id: 7, day: 'Domingo', isAvailable: false, startTime: null, endTime: null },
  ]);
  const toast = useToast();
  const navigate = useNavigate();

  // Função para atualizar um slot de disponibilidade
  const updateAvailabilitySlot = (id, field, value) => {
    const updatedSlots = availabilitySlots.map(slot => {
      if (slot.id === id) {
        return { ...slot, [field]: value };
      }
      return slot;
    });
    setAvailabilitySlots(updatedSlots);
  };

  // Função para salvar a disponibilidade
  const handleSave = () => {
    // Verificar se todos os slots disponíveis estão preenchidos corretamente
    for (let slot of availabilitySlots) {
      if (slot.isAvailable) {
        if (!slot.startTime || !slot.endTime) {
          toast({
            title: "Preenchimento Incompleto",
            description: `Por favor, preencha os horários de ${slot.day}.`,
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        // Verificar se o horário de início é antes do horário de término
        if (moment(slot.startTime).isAfter(moment(slot.endTime))) {
          toast({
            title: "Horário Inválido",
            description: `O horário de início deve ser antes do horário de término em ${slot.day}.`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }
    }

    // Se tudo estiver correto, redirecionar para a página de confirmação
    navigate('/admin/confirmacao');
  };

  // Definir tamanhos de fonte responsivos
  const tableFontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const buttonFontSize = useBreakpointValue({ base: 'sm', md: 'md' });

  return (
    <Box
      width="100%"
      bg="gray.50"
      p={{ base: 4, md: 8 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack
        spacing={6}
        bg="white"
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow="lg"
        maxW={{ base: "100%", md: "800px" }}
        w="100%"
      >
        {/* Título com Cores */}
        <Text
          fontSize={{ base: "24px", md: "32px", lg: "40px" }}
          fontWeight="extrabold"
          fontFamily="'Work Sans', sans-serif"
          textAlign="center"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="block">
            Definição de
          </Text>
          <Text as="span" color="#ED8936" display="block">
            Disponibilidade
          </Text>
        </Text>

        {/* Texto Descritivo */}
        <Box width="100%">
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" mb={4}>
            Por favor, selecione os dias e horários em que você estará disponível para receber pedidos.
          </Text>

          {/* Tabela de Disponibilidade com TableContainer */}
          <TableContainer>
            <Table variant="simple" size="sm" layout="fixed">
              <Thead>
                <Tr>
                  <Th width="25%" fontSize={tableFontSize}>Dia</Th>
                  <Th width="15%" fontSize={tableFontSize}>Disponível</Th>
                  <Th width="30%" fontSize={tableFontSize}>Horário de Início</Th>
                  <Th width="30%" fontSize={tableFontSize}>Horário de Término</Th>
                </Tr>
              </Thead>
              <Tbody>
                {availabilitySlots.map((slot) => (
                  <Tr key={slot.id}>
                    <Td fontSize={tableFontSize}>{slot.day}</Td>
                    <Td>
                      <Switch
                        colorScheme="blue"
                        isChecked={slot.isAvailable}
                        onChange={(e) => updateAvailabilitySlot(slot.id, 'isAvailable', e.target.checked)}
                      />
                    </Td>
                    <Td>
                      {slot.isAvailable ? (
                        <FormControl>
                          <Datetime
                            value={slot.startTime}
                            onChange={(time) => updateAvailabilitySlot(slot.id, 'startTime', time)}
                            dateFormat={false}
                            timeFormat="HH:mm"
                            inputProps={{ 
                              placeholder: "Início", 
                              className: "custom-datetime-input",
                              style: { width: '100%' } // Garantir largura total
                            }}
                            closeOnSelect={true}
                            className="custom-datetime"
                          />
                        </FormControl>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td>
                      {slot.isAvailable ? (
                        <FormControl>
                          <Datetime
                            value={slot.endTime}
                            onChange={(time) => updateAvailabilitySlot(slot.id, 'endTime', time)}
                            dateFormat={false}
                            timeFormat="HH:mm"
                            inputProps={{ 
                              placeholder: "Término", 
                              className: "custom-datetime-input",
                              style: { width: '100%' } // Garantir largura total
                            }}
                            closeOnSelect={true}
                            className="custom-datetime"
                          />
                        </FormControl>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Botões de Ação */}
        <Flex
          width="100%"
          justifyContent="flex-end"
          gap={4}
        >
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => navigate(-1)}
            flex="none"
            height="40px"
            fontSize={buttonFontSize}
          >
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            flex="none"
            height="40px"
            fontSize={buttonFontSize}
          >
            Próxima Etapa
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
