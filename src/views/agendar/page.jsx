// src/views/agendar/page.jsx
import React, { useState, useContext } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  useToast,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import { FormContext } from '../../contexts/FormContext';

export default function AgendarDataHorario() {
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData } = useContext(FormContext);
  const [selectedDate, setSelectedDate] = useState(formData.scheduleStart ? moment(formData.scheduleStart).tz('America/Sao_Paulo') : null);
  const [selectedTime, setSelectedTime] = useState(formData.scheduleStart ? moment(formData.scheduleStart).tz('America/Sao_Paulo') : null);
  const [step, setStep] = useState(1);

  // Função para validar a seleção de data
  const handleNextStep = () => {
    if (!selectedDate) {
      toast({
        title: "Data não selecionada",
        description: "Por favor, selecione uma data.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Passa para a etapa de seleção de horário
    setStep(2);
  };

  // Função para confirmar data e horário
  const handleConfirm = () => {
    if (!selectedTime) {
      toast({
        title: "Horário não selecionado",
        description: "Por favor, selecione um horário.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Combina data e horário para formar scheduleStart e scheduleEnd
    const scheduleStart = moment(selectedDate)
      .hour(selectedTime.hour())
      .minute(selectedTime.minute())
      .second(0)
      .millisecond(0)
      .tz('America/Sao_Paulo');

    // Adiciona 2 horas ao horário inicial para o scheduleEnd
    const scheduleEnd = moment(scheduleStart)
      .add(2, 'hours')
      .tz('America/Sao_Paulo');

    // Atualiza o FormContext
    updateFormData({
      scheduleStart: scheduleStart.toISOString(),
      scheduleEnd: scheduleEnd.toISOString(),
    });

    // Navega para a próxima etapa
    navigate('/admin/calculovalorfinal');
  };

  // Função para desabilitar datas anteriores ao dia atual
  const isValidDate = (currentDate) => {
    return currentDate.isSameOrAfter(moment().startOf('day'));
  };

  // Definir tamanhos de fonte responsivos
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg="white"
      p={{ base: 4, md: 8 }}
      mt={{ base: 0, md: '-100px' }}
    >
      <VStack
        spacing={6}
        bg="white"
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow="lg"
        maxW={{ base: "100%", md: "600px" }}
        w="100%"
        mt="0"
        mb="0"
      >
        {/* Título */}
        <Text
          fontSize={{ base: "24px", md: "32px", lg: "40px" }}
          fontWeight="extrabold"
          fontFamily="'Work Sans', sans-serif"
          textAlign="center"
          lineHeight="1.2"
        >
          <Text as="span" color="#2D3748" display="block">
            {step === 1 ? "Escolha de Data" : "Escolha de Horário"}
          </Text>
        </Text>

        {/* Etapa 1: Seleção de Data */}
        {step === 1 && (
          <Box width="100%">
            <Text fontSize={fontSize} color="gray.600" mb={2}>
              Selecione a Data
            </Text>
            <Datetime
              value={selectedDate}
              onChange={(date) => setSelectedDate(moment(date).tz('America/Sao_Paulo'))}
              timeFormat={false}
              dateFormat="DD/MM/YYYY"
              input={false}
              closeOnSelect={false}
              isValidDate={isValidDate}
            />
          </Box>
        )}

        {/* Etapa 2: Seleção de Horário */}
        {step === 2 && (
          <Box width="100%">
            <Text fontSize={fontSize} color="gray.600" mb={2}>
              Selecione o Horário
            </Text>
            <Datetime
              value={selectedTime}
              onChange={(time) => setSelectedTime(moment(time).tz('America/Sao_Paulo'))}
              dateFormat={false}
              timeFormat="HH:mm"
              inputProps={{
                placeholder: "Clique para selecionar o horário",
                style: { width: '100%', padding: '10px', fontSize: '16px' },
              }}
              closeOnSelect={true}
            />
          </Box>
        )}

        {/* Botões de Ação */}
        <Flex width="100%" justifyContent="flex-end" gap={4} mt={4}>
          {step === 1 && (
            <Button
              colorScheme="blue"
              onClick={handleNextStep}
              flex="none"
              height="40px"
              fontSize={fontSize}
            >
              Próxima Etapa
            </Button>
          )}

          {step === 2 && (
            <>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={() => setStep(1)}
                flex="none"
                height="40px"
                fontSize={fontSize}
              >
                Voltar
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleConfirm}
                flex="none"
                height="40px"
                fontSize={fontSize}
              >
                Confirmar
              </Button>
            </>
          )}
        </Flex>
      </VStack>
    </Box>
  );
}
