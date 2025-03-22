// src/contexts/VehicleFormContext.jsx
import React, { createContext, useState } from 'react';

const VehicleFormContext = createContext();

export const VehicleFormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    vehicleClass: '',
    vehicleType: '',
    description: '',
    loadTypeIds: [],  // array
    licensePlate: '',
    postalCode: '',
  });

  return (
    <VehicleFormContext.Provider value={{ formData, setFormData }}>
      {children}
    </VehicleFormContext.Provider>
  );
};

export default VehicleFormContext;
