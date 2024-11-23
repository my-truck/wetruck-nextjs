// Chakra imports
import { Box, Flex, Text, Link } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";
import FixedPlugin from "../../components/fixedPlugin/FixedPlugin";

function AuthIllustration({ children, illustrationBackground }) {
  return (
    <Flex position="relative" h="max-content">
      {/* Imagem à esquerda com o footer */}
      <Box
        display={{ base: "none", md: "block" }}
        h="100%"
        minH="100vh"
        w={{ lg: "50vw", "2xl": "44vw" }}
        position="absolute"
        left="0px"
        overflow="hidden"
      >
        <Flex
          bg={`url(${illustrationBackground})`}
          justify="center"
          align="center"
          w="100%"
          h="100%"
          bgSize="cover"
          bgPosition="50%"
          position="absolute"
          p="4"
          direction="column"
          borderTopRightRadius="90px" // Borda arredondada no canto superior direito
          borderBottomRightRadius="90px" // Borda arredondada no canto inferior direito
        >
          {/* Footer centralizado na imagem */}
          <Flex
            direction="column"
            align="center"
            position="absolute"
            bottom="40px"
            left="50%"
            transform="translateX(-50%)"
            color="white"
            textAlign="center"
          >
            <Flex gap="4" fontSize="sm" mb="2">
              <Link href="#" color="white" _hover={{ textDecoration: "underline" }}>
                Support
              </Link>
              <Link href="#" color="white" _hover={{ textDecoration: "underline" }}>
                License
              </Link>
              <Link href="#" color="white" _hover={{ textDecoration: "underline" }}>
                Terms of Use
              </Link>
              <Link href="#" color="white" _hover={{ textDecoration: "underline" }}>
                Blog
              </Link>
            </Flex>
            <Text fontSize="sm" mt="2">© 2024 We Truck. Todos os Direitos Reservados.</Text>
          </Flex>
        </Flex>
      </Box>

      {/* Formulário de login à direita */}
      <Flex
        h={{
          sm: "initial",
          md: "unset",
          lg: "100vh",
          xl: "97vh",
        }}
        w="100%"
        maxW={{ md: "66%", lg: "1313px" }}
        mx="auto"
        pt={{ sm: "50px", md: "0px" }}
        px={{ lg: "30px", xl: "0px" }}
        pe={{ xl: "70px" }}
        justifyContent="end"
        direction="column"
        ml={{ lg: "60vw" }}
      >
        {children}
      </Flex>

      <FixedPlugin />
    </Flex>
  );
}

// PROPS
AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default AuthIllustration;
