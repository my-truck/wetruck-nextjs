// src/App.js

import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';
import PrivateRoute from './PrivateRoute';
import { VehicleFormProvider } from './contexts/VehicleFormContext';
import { FormProvider } from './contexts/FormContext';
import { PedidoFormProvider } from './contexts/PedidoFormContext';
import { SocketProvider } from './contexts/SocketContext';

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  return (
    <ChakraProvider theme={currentTheme}>
      <FormProvider>
        <PedidoFormProvider>
          <VehicleFormProvider>
            <SocketProvider>
              <Routes>
                <Route path="auth/*" element={<AuthLayout />} />
                
                {/* Rotas do Admin */}
                <Route
                  path="admin/*"
                  element={
                    <PrivateRoute>
                      <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
                    </PrivateRoute>
                  }
                />

                {/* RTL */}
                <Route
                  path="rtl/*"
                  element={
                    <PrivateRoute>
                      <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
                    </PrivateRoute>
                  }
                />

                <Route path="/" element={<Navigate to="/admin/default" replace />} />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Routes>
            </SocketProvider>
          </VehicleFormProvider>
        </PedidoFormProvider>
      </FormProvider>
    </ChakraProvider>
  );
}
