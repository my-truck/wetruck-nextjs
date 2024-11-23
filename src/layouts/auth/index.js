import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import routes from '../../routes';

// Chakra imports
import { Box, useColorModeValue } from '@chakra-ui/react';

// Layout components
import { SidebarContext } from '../../contexts/SidebarContext';


export default function Auth() {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  // Function to determine if the current route should display the sidebar
  const shouldShowSidebar = () => {
    return window.location.pathname !== '/auth/full-screen-maps';
  };

  // Function to dynamically generate routes based on configuration
  const generateRoutes = (routes) => {
    return routes.map((route, key) => {
      if (route.layout === '/auth') {
        return (
          <Route path={route.path} element={route.component} key={key} />
        );
      }
      if (route.collapse) {
        return generateRoutes(route.items);
      }
      return null;
    });
  };

  const authBg = useColorModeValue('white', 'navy.900');
  document.documentElement.dir = 'ltr';

  return (
    <Box>
      <SidebarContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
        <Box
          bg={authBg}
          minHeight="100vh"
          height="100%"
          w="100%"
          position="relative"
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
        >
          {shouldShowSidebar() ? (
            <Box mx="auto" minH="100vh">
              <Routes>
                {generateRoutes(routes)}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />
              </Routes>
            </Box>
          ) : null}
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}
