// src/contexts/PedidoFormContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Certifique-se de que está instalado

// Cria o contexto
export const PedidoFormContext = createContext();

// Cria o provider do contexto
export const PedidoFormProvider = ({ children }) => {
  // Define os valores iniciais do formulário conforme o payload
  const initialFormData = {
    name: '',
    description: '',
    value: 0.0, // Representa o 'value' da carga
    distance: 0.0,
    userId: null, // Defina dinamicamente conforme a autenticação
    origin: {
      address: '',
      city: '',
      state: '',
      postalCode: ''
    },
    destination: {
      address: '',
      city: '',
      state: '',
      postalCode: ''
    },
    scheduleStart: '',
    scheduleEnd: '',
    classTypeId: null,
    vehicleTypeId: null
  };

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decodifica o token
        // Supondo que o userId esteja no campo `id` do token
        setFormData(prevData => ({
          ...prevData,
          userId: decoded.id
        }));
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
      }
    }
  }, []);

  // Função para atualizar os dados do formulário
  const updateFormData = (newData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  // Função para atualizar campos aninhados como origin, destination e value
  const updateNestedFormData = (field, newData) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: typeof newData === 'object' ? { ...prevData[field], ...newData } : newData,
    }));
  };

  // Função para resetar os dados do formulário
  const resetFormData = () => {
    setFormData(initialFormData);
  };

  return (
    <PedidoFormContext.Provider value={{ formData, updateFormData, updateNestedFormData, resetFormData }}>
      {children}
    </PedidoFormContext.Provider>
  );
};
