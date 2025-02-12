import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
  Heading,
  Select,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../axiosInstance';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function Step2KycForm({ onNext }) {
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentPreview, setDocumentPreview] = useState(null);
  // Armazena os dados dos passos anteriores
  const [formContext, setFormContext] = useState({});
  const toast = useToast();

  // Função para enviar os dados KYC (exceto o arquivo)
  const updateKYC = async (kycData) => {
    try {
      await axiosInstance.post('/stripe/custom-connect/update-full-kyc', kycData);
      toast({
        title: 'Dados enviados com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar KYC',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  // Trata a pré-visualização do arquivo sem enviá-lo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreview(previewUrl);
    }
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // Função para garantir que o telefone tenha o prefixo +55
  const transformPhone = (phone) => {
    const trimmedPhone = phone.trim();
    // Se o usuário não incluir o +55, adiciona-o
    return trimmedPhone.startsWith('+55') ? trimmedPhone : '+55' + trimmedPhone;
  };

  // Para os passos 1 a 4, salva os dados e avança para o próximo passo
  const handleNext = handleSubmit((data) => {
    if (currentStep === 2 && data.phone) {
      data.phone = transformPhone(data.phone);
    }
    setFormContext((prev) => ({ ...prev, ...data }));
    reset(); // Limpa os campos para o próximo passo
    nextStep();
  });

  // No passo 5: envia primeiro os dados KYC e, se houver arquivo, faz o upload do documento
  const handleFinalSubmit = handleSubmit(async (data) => {
    // Combina os dados salvos com os dados do passo atual
    const combinedData = { ...formContext, ...data };
    if (combinedData.phone) {
      combinedData.phone = transformPhone(combinedData.phone);
    }
    try {
      setIsLoading(true);
      // Separa o arquivo dos demais dados
      const { document, ...kycData } = combinedData;

      // Envia os dados KYC
      await updateKYC(kycData);

      // Se um arquivo foi selecionado, faz o upload do documento
      if (document && document.length > 0) {
        try {
          const file = document[0];
          const formData = new FormData();
          // Altere o nome do campo para "file" (ou conforme a API espera)
          formData.append('file', file);
          await axiosInstance.post('/stripe/custom-connect/upload-document', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast({
            title: 'Documento enviado com sucesso!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } catch (uploadError) {
          console.error('Erro ao enviar documento:', uploadError);
          toast({
            title: 'Erro ao enviar documento',
            description: uploadError.response?.data?.message || uploadError.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          // Opcional: se o upload do documento falhar, pode interromper o fluxo
          throw uploadError;
        }
      }

      reset();
      onNext(); // Avança para a próxima etapa do fluxo, se houver
    } catch (error) {
      console.error('Erro no submit final:', error);
      toast({
        title: 'Erro ao finalizar o formulário',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  });

  // Renderiza os campos de cada etapa
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <FormControl id="firstName" isRequired>
              <FormLabel>Nome</FormLabel>
              <Input autoComplete="off" {...register('firstName')} placeholder="Seu nome" />
            </FormControl>
            <FormControl id="lastName" isRequired>
              <FormLabel>Sobrenome</FormLabel>
              <Input autoComplete="off" {...register('lastName')} placeholder="Seu sobrenome" />
            </FormControl>
            <FormControl id="dob" isRequired>
              <FormLabel>Data de Nascimento</FormLabel>
              <Input type="date" autoComplete="off" {...register('dob')} />
            </FormControl>
            <FormControl id="idNumber" isRequired>
              <FormLabel>CPF</FormLabel>
              <Input autoComplete="off" {...register('idNumber')} placeholder="Seu CPF" />
            </FormControl>
          </>
        );
      case 2:
        return (
          <>
            <FormControl id="phone" isRequired>
              <FormLabel>Telefone</FormLabel>
              <InputGroup>
                <InputLeftAddon children="+55" />
                {/* O usuário digita apenas DDD e número */}
                <Input autoComplete="off" {...register('phone')} placeholder="DDD + Número" />
              </InputGroup>
            </FormControl>
            <FormControl id="individualEmail" isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" autoComplete="off" {...register('individualEmail')} placeholder="motorista@teste.com" />
            </FormControl>
            <FormControl id="politicalExposure" isRequired>
              <FormLabel>Exposição Política</FormLabel>
              <Select autoComplete="off" {...register('politicalExposure')} defaultValue="none">
                <option value="none">Nenhuma</option>
                <option value="politically_exposed">Exposto Politicamente</option>
              </Select>
            </FormControl>
          </>
        );
      case 3:
        return (
          <>
            <FormControl id="postalCode" isRequired>
              <FormLabel>CEP</FormLabel>
              <Input autoComplete="off" {...register('postalCode')} placeholder="29101850" />
            </FormControl>
            <FormControl id="addressLine1" isRequired>
              <FormLabel>Endereço</FormLabel>
              <Input autoComplete="off" {...register('addressLine1')} placeholder="Rua Itaquari, 210" />
            </FormControl>
            <FormControl id="city" isRequired>
              <FormLabel>Cidade</FormLabel>
              <Input autoComplete="off" {...register('city')} placeholder="Vila Velha" />
            </FormControl>
            <FormControl id="state" isRequired>
              <FormLabel>Estado</FormLabel>
              <Input autoComplete="off" {...register('state')} placeholder="ES" />
            </FormControl>
          </>
        );
      case 4:
        return (
          <>
            <FormControl id="mcc" isRequired>
              <FormLabel>MCC</FormLabel>
              <Input autoComplete="off" {...register('mcc')} placeholder="4789" />
            </FormControl>
            <FormControl id="productDescription" isRequired>
              <FormLabel>Descrição do Produto</FormLabel>
              <Input autoComplete="off" {...register('productDescription')} placeholder="Transporte e fretes" />
            </FormControl>
            <FormControl id="routingNumber" isRequired>
              <FormLabel>Agência</FormLabel>
              <Input autoComplete="off" {...register('routingNumber')} placeholder="341-0001" />
            </FormControl>
            <FormControl id="accountNumber" isRequired>
              <FormLabel>Número da Conta</FormLabel>
              <Input autoComplete="off" {...register('accountNumber')} placeholder="12345-6" />
            </FormControl>
            <FormControl id="accountHolderName" isRequired>
              <FormLabel>Nome do Titular</FormLabel>
              <Input autoComplete="off" {...register('accountHolderName')} placeholder="Nome do titular da conta" />
            </FormControl>
          </>
        );
      case 5:
        return (
          <>
            <FormControl id="document">
              <FormLabel>Documento (CNH ou RG)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                autoComplete="off"
                {...register('document')}
                onChange={handleFileChange}
              />
            </FormControl>
            {documentPreview && (
              <Box mt={4} p={2} border="1px solid" borderColor="gray.200">
                <Heading size="sm">Pré-visualização:</Heading>
                <img
                  src={documentPreview}
                  alt="Pré-visualização do documento"
                  style={{ maxWidth: '100%' }}
                />
              </Box>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const renderStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Informações Pessoais';
      case 2:
        return 'Contato e Exposição';
      case 3:
        return 'Endereço';
      case 4:
        return 'Dados Bancários';
      case 5:
        return 'Upload do Documento';
      default:
        return '';
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      p={5}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
      maxW="600px"
      mx="auto"
      mt={10}
    >
      <Heading mb={4} size="lg" textAlign="center">
        {renderStepTitle()}
      </Heading>
      {/* Formulário com autocomplete desativado e input fantasma */}
      <VStack
        as="form"
        spacing={4}
        align="stretch"
        autoComplete="off"
        onSubmit={currentStep < 5 ? handleNext : handleFinalSubmit}
      >
        <input
          type="text"
          name="fakeusernameremembered"
          style={{ display: 'none' }}
          autoComplete="off"
        />
        {renderStepContent()}
        <HStack justify="space-between">
          {currentStep > 1 && (
            <Button onClick={prevStep} variant="outline">
              Anterior
            </Button>
          )}
          {currentStep < 5 ? (
            <Button type="submit" colorScheme="blue">
              Próximo
            </Button>
          ) : (
            <Button type="submit" colorScheme="green" isLoading={isLoading}>
              Atualizar Dados
            </Button>
          )}
        </HStack>
      </VStack>
    </MotionBox>
  );
}
