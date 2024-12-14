import React from 'react';
import {
  Avatar,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import LogoutButton from './LogoutButton';

export default function UserProfileMenu({ userName }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

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
        width="auto"
        minW="200px"
      >
        {/* Foto de Perfil e Nome do Usuário na mesma altura */}
        <Flex alignItems="center" gap="16px">
          <Avatar
            size="sm"
            name={userName}
            src=""
            borderRadius="8px"
          />
          <Flex alignItems="center" gap="12px">
            <Text fontSize="sm" fontWeight="bold" color={textColor} whiteSpace="nowrap">
              {userName}
            </Text>
            <ChevronDownIcon color={textColor} w="20px" h="20px" />
          </Flex>
        </Flex>
      </MenuButton>

      <MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px">
        <Box w="100%" mb="0px">
          <Text
            ps="20px"
            pt="16px"
            pb="10px"
            w="100%"
            borderBottom="1px solid"
            fontSize="sm"
            fontWeight="700"
            color={textColor}
          >
            👋&nbsp; Olá, {userName}
          </Text>
        </Box>

        <Flex flexDirection="column" p="10px">
          <MenuItem _hover={{ bg: 'none' }} borderRadius="8px" px="14px">
            <Text fontSize="sm">Configurações do Perfil</Text>
          </MenuItem>
          <MenuItem _hover={{ bg: 'none' }} borderRadius="8px" px="14px">
            <Text fontSize="sm">Configurações da Newsletter</Text>
          </MenuItem>
          <MenuItem _hover={{ bg: 'none' }} color="red.400" borderRadius="8px" px="14px">
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
