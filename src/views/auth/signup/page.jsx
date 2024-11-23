// src/views/auth/signup/page.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Icon,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";
import DefaultAuth from "../../../layouts/auth/Default";
import illustration from "../../../assets/img/auth/truckbaner01.png";
import logoTruckPreto from "../../../assets/images/logotruckpreto.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

function Signup() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handlePasswordVisibility = () => setShowPassword(!showPassword);
  const handleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não correspondem.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://etc.wetruckhub.com/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName: name, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/auth/login", {
          state: { success: "Conta criada com sucesso. Faça login." },
        });
      } else {
        setError(data.message || "Erro ao tentar criar conta.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h={{ base: "100vh", md: "100%" }}
        alignItems={{ base: "center", md: "start" }}
        justifyContent="center"
        mb={{ base: "0", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "-4vh", md: "20vh" }}
        flexDirection="column"
      >
        <Box
          display={{ base: "block", md: "none" }}
          mb="20px"
          textAlign="center"
        >
          <Image
            src={logoTruckPreto}
            alt="logo truck  preto"
            maxW="150px"
            mx="auto"
          />
        </Box>

        <Box w="100%" maxW="400px" mx="auto">
          <Heading
            color={textColor}
            fontSize={{ base: "20px", md: "36px" }}
            mb="10px"
          >
            Criar Conta
          </Heading>
          <Text color={textColorDetails} fontSize="md" ms="4px" mb="36px">
            Preencha os campos para criar sua conta.
          </Text>
          {error && (
            <Alert status="error" mb="20px">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <FormControl mb="24px">
              <FormLabel ms="4px" fontSize="sm" fontWeight="500" htmlFor="name">
                Nome Completo
              </FormLabel>
              <Input
                id="name"
                variant="flushed"
                fontSize="16px"
                ms="4px"
                placeholder="Seu nome completo"
                size="lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderBottom="2px solid #D9D9D9"
                _focus={{
                  borderBottomColor: "#277cef",
                  boxShadow: "none",
                }}
              />
            </FormControl>
            <FormControl mb="24px">
              <FormLabel ms="4px" fontSize="sm" fontWeight="500" htmlFor="email">
                Email
              </FormLabel>
              <Input
                id="email"
                variant="flushed"
                fontSize="16px"
                ms="4px"
                placeholder="Seu email"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderBottom="2px solid #D9D9D9"
                _focus={{
                  borderBottomColor: "#277cef",
                  boxShadow: "none",
                }}
              />
            </FormControl>
            <FormControl mb="24px">
              <FormLabel ms="4px" fontSize="sm" fontWeight="500" htmlFor="password">
                Senha
              </FormLabel>
              <InputGroup size="lg">
                <Input
                  id="password"
                  variant="flushed"
                  fontSize="16px"
                  ms="4px"
                  placeholder="Sua senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  borderBottom="2px solid #D9D9D9"
                  _focus={{
                    borderBottomColor: "#277cef",
                    boxShadow: "none",
                  }}
                />
                <InputRightElement>
                  <Icon
                    as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    color="secondaryGray.600"
                    onClick={handlePasswordVisibility}
                    cursor="pointer"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl mb="24px">
              <FormLabel ms="4px" fontSize="sm" fontWeight="500" htmlFor="confirmPassword">
                Confirmar Senha
              </FormLabel>
              <InputGroup size="lg">
                <Input
                  id="confirmPassword"
                  variant="flushed"
                  fontSize="16px"
                  ms="4px"
                  placeholder="Confirme sua senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  borderBottom="2px solid #D9D9D9"
                  _focus={{
                    borderBottomColor: "#277cef",
                    boxShadow: "none",
                  }}
                />
                <InputRightElement>
                  <Icon
                    as={showConfirmPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    color="secondaryGray.600"
                    onClick={handleConfirmPasswordVisibility}
                    cursor="pointer"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              bg="#277cef"
              color="white"
              fontSize="sm"
              w="100%"
              h="50px"
              mt="30px"
              type="submit"
              isLoading={loading}
              _hover={{ bg: "#1f6ad1" }}
            >
              Criar Conta
            </Button>
          </form>

          <Flex justifyContent="center" mt="20px">
            <ChakraLink
              as={Link}
              to="/auth/login"
              color="blue.500"
              fontSize="sm"
              _hover={{ textDecoration: "underline" }}
            >
              Já tem uma conta? Entrar
            </ChakraLink>
          </Flex>
        </Box>
      </Flex>
    </DefaultAuth>
  );
}

export default Signup;
