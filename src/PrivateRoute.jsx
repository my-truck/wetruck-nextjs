// src/PrivateRoute.jsx

import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from './axiosInstance'; // Certifique-se de que está apontando para src/axiosInstance.js
import { Flex, Spinner, Text } from '@chakra-ui/react'; // Importando componentes do Chakra UI
import { FormContext } from './contexts/FormContext'; // Importa o FormContext

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { updateFormData } = useContext(FormContext); // Para atualizar o FormContext se necessário

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('Nenhum token encontrado no localStorage.');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Faz a requisição POST para /auth/protected com o token no header
        const response = await axios.post(
          '/auth/protected',
          {}, // Corpo da requisição vazio, se necessário
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status >= 200 && response.status < 300) { // Aceita qualquer status 2xx
          setIsAuthenticated(true);
          // Atualiza o FormContext com userId, garantindo que é um número
          if (response.data && response.data.user) {
            const userId = Number(response.data.user.id);
            if (isNaN(userId)) {
              console.error('userId recebido não é um número:', response.data.user.id);
            } else {
              updateFormData({ userId });
              console.log('userId atualizado no FormContext:', userId, 'Tipo:', typeof userId);
            }
          }
        } else {
          console.error(`Erro inesperado: status ${response.status}`);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Flex
        height="100vh"
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text mt={4} fontSize="lg" color="gray.600">
          Carregando...
        </Text>
      </Flex>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

export default PrivateRoute;
