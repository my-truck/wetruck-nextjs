// src/components/navbar/LogoutButton.js
import React from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Obtenha o token do localStorage
      if (!token) {
        toast({
          title: 'Erro ao fazer logout.',
          description: 'Token de autenticação não encontrado.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch('https://etc.wetruckhub.com/auth/logout', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Inclua o token no cabeçalho
        },
      });

      if (response.ok) {
        localStorage.removeItem('authToken'); // Remova o token do localStorage após logout

        toast({
          title: 'Logout bem-sucedido.',
          description: 'Você foi desconectado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        navigate('/auth/login'); // Redireciona para a página de login
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro ao fazer logout.',
          description: `Houve um problema ao tentar sair. Status: ${response.status}. Mensagem: ${errorData.message}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao fazer logout.',
        description: 'Houve um problema ao tentar sair. Verifique sua conexão.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Button onClick={handleLogout} colorScheme="red">
      Sair
    </Button>
  );
};

export default LogoutButton;
