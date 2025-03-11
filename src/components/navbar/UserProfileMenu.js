import React from 'react';
import { Avatar, Flex, Menu, MenuButton, MenuItem, MenuList, Text, Box } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import LogoutButton from './LogoutButton';

export default function UserProfileMenu({ userName }) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/admin/perfil'); // Redireciona para as configurações do perfil
  };

  const handleConnectBankAccountClick = () => {
    navigate('/admin/connect-bank-account'); // Redireciona para a página de conexão da conta bancária
  };

  const handleCorridasClick = () => {
    navigate('/admin/corridas'); // Redireciona para a página de Corridas
  };

  const handleMeusVeiculosClick = () => {
    navigate('/admin/meusveiculos'); // Redireciona para a página de Meus Veículos
  };

  return (
    <Menu>
      <MenuButton
        as={Flex}
        alignItems="center"
        p="0px"
        bg="transparent"
        borderRadius="8px"
        cursor="pointer"
        _hover={{ bg: "gray.100" }}
      >
        <Flex alignItems="center" gap="16px">
          <Avatar size="sm" name={userName} src="" borderRadius="8px" />
          <Flex alignItems="center" gap="12px">
            <Text fontSize="sm" fontWeight="bold" whiteSpace="nowrap">
              {userName}
            </Text>
            <ChevronDownIcon w="20px" h="20px" />
          </Flex>
        </Flex>
      </MenuButton>

      <MenuList p="0px" mt="10px" borderRadius="20px">
        <Box w="100%" mb="0px">
          <Text
            ps="20px"
            pt="16px"
            pb="10px"
            w="100%"
            borderBottom="1px solid"
            fontSize="sm"
            fontWeight="700"
          >
            👋&nbsp; Olá, {userName}
          </Text>
        </Box>

        <Flex flexDirection="column" p="10px">
          <MenuItem
            _hover={{ bg: 'none' }}
            borderRadius="8px"
            px="14px"
            onClick={handleProfileClick}
          >
            <Text fontSize="sm">Configurações do Perfil</Text>
          </MenuItem>

          <MenuItem
            _hover={{ bg: 'none' }}
            borderRadius="8px"
            px="14px"
            onClick={handleConnectBankAccountClick}
          >
            <Text fontSize="sm">Conectar Conta Bancária</Text>
          </MenuItem>

          <MenuItem
            _hover={{ bg: 'none' }}
            borderRadius="8px"
            px="14px"
            onClick={handleCorridasClick}
          >
            <Text fontSize="sm">Corridas</Text>
          </MenuItem>

          <MenuItem
            _hover={{ bg: 'none' }}
            borderRadius="8px"
            px="14px"
            onClick={handleMeusVeiculosClick}
          >
            <Text fontSize="sm">Meus Veículos</Text>
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
  );
}

UserProfileMenu.propTypes = {
  userName: PropTypes.string.isRequired,
};
