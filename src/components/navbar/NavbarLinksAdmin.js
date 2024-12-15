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
import { useNavigate } from 'react-router-dom'; // Hook para navegação
import { ItemContent } from '../../components/menu/ItemContent';
import LogoutButton from './LogoutButton';

export default function NavbarLinksAdmin({ notifications = [], socketConnected, setNotifications, fetchNotifications }) {
  const navigate = useNavigate(); // Hook para navegação
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const shadow = useColorModeValue(
    '0px 4px 12px rgba(0, 0, 0, 0.1)',
    '0px 4px 12px rgba(0, 0, 0, 0.2)'
  );

  const unreadCount = notifications.length;

  const handleNotificationsClick = () => {
    console.log(`WebSocket está ${socketConnected ? 'conectado' : 'desconectado'}.`);
  };

  const handleAccept = (acceptedId) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== acceptedId));
  };

  return (
    <Flex alignItems="center" gap="24px">
      {/* Notificações */}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Notificações"
          icon={<MdNotificationsNone />}
          variant="ghost"
          size="lg"
          position="relative"
          onClick={handleNotificationsClick}
          _hover={{ bg: 'gray.100' }}
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
          p="12px"
          borderRadius="lg"
          mt="14px"
          width={{ base: '90vw', md: '450px' }}
          maxH="500px"
          overflowY="auto"
          bg={useColorModeValue('white', 'gray.800')}
          mx={{ base: 'auto', md: '0' }}
        >
          <Flex w="100%" mb="16px">
            <Text fontSize="md" fontWeight="600" color={textColor}>
              Notificações
            </Text>
          </Flex>
          <Flex flexDirection="column">
            {unreadCount === 0 ? (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Nenhuma nova ordem.
              </Text>
            ) : (
              notifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  _hover={{ bg: 'none' }}
                  px="0"
                  borderRadius="md"
                  mb="12px"
                  display="block"
                >
                  <ItemContent
                    type={notification.type}
                    info={notification}
                    onAccept={handleAccept}
                    fetchNotifications={fetchNotifications}
                  />
                </MenuItem>
              ))
            )}
            {unreadCount > 4 && (
              <>
                <Divider mb="12px" />
                <MenuItem
                  as="a"
                  href="/notifications"
                  justifyContent="center"
                  _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                  borderRadius="md"
                >
                  <Text fontSize="sm" color="blue.500" fontWeight="medium">
                    Ver mais
                  </Text>
                </MenuItem>
              </>
            )}
          </Flex>
        </MenuList>
      </Menu>

      {/* Informações e Configurações */}
      <Menu>
        <MenuButton
          as={IconButton}
          p="0px"
          aria-label="Informações"
          icon={<MdInfoOutline />}
          variant="ghost"
          size="lg"
          _hover={{ bg: 'gray.100' }}
        />
        <MenuList
          boxShadow={shadow}
          p="16px"
          borderRadius="lg"
          mt="14px"
          bg={useColorModeValue('white', 'gray.800')}
          mx={{ base: 'auto', md: '0' }}
        >
          <Flex flexDirection="column" p="8px">
            <MenuItem
              onClick={() => navigate('/admin/perfil')} // Certifique-se de que o caminho está correto
              _hover={{ bg: 'gray.100', color: 'blue.500' }}
              borderRadius="md"
              px="12px"
            >
              <Text fontSize="sm" color={textColor}>
                Perfil
              </Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: 'red.100', color: 'red.500' }}
              borderRadius="md"
              px="12px"
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
  notifications: PropTypes.array.isRequired,
  socketConnected: PropTypes.bool.isRequired,
  setNotifications: PropTypes.func.isRequired,
  fetchNotifications: PropTypes.func.isRequired,
};
