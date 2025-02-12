import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Heading,
  Select,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../axiosInstance';


export default function ConnectBankAccount() {
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Função para criar a conta Custom no Stripe
  const createStripeAccount = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/stripe/custom-connect/create');
      toast({
        title: 'Conta criada com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      return response.data;
    } catch (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar os dados KYC (passo 2)
  const updateKYC = async (kycData) => {
    try {
      setIsLoading(true);
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
      // Lança o erro para impedir a continuação do fluxo
      throw error;
    }
  };

  // Função para enviar o documento (passo 3)
  const uploadDocument = async (file) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      // Considerando que a API espera a chave "file" com o arquivo CNH ou RG
      formData.append('file', file);
      await axiosInstance.post('/stripe/custom-connect/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({
        title: 'Documento enviado com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro ao enviar documento',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handler do submit do formulário: atualiza KYC e, se houver, faz upload do documento
  const onSubmit = async (data) => {
    try {
      // Constrói o objeto KYC conforme o endpoint espera:
      const kycData = {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,             // Ex: "BR"
        dob: data.dob,                     // Ex: "2002-06-12"
        idNumber: data.idNumber,           // CPF
        phone: data.phone,
        individualEmail: data.individualEmail,
        politicalExposure: data.politicalExposure,
        postalCode: data.postalCode,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        mcc: data.mcc,
        productDescription: data.productDescription,
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
      };

      // Atualiza os dados KYC
      await updateKYC(kycData);

      // Se houver um documento selecionado, faz o upload dele
      if (data.document && data.document.length > 0) {
        await uploadDocument(data.document[0]);
      }

      reset();
    } catch (error) {
      console.error('Erro no submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} p={5} boxShadow="lg" borderRadius="lg" bg="white">
      <Heading mb={4} size="lg" textAlign="center">
        Conectar Conta Bancária
      </Heading>

      {/* Botão para criar a conta no Stripe */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Button colorScheme="blue" onClick={createStripeAccount} isLoading={isLoading}>
          Criar Conta no Stripe
        </Button>
      </VStack>

      {/* Formulário para enviar os dados KYC e fazer upload do documento */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl id="firstName" isRequired>
            <FormLabel>Nome</FormLabel>
            <Input {...register('firstName')} placeholder="Seu nome" />
          </FormControl>

          <FormControl id="lastName" isRequired>
            <FormLabel>Sobrenome</FormLabel>
            <Input {...register('lastName')} placeholder="Seu sobrenome" />
          </FormControl>

          <FormControl id="country" isRequired>
            <FormLabel>País</FormLabel>
            <Input {...register('country')} placeholder="BR" defaultValue="BR" />
          </FormControl>

          <FormControl id="dob" isRequired>
            <FormLabel>Data de Nascimento</FormLabel>
            <Input type="date" {...register('dob')} />
          </FormControl>

          <FormControl id="idNumber" isRequired>
            <FormLabel>CPF</FormLabel>
            <Input {...register('idNumber')} placeholder="Seu CPF" />
          </FormControl>

          <FormControl id="phone" isRequired>
            <FormLabel>Telefone</FormLabel>
            <Input {...register('phone')} placeholder="+55 27 99999-9999" />
          </FormControl>

          <FormControl id="individualEmail" isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register('individualEmail')} placeholder="motorista@teste.com" />
          </FormControl>

          <FormControl id="politicalExposure" isRequired>
            <FormLabel>Exposição Política</FormLabel>
            <Select {...register('politicalExposure')} defaultValue="none">
              <option value="none">Nenhuma</option>
              <option value="politically_exposed">Exposto Politicamente</option>
            </Select>
          </FormControl>

          <FormControl id="postalCode" isRequired>
            <FormLabel>CEP</FormLabel>
            <Input {...register('postalCode')} placeholder="29101850" />
          </FormControl>

          <FormControl id="addressLine1" isRequired>
            <FormLabel>Endereço</FormLabel>
            <Input {...register('addressLine1')} placeholder="Rua Itaquari, 210" />
          </FormControl>

          <FormControl id="city" isRequired>
            <FormLabel>Cidade</FormLabel>
            <Input {...register('city')} placeholder="Vila Velha" />
          </FormControl>

          <FormControl id="state" isRequired>
            <FormLabel>Estado</FormLabel>
            <Input {...register('state')} placeholder="ES" />
          </FormControl>

          <FormControl id="mcc" isRequired>
            <FormLabel>MCC</FormLabel>
            <Input {...register('mcc')} placeholder="4789" />
          </FormControl>

          <FormControl id="productDescription" isRequired>
            <FormLabel>Descrição do Produto</FormLabel>
            <Input {...register('productDescription')} placeholder="Transporte e fretes" />
          </FormControl>

          <FormControl id="routingNumber" isRequired>
            <FormLabel>Agência</FormLabel>
            <Input {...register('routingNumber')} placeholder="341-0001" />
          </FormControl>

          <FormControl id="accountNumber" isRequired>
            <FormLabel>Número da Conta</FormLabel>
            <Input {...register('accountNumber')} placeholder="12345-6" />
          </FormControl>

          <FormControl id="accountHolderName" isRequired>
            <FormLabel>Nome do Titular</FormLabel>
            <Input {...register('accountHolderName')} placeholder="Nome do titular da conta" />
          </FormControl>

          <FormControl id="document">
            <FormLabel>Documento (CNH ou RG)</FormLabel>
            <Input type="file" accept="image/*" {...register('document')} />
          </FormControl>

          <Button type="submit" colorScheme="green" isLoading={isLoading}>
            Atualizar Dados
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
