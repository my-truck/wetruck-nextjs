// Chakra imports
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
// Layout components
import Navbar from '../../components/navbar/NavbarAdmin.js';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import routes from '../../routes';

export default function Dashboard(props) {
  const { ...rest } = props;
  const fixed = true;
  const { onOpen } = useDisclosure();

  /**
   * Retorna a rota ativa atual com base no pathname
   */
  const getActiveRoute = () => {
    const activeRoute = routes.find(
      (route) =>
        window.location.pathname === route.layout + route.path
    );
    return activeRoute ? activeRoute.name : 'Dashboard';
  };

  /**
   * Verifica se a navbar secundária deve ser exibida
   */
  const getActiveNavbar = () => {
    const activeRoute = routes.find(
      (route) =>
        window.location.pathname === route.layout + route.path
    );
    return activeRoute ? activeRoute.secondary : false;
  };

  /**
   * Texto da navbar secundária
   */
  const getActiveNavbarText = () => {
    const activeRoute = routes.find(
      (route) =>
        window.location.pathname === route.layout + route.path
    );
    return activeRoute ? activeRoute.messageNavbar : '';
  };

  /**
   * Renderiza as rotas dinamicamente
   */
  const getRoutes = (routes) => {
    return routes.map((route, key) => {
      if (route.layout === '/admin') {
        return (
          <Route
            path={route.path}
            element={route.component}
            key={key}
          />
        );
      }
      return null;
    });
  };

  return (
    <Box>
      {/* Navbar fixa */}
      <Portal>
        <Box position="fixed" top="0" w="100%" zIndex="1000">
          <Navbar
            onOpen={onOpen}
            logoText="We Truck"
            brandText={getActiveRoute()}
            secondary={getActiveNavbar()}
            message={getActiveNavbarText()}
            fixed={fixed}
            {...rest}
          />
        </Box>
      </Portal>

      {/* Conteúdo Principal */}
      <Box
        pt="80px" // Espaço para o navbar fixo
        px={{ base: '20px', md: '30px' }}
        overflow="hidden"
      >
        <Box mx="auto">
          <Routes>
            {getRoutes(routes)}
            {/* Rota Padrão */}
            <Route path="/" element={<Navigate to="/admin/default" replace />} />
            <Route path="*" element={<Navigate to="/admin/default" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}
