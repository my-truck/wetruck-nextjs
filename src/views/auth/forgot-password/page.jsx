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
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";
import DefaultAuth from "../../../layouts/auth/Default";
import illustration from "../../../assets/img/auth/truckbaner01.png";
import logoTruckPreto from "../../../assets/images/logotruckpreto.png";

function ForgotPassword() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Por favor, insira seu email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://etc.wetruckhub.com/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "Um email com instruções para redefinir sua senha foi enviado."
        );
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      } else {
        setError(data.message || "Erro ao tentar enviar o email.");
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
        mt={{ base: "-15vh", md: "10vh" }}
        flexDirection="column"
      >
        {/* Logo no topo somente para o mobile */}
        <Box display={{ base: "block", md: "none" }} mb="20px" textAlign="center">
          <Image src={logoTruckPreto} alt="Logo Truck Preto" maxW="150px" mx="auto" />
        </Box>

        <Box w="100%" maxW="400px" mx="auto">
          <Heading color={textColor} fontSize={{ base: "20px", md: "36px" }} mb="10px">
            Esqueci a Senha
          </Heading>
          <Text color={textColorDetails} fontSize="md" ms="4px" mb="36px">
            Insira seu email para receber instruções de redefinição.
          </Text>
          {error && (
            <Alert status="error" mb="20px">
              <AlertIcon />
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert status="success" mb="20px">
              <AlertIcon />
              {successMessage}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
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
                borderColor="#D9D9D9"
                _hover={{ borderColor: "#D9D9D9" }}
                _focus={{
                  borderColor: "blue.500",
                  borderBottomWidth: "1px",
                  boxShadow: "none",
                }}
              />
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
              Enviar Instruções
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
              Lembrou sua senha? Entrar
            </ChakraLink>
          </Flex>
        </Box>
      </Flex>
    </DefaultAuth>
  );
}

export default ForgotPassword;
