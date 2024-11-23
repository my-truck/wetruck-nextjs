import { Box, Flex, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import AdminNavbarLinks from './NavbarLinksAdmin';
import UserProfileMenu from './UserProfileMenu';

// Importa a logo
import LogoWeTruck from '../../assets/images/logotruckpreto.png';

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', changeNavbar);
    return () => {
      window.removeEventListener('scroll', changeNavbar);
    };
  }, []);

  const { secondary, message } = props;

  const navbarPosition = 'fixed';
  const navbarHeight = '80px';

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  // Efeito de blur na navbar
  const navbarBg = scrolled
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(255, 255, 255, 0.6)';
  const backdropFilter = scrolled ? 'blur(10px)' : 'none';

  return (
    <Box
      position={navbarPosition}
      top="0"
      left="0"
      width="100%"
      height={navbarHeight}
      bg={navbarBg}
      zIndex="1000"
      boxShadow="sm"
      backdropFilter={backdropFilter}
      transition="all 0.3s ease"
    >
      <Flex
        w="100%"
        h="100%"
        alignItems="center"
        justifyContent="space-between"
        px={{ base: '10px', md: '30px' }}
        flexDirection="row"
        position="relative"
      >
        {/* Logo da marca */}
        <Image
          src={LogoWeTruck}
          alt="WeTruck Logo"
          height={{ base: '40px', md: '60px' }}
          mr="20px" // Define um gap maior à direita da logo
        />

        {/* Foto de perfil para dispositivos móveis, ajustada */}
        <Flex
          position="absolute"
          left="50%"
          transform="translateX(-40%)" // Ajusta a posição para mais à direita
          display={{ base: 'flex', md: 'none' }}
          alignItems="center"
          mt={{ base: '5px', md: '0' }}
          ml="15px" // Adiciona um espaçamento à esquerda
        >
          <UserProfileMenu userName="Matheus" />
        </Flex>

        {/* Layout responsivo da foto de perfil para desktop */}
        <Flex alignItems="center" display={{ base: 'none', md: 'flex' }} ml="20px">
          <UserProfileMenu userName="Matheus" />
        </Flex>

        {/* Links da Navbar, posicionados à direita */}
        <Flex
          ml="auto"
          alignItems="center"
          gap={{ base: '10px', md: '20px' }}
          flexDirection="row"
        >
          <AdminNavbarLinks
            onOpen={props.onOpen}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
          />
        </Flex>
      </Flex>

      {secondary ? <Box color="white" mt="4">{message}</Box> : null}
    </Box>
  );
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
};
