// src/contexts/FormContext.jsx

import React, { createContext, useState, useCallback } from 'react';

export const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    // Inicialize todos os campos necessários
    categoria: "",
    tipoCarga: "",
    detalhesCarga: "",
    pesoEstimado: "",
    selectedEixo: null,
    eixoNumber: null,
    vehicleTypeId: null,
    classTypeId: null,
    allowedAxes: [],
    // ... outros campos
  });

  const updateFormData = useCallback((newData) => {
    setFormData((prev) => {
      // Verificar se há realmente uma mudança
      const updatedData = { ...prev, ...newData };
      
      // Comparar os objetos para ver se há mudanças
      const keys = Object.keys(newData);
      let hasChanged = false;
      for (let key of keys) {
        if (Array.isArray(newData[key])) {
          if (!Array.isArray(prev[key]) || newData[key].length !== prev[key].length || !newData[key].every((item, index) => item === prev[key][index])) {
            hasChanged = true;
            break;
          }
        } else {
          if (newData[key] !== prev[key]) {
            hasChanged = true;
            break;
          }
        }
      }

      if (hasChanged) {
        return updatedData;
      } else {
        return prev;
      }
    });
  }, []);

  const resetFormData = useCallback(() => {
    setFormData({
      categoria: "",
      tipoCarga: "",
      detalhesCarga: "",
      pesoEstimado: "",
      selectedEixo: null,
      eixoNumber: null,
      vehicleTypeId: null,
      classTypeId: null,
      allowedAxes: [],
      // ... outros campos resetados
    });
  }, []);

  return (
    <FormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </FormContext.Provider>
  );
};
