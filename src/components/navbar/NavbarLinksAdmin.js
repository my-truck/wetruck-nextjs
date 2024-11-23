// src/components/navbar/NavbarLinksAdmin.js

import React from 'react';
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import PropTypes from 'prop-types';
import { ItemContent } from '../../components/menu/ItemContent';
import LogoutButton from './LogoutButton';

export default function NavbarLinksAdmin(props) {
  const navbarIcon = useColorModeValue('gray.400', 'white');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  return (
    <Flex alignItems="center" gap="20px">
      {/* Ícone de Notificações */}
      <Menu>
        <MenuButton p="0px">
          <Icon as={MdNotificationsNone} color={navbarIcon} w="20px" h="20px" />
        </MenuButton>
        <MenuList boxShadow={shadow} p="20px" borderRadius="20px" mt="22px">
          <Flex w="100%" mb="20px">
            <Text fontSize="md" fontWeight="600" color={textColor}>
              Notificações
            </Text>
          </Flex>
          <Flex flexDirection="column">
            <MenuItem _hover={{ bg: 'none' }} px="0" borderRadius="8px" mb="10px">
              <ItemContent info="Horizon UI Dashboard PRO" />
            </MenuItem>
            <MenuItem _hover={{ bg: 'none' }} px="0" borderRadius="8px" mb="10px">
              <ItemContent info="We Truck" />
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>

      {/* Ícone de Informações */}
      <Menu>
        <MenuButton p="0px">
          <Icon as={MdInfoOutline} color={navbarIcon} w="20px" h="20px" />
        </MenuButton>
        <MenuList boxShadow={shadow} p="20px" borderRadius="20px" mt="22px">
          <Flex flexDirection="column" p="10px">
            <MenuItem _hover={{ bg: 'none' }} borderRadius="8px" px="14px">
              <Text fontSize="sm">Configurações do Perfil</Text>
            </MenuItem>
            <MenuItem _hover={{ bg: 'none' }} color="red.400" borderRadius="8px" px="14px">
              <LogoutButton /> {/* Botão de Logout */}
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}

NavbarLinksAdmin.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
