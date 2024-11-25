// src/App.js

import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';
import PrivateRoute from './PrivateRoute'; // Importa o PrivateRoute
import { VehicleFormProvider } from './contexts/VehicleFormContext'; // Importa o VehicleFormProvider
import { FormProvider } from './contexts/FormContext'; // Importa o FormProvider
import { PedidoFormProvider } from './contexts/PedidoFormContext'; // Importa o PedidoFormProvider
import { SocketProvider } from './contexts/SocketContext'; // Importa o SocketProvider

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  
  return (
    <ChakraProvider theme={currentTheme}>
      <FormProvider>
        <PedidoFormProvider>
          <VehicleFormProvider>
            <SocketProvider> {/* Adicionado SocketProvider */}
              <Routes>
                <Route path="auth/*" element={<AuthLayout />} />
                <Route
                  path="admin/*"
                  element={
                    <PrivateRoute>
                      <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="rtl/*"
                  element={
                    <PrivateRoute>
                      <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/admin/default" replace />} />
                {/* Rota para lidar com páginas não encontradas */}
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Routes>
            </SocketProvider>
          </VehicleFormProvider>
        </PedidoFormProvider>
      </FormProvider>
    </ChakraProvider>
  );
}
