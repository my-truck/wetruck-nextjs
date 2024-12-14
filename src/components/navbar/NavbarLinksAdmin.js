// src/components/navbar/NavbarLinksAdmin.js

import React from 'react';
import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  Text,
  Badge,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import PropTypes from 'prop-types';
import { ItemContent } from '../../components/menu/ItemContent';
import LogoutButton from './LogoutButton';

export default function NavbarLinksAdmin({ notifications = [], socketConnected }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  const unreadCount = notifications.length;

  const handleNotificationsClick = () => {
    console.log(`WebSocket está ${socketConnected ? 'conectado' : 'desconectado'}.`);
  };

  return (
    <Flex alignItems="center" gap="20px">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Notificações"
          icon={<MdNotificationsNone />}
          variant="ghost"
          size="lg"
          position="relative"
          onClick={handleNotificationsClick}
        >
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="0"
              right="0"
              rounded="full"
              bg="red.500"
              color="white"
              fontSize="0.7em"
            >
              {unreadCount}
            </Badge>
          )}
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="10px"
          borderRadius="20px"
          mt="22px"
          width={{ base: '90vw', md: '400px' }}
          maxH="400px"
          overflowY="auto"
          bg={useColorModeValue('white', 'gray.800')}
        >
          <Flex w="100%" mb="20px">
            <Text fontSize="md" fontWeight="600" color={textColor}>
              Notificações
            </Text>
          </Flex>
          <Flex flexDirection="column">
            {unreadCount === 0 ? (
              <Text fontSize="sm" color="gray.500">
                Nenhuma nova ordem.
              </Text>
            ) : (
              notifications.slice(0, 4).map((notification, index) => (
                <MenuItem
                  key={index}
                  _hover={{ bg: 'none' }}
                  px="0"
                  borderRadius="8px"
                  mb="10px"
                >
                  <ItemContent info={`Nova ordem de ${notification.userName || 'um cliente'}`} />
                </MenuItem>
              ))
            )}
            {unreadCount > 4 && (
              <>
                <Divider />
                <MenuItem as="a" href="/notifications" justifyContent="center">
                  Ver mais
                </MenuItem>
              </>
            )}
          </Flex>
        </MenuList>
      </Menu>

      <Menu>
        <MenuButton
          as={IconButton}
          p="0px"
          aria-label="Informações"
          icon={<MdInfoOutline />}
          variant="ghost"
          size="lg"
        />
        <MenuList
          boxShadow={shadow}
          p="20px"
          borderRadius="20px"
          mt="22px"
          bg={useColorModeValue('white', 'gray.800')}
        >
          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ bg: 'none' }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Configurações do Perfil</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: 'none' }}
              color="red.400"
              borderRadius="8px"
              px="14px"
            >
              <LogoutButton />
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}

NavbarLinksAdmin.propTypes = {
  notifications: PropTypes.array,
  socketConnected: PropTypes.bool,
};
