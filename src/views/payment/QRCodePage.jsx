import React from 'react';
import { Box, Image, Text, Button, VStack, Heading, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const QRCodePage = () => {
  const navigate = useNavigate();

  // Simulação de QR code para pagamento via Pix
  const qrCodeUrl = 'https://example.com/qrcode.png'; // Substitua pela URL real do QR code gerado

  return (
    <Flex justifyContent="center" alignItems="center" minH="100vh" bg="gray.50" p="20px">
      <VStack spacing={6} maxW="400px" p="20px" borderRadius="lg" boxShadow="2xl" bg="white">
        <Heading size="lg" color="gray.800">
          Pagar via Pix
        </Heading>
        <Text fontSize="lg" color="gray.600" textAlign="center">
          Use o QR code abaixo para fazer o pagamento via Pix usando o Mercado Pago.
        </Text>

        <Box border="1px solid gray.300" p={4} borderRadius="lg">
          <Image src={qrCodeUrl} alt="QR Code para pagamento via Pix" boxSize="250px" />
        </Box>

        <Button
          colorScheme="blue"
          onClick={() => navigate('/')}
          w="full"
          py="6"
          fontSize="lg"
          fontWeight="bold"
          _hover={{ bg: 'blue.600' }}
        >
          Voltar para Página Inicial
        </Button>
      </VStack>
    </Flex>
  );
};

export default QRCodePage;
