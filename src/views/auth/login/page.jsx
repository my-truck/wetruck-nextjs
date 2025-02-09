// src/components/auth/Login.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
  useToast,
} from "@chakra-ui/react";
import DefaultAuth from "../../../layouts/auth/Default";
import illustration from "../../../assets/img/auth/truckbaner01.png";
import logoTruckPreto from "../../../assets/images/logotruckpreto.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import axios from "../../../axiosInstance";

function Login() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleClick = () => setShow(!show);

  // Captura a query string e exibe o toast de acordo com o valor de "confirmed"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const confirmed = params.get("confirmed");

    if (confirmed === "1") {
      toast({
        title: "E-mail confirmado",
        description: "E-mail confirmado com sucesso! Agora você pode fazer login.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } else if (confirmed === "0") {
      toast({
        title: "Erro na confirmação",
        description: "Ocorreu um erro ao confirmar o e-mail.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  }, [location.search, toast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/auth/login", { email, password });

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        const token = data.data.access_token;
        const userId = data.data.user_id;

        if (token && userId) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("user_id", userId);
          console.log("Token recebido e armazenado:", token);
          console.log("User ID recebido e armazenado:", userId);
          navigate("/admin/default");
        } else {
          setError("Token ou User ID não recebido. Por favor, tente novamente.");
        }
      } else {
        const errorData = response.data;
        setError(errorData.message || "Erro ao tentar fazer login.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro de conexão com o servidor.");
      }
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
        {/* Logo para mobile */}
        <Box display={{ base: "block", md: "none" }} mb="20px" textAlign="center">
          <Image src={logoTruckPreto} alt="Logotruck Preto Logo" maxW="150px" mx="auto" />
        </Box>

        <Box w="100%" maxW="400px" mx="auto">
          <Heading color={textColor} fontSize={{ base: "20px", md: "36px" }} mb="10px">
            Entrar
          </Heading>
          <Text color={textColorDetails} fontSize="md" ms="4px" mb="36px">
            Insira suas credenciais para acessar o painel.
          </Text>
          {error && (
            <Alert status="error" mb="20px">
              <AlertIcon />
              {error}
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
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
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
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  borderColor="#D9D9D9"
                  _hover={{ borderColor: "#D9D9D9" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
                <InputRightElement>
                  <Icon
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    color="secondaryGray.600"
                    onClick={handleClick}
                    cursor="pointer"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Link "Esqueci minha senha" */}
            <Flex justifyContent="flex-end" mt="10px">
              <ChakraLink
                as={Link}
                to="/auth/forgot-password"
                color="blue.500"
                fontSize="sm"
                _hover={{ textDecoration: "underline" }}
              >
                Esqueci minha senha
              </ChakraLink>
            </Flex>

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
              Entrar
            </Button>

            {/* Link para criar conta */}
            <Flex justifyContent="center" mt="20px">
              <ChakraLink
                as={Link}
                to="/auth/signup"
                color="blue.500"
                fontSize="sm"
                _hover={{ textDecoration: "underline" }}
              >
                Não tem uma conta? Criar agora
              </ChakraLink>
            </Flex>
          </form>
        </Box>
      </Flex>
    </DefaultAuth>
  );
}

export default Login;
