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
  Icon,
  Box,
} from '@chakra-ui/react';
import { FiBell, FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ItemContent } from '../../components/menu/ItemContent';

export default function NavbarLinksAdmin({
  notifications = [],
  socketConnected,
  setNotifications,
  fetchNotifications,
}) {
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const shadow = useColorModeValue(
    '0px 4px 12px rgba(0, 0, 0, 0.1)',
    '0px 4px 12px rgba(0, 0, 0, 0.2)'
  );
  const iconBgHover = useColorModeValue('gray.100', 'whiteAlpha.200');
  const iconColor = useColorModeValue('gray.600', 'white');
  const badgeBg = 'red.500';
  const badgeBorderColor = useColorModeValue('white', 'gray.800');
  const menuBg = useColorModeValue('white', 'gray.800');

  const unreadCount = notifications.length;
  const navigate = useNavigate();

  const handleNotificationsClick = () => {
    console.log(
      `WebSocket está ${socketConnected ? 'conectado' : 'desconectado'}.`
    );
  };

  const handleAccept = (acceptedId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== acceptedId)
    );
  };

  return (
    <Flex alignItems="center" gap="24px">
      {/* Ícone de Chat (tamanho normal) */}
      <Box position="relative" transition="all 0.2s">
        <IconButton
          aria-label="Ir para Chat"
          icon={
            <Icon
              as={FiMessageCircle}
              boxSize={5}
              color={iconColor}
              transition="all 0.2s"
            />
          }
          variant="ghost"
          size="lg"
          borderRadius="full"
          onClick={() => navigate('/admin/active-chats')}
          _hover={{
            bg: iconBgHover,
            transform: 'scale(1)',
          }}
          _active={{
            transform: 'scale(1)',
          }}
        />
      </Box>

      {/* Botão de Notificações (cerca de 15% menor) */}
      <Menu>
        <Box position="relative" transition="all 0.2s">
          <MenuButton
            as={IconButton}
            aria-label="Notificações"
            icon={
              <Icon
                as={FiBell}
                boxSize={6}
                color={iconColor}
                transition="all 0.2s"
                /* Aproximadamente 15% menor */
                transform="scale(0.85)"
              />
            }
            variant="ghost"
            size="lg"
            borderRadius="full"
            position="relative"
            onClick={handleNotificationsClick}
            _hover={{
              bg: iconBgHover,
              transform: 'scale(0.9)', // Cresce um pouco no hover
            }}
            _active={{
              transform: 'scale(0.8)', // Fica um pouco menor no active
            }}
          />

          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              rounded="full"
              bg={badgeBg}
              color="white"
              fontSize="0.7em"
              /* Diminuindo o badge para 17px */
              boxSize="17px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="2px solid"
              borderColor={badgeBorderColor}
              fontWeight="bold"
              zIndex={1}
              transition="all 0.2s"
              _hover={{
                transform: 'scale(1.1)',
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </Box>

        {/* Lista de Notificações */}
        <MenuList
          boxShadow={shadow}
          p="12px"
          borderRadius="lg"
          mt="14px"
          /* Largura reduzida de 450px para ~385px (cerca de 15% menor) */
          width={{ base: '90vw', md: '385px' }}
          maxH="500px"
          overflowY="auto"
          bg={menuBg}
          mx={{ base: 'auto', md: '0' }}
          border="none"
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
                  _hover={{ bg: iconBgHover, textDecoration: 'none' }}
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
    </Flex>
  );
}

NavbarLinksAdmin.propTypes = {
  notifications: PropTypes.array.isRequired,
  socketConnected: PropTypes.bool.isRequired,
  setNotifications: PropTypes.func.isRequired,
  fetchNotifications: PropTypes.func.isRequired,
};
