'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Flex,
  Icon,
  Container,
  HStack,
  Button,
  Spinner,
  Text,
  Image,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Divider,
  SimpleGrid,
  useToast,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Avatar,
  Select,
  FormControl,
  FormLabel,
  Input,
  Textarea
} from '@chakra-ui/react';
import {
  FiTruck,
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiRefreshCw,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Page() {
  const navigate = useNavigate();
  const toast = useToast();

  // ----------------------------------------------------------------
  // ARRAYS for Classes, Types, Loads – used in edit popup
  // ----------------------------------------------------------------
  const vehicleClasses = [
    { id: 1, name: 'Classe 1: Caminhões Leves (até 3,5 toneladas)' },
    { id: 2, name: 'Classe 2: Caminhões Médios (3,5 a 7,5 t)' },
    { id: 3, name: 'Classe 3: Caminhões Pesados (acima de 7,5 t)' },
    { id: 4, name: 'Classe 4: Caminhões Articulados (Carretas, bi-trens)' },
    { id: 5, name: 'Classe 5: Veículos Especiais (tanque, frigoríficos, etc.)' }
  ];

  const vehicleTypes = [
    { id: 1,  name: 'Fiorino',           vehicleClassId: 1 },
    { id: 2,  name: 'Strada',           vehicleClassId: 1 },
    { id: 3,  name: 'Saveiro',          vehicleClassId: 1 },
    { id: 8,  name: 'Caminhão 3/4',     vehicleClassId: 2 },
    { id: 9,  name: 'Caminhão Toco',    vehicleClassId: 2 },
    { id: 11, name: 'Caminhão Truck',   vehicleClassId: 3 },
    { id: 18, name: 'Rodotrem',         vehicleClassId: 4 },
    { id: 13, name: 'Caminhão Silo',    vehicleClassId: 3 },
    { id: 22, name: 'Caminhão Tanque',  vehicleClassId: 5 },
    { id: 23, name: 'Caminhão Frigorífico', vehicleClassId: 5 },
  ];

  const loadTypes = [
    { id: 1, name: 'Carga Geral' },
    { id: 2, name: 'Carga Perigosa (carga frigorificada ou aquecida)' },
    { id: 3, name: 'Carga Perigosa (granel sólido)' },
    { id: 4, name: 'Carga Perigosa (granel líquido)' },
    { id: 5, name: 'Carga de Granel Sólido' },
    { id: 6, name: 'Carga Perigosa (granel sólido)' }
  ];

  // ----------------------------------------------------------------
  // STATES for listing
  // ----------------------------------------------------------------
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit popup states
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Detail drawer
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Chakra UI disclosures
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose
  } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose
  } = useDisclosure();

  // Switch for grid/list
  const [viewMode, setViewMode] = useState('grid');

  // ----------------------------------------------------------------
  // FETCH Vehicles
  // ----------------------------------------------------------------
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Token não encontrado!');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get('https://etc.wetruckhub.com/vehicles/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data?.data) {
        setVehicles(response.data.data);
      }
    } catch (err) {
      setError('Erro ao buscar veículos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // NAVIGATE BACK or to /admin/motorista for "Novo"
  // ----------------------------------------------------------------
  const handleVoltar = () => {
    console.log('Voltar para a tela anterior...');
  };

  const handleAddVehicle = () => {
    // For new vehicles, go to /admin/motorista
    navigate('/admin/motorista');
  };

  // ----------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------
  const deleteVehicle = async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Token não encontrado!');
      return;
    }

    try {
      await axios.delete(`https://etc.wetruckhub.com/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      toast({
        title: 'Veículo excluído',
        description: 'O veículo foi removido com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      setError('Erro ao excluir veículo: ' + err.message);
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const confirmDelete = (id, name) => {
    const vehicleName = name || 'este veículo';
    toast({
      title: `Excluir ${vehicleName}?`,
      description: (
        <Flex direction="column" gap={3}>
          <Text>Esta ação não pode ser desfeita.</Text>
          <Flex gap={2} justify="flex-end">
            <Button size="sm" variant="outline" onClick={() => toast.closeAll()}>
              Cancelar
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => {
                deleteVehicle(id);
                toast.closeAll();
              }}
            >
              Excluir
            </Button>
          </Flex>
        </Flex>
      ),
      status: 'warning',
      duration: null,
      isClosable: true
    });
  };

  // ----------------------------------------------------------------
  // EDIT
  // ----------------------------------------------------------------
  const startEditing = (vehicle) => {
    // Convert data from the existing vehicle to your fields
    // For the shape: { licensePlate, vehicleTypeId, vehicleClassId, description, postalCode, loadTypeId }
    const classId = vehicle.vehicleType?.vehicleClass?.id || '';
    const typeId  = vehicle.vehicleType?.id || '';
    let foundLoad = loadTypes.find((ld) => ld.name === vehicle.loadType);
    const loadTypeId = foundLoad ? foundLoad.id : '';

    setEditingVehicle({
      id: vehicle.id,
      vehicleClassId: classId,
      vehicleTypeId: typeId,
      loadTypeId: loadTypeId,
      licensePlate: vehicle.licensePlate || '',
      description: vehicle.description || '',
      postalCode: vehicle.postalCode || ''
    });
    setIsEditing(true);
    onEditOpen();
  };

  // Called when user clicks "Salvar" in the popup
  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Token não encontrado!');
      return;
    }

    // Build the body to match your endpoint specs:
    // {
    //   "licensePlate": "ABC1X23",
    //   "vehicleTypeId": 1,
    //   "vehicleClassId": 3,
    //   "description": "Descrição atualizada",
    //   "postalCode": "12345-678",
    //   "loadTypeId": 2
    // }
    const dataToSend = {
      licensePlate: editingVehicle.licensePlate,
      vehicleTypeId: parseInt(editingVehicle.vehicleTypeId, 10),
      vehicleClassId: parseInt(editingVehicle.vehicleClassId, 10),
      description: editingVehicle.description,
      postalCode: editingVehicle.postalCode,
      loadTypeId: parseInt(editingVehicle.loadTypeId, 10)
    };

    try {
      await axios.put(
        `https://etc.wetruckhub.com/vehicles/${editingVehicle.id}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Rebuild local data if needed:
      const finalClass = vehicleClasses.find((c) => c.id === parseInt(editingVehicle.vehicleClassId, 10));
      const finalType  = vehicleTypes.find((t) => t.id === parseInt(editingVehicle.vehicleTypeId, 10));
      const finalLoad  = loadTypes.find((l) => l.id === parseInt(editingVehicle.loadTypeId, 10));

      const updatedVehicle = {
        ...editingVehicle,
        loadType: finalLoad ? finalLoad.name : '',
        vehicleType: finalType
          ? {
              id: finalType.id,
              name: finalType.name,
              vehicleClass: finalClass ? { id: finalClass.id, name: finalClass.name } : undefined
            }
          : undefined
      };

      setVehicles((prev) => prev.map((v) => (v.id === editingVehicle.id ? { ...v, ...updatedVehicle } : v)));

      toast({
        title: 'Veículo atualizado',
        description: 'As alterações foram salvas com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onEditClose();
      setIsEditing(false);
      setEditingVehicle(null);
    } catch (err) {
      setError('Erro ao atualizar veículo: ' + err.message);
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // ----------------------------------------------------------------
  // DETAIL
  // ----------------------------------------------------------------
  const viewVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    onDetailOpen();
  };

  const renderVehicleDetailDrawer = () => {
    if (!selectedVehicle) return null;
    return (
      <Drawer isOpen={isDetailOpen} placement="right" onClose={onDetailClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Detalhes do Veículo</DrawerHeader>
          <DrawerBody>
            <Box position="relative" mb={6}>
              <VStack spacing={2}>
                {(selectedVehicle.imageUrls || []).map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Foto ${index + 1} do veículo`}
                    borderRadius="md"
                    objectFit="cover"
                    w="100%"
                    maxH="300px"
                  />
                ))}
              </VStack>
            </Box>

            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="lg" color="gray.800" mb={2}>
                  {selectedVehicle.vehicleType?.name || 'Veículo'}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Publicado recentemente
                </Text>
              </Box>
              <Divider />

              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    Placa
                  </Text>
                  <Text>{selectedVehicle.licensePlate || 'Não informada'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    Classe
                  </Text>
                  <Text>
                    {selectedVehicle.vehicleType?.vehicleClass?.name || 'N/A'}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    Tipo de Carga
                  </Text>
                  <Text>{selectedVehicle.loadType || 'Não especificado'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    Localização
                  </Text>
                  <Flex align="center">
                    <Icon as={FiMapPin} mr={1} color="red.500" />
                    <Text>{selectedVehicle.postalCode || '---'}</Text>
                  </Flex>
                </Box>
              </SimpleGrid>

              {selectedVehicle.description && (
                <Box>
                  <Text fontWeight="bold" color="gray.700" mb={2}>
                    Descrição
                  </Text>
                  <Text>{selectedVehicle.description}</Text>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  };

  // ----------------------------------------------------------------
  // EDIT MODAL
  // ----------------------------------------------------------------
  const renderEditForm = () => (
    <Modal
      isOpen={isEditOpen}
      onClose={() => {
        setIsEditing(false);
        setEditingVehicle(null);
        onEditClose();
      }}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleUpdateVehicle}>
        <ModalHeader>Editar Veículo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Classe do Caminhão</FormLabel>
            <Select
              placeholder="Selecione a classe"
              value={editingVehicle?.vehicleClassId || ''}
              onChange={(e) =>
                setEditingVehicle({
                  ...editingVehicle,
                  vehicleClassId: e.target.value,
                  vehicleTypeId: '' // reset if user changes class
                })
              }
            >
              {vehicleClasses.map((vc) => (
                <option key={vc.id} value={vc.id}>
                  {vc.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Tipo de Veículo</FormLabel>
            <Select
              placeholder="Selecione o tipo"
              value={editingVehicle?.vehicleTypeId || ''}
              onChange={(e) =>
                setEditingVehicle({
                  ...editingVehicle,
                  vehicleTypeId: e.target.value
                })
              }
              isDisabled={!editingVehicle?.vehicleClassId}
            >
              {vehicleTypes
                .filter(
                  (vt) =>
                    vt.vehicleClassId === parseInt(editingVehicle?.vehicleClassId || '0', 10)
                )
                .map((vt) => (
                  <option key={vt.id} value={vt.id}>
                    {vt.name}
                  </option>
                ))}
            </Select>
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Placa</FormLabel>
            <Input
              placeholder="AAA-1234"
              value={editingVehicle?.licensePlate || ''}
              onChange={(e) =>
                setEditingVehicle({
                  ...editingVehicle,
                  licensePlate: e.target.value
                })
              }
            />
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Localização (CEP)</FormLabel>
            <Input
              placeholder="00000-000"
              value={editingVehicle?.postalCode || ''}
              onChange={(e) =>
                setEditingVehicle({
                  ...editingVehicle,
                  postalCode: e.target.value
                })
              }
            />
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Tipo de Carga</FormLabel>
            <Select
              placeholder="Selecione a carga"
              value={editingVehicle?.loadTypeId || ''}
              onChange={(e) =>
                setEditingVehicle({
                  ...editingVehicle,
                  loadTypeId: e.target.value
                })
              }
            >
              {loadTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Descrição</FormLabel>
            <Textarea
              rows={4}
              placeholder="Descreva características adicionais..."
              value={editingVehicle?.description || ''}
              onChange={(e) =>
                setEditingVehicle({
                  ...editingVehicle,
                  description: e.target.value
                })
              }
            />
          </FormControl>

        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={() => {
              setIsEditing(false);
              setEditingVehicle(null);
              onEditClose();
            }}
          >
            Cancelar
          </Button>
          <Button colorScheme="blue" type="submit">
            Salvar Alterações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="white" boxShadow="sm" py={4} px={6} mb={6}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Icon as={FiTruck} boxSize={6} color="blue.500" />
              <Heading size="lg" color="gray.800">
                Meus Veículos
              </Heading>
            </HStack>
            <Button
              variant="ghost"
              colorScheme="blue"
              onClick={handleVoltar}
              leftIcon={<FiArrowLeft />}
              _hover={{ bg: 'blue.50' }}
            >
              Voltar
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl">
        {/* Top Actions */}
        <Flex mb={4} gap={2} align="center" justify="flex-end">
          <Tooltip label="Atualizar" openDelay={300}>
            <IconButton
              icon={<FiRefreshCw />}
              aria-label="Atualizar"
              variant="outline"
              onClick={fetchVehicles}
            />
          </Tooltip>

          <Tooltip label="Visualização" openDelay={300}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={viewMode === 'grid' ? <FiGrid /> : <FiList />}
                variant="outline"
                aria-label="Mudar visualização"
              />
              <MenuList>
                <MenuItem icon={<FiGrid />} onClick={() => setViewMode('grid')}>
                  Grade
                </MenuItem>
                <MenuItem icon={<FiList />} onClick={() => setViewMode('list')}>
                  Lista
                </MenuItem>
              </MenuList>
            </Menu>
          </Tooltip>

          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => navigate('/admin/motorista')}
          >
            Novo
          </Button>
        </Flex>

        {/* Error Alert */}
        {error && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            p={4}
            mb={4}
            borderRadius="md"
          >
            <Text color="red.600">{error}</Text>
          </Box>
        )}

        {/* Loading / Empty / Display */}
        {isLoading ? (
          <Flex minH="200px" align="center" justify="center">
            <Spinner size="xl" thickness="4px" color="blue.500" />
          </Flex>
        ) : vehicles.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            bg="white"
            borderRadius="md"
            p={10}
            boxShadow="md"
            minH="300px"
          >
            <Icon as={FiTruck} boxSize={12} color="gray.400" mb={4} />
            <Heading size="md" mb={2} color="gray.700">
              Nenhum veículo encontrado
            </Heading>
            <Text color="gray.500" mb={4} textAlign="center">
              Você ainda não cadastrou nenhum veículo.
            </Text>
            <Button variant="outline" leftIcon={<FiRefreshCw />} onClick={fetchVehicles}>
              Atualizar
            </Button>
          </Flex>
        ) : viewMode === 'grid' ? (
          <Grid templateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={6} mb={8}>
            {vehicles.map((vehicle) => (
              <GridItem
                key={vehicle.id}
                bg="white"
                border="1px"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <Box
                  h="200px"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                  position="relative"
                >
                  {(vehicle.imageUrls && vehicle.imageUrls.length > 0) ? (
                    <Image
                      src={vehicle.imageUrls[0]}
                      alt={`Foto de ${vehicle.vehicleType?.name || 'Veículo'}`}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      transition="transform 0.5s"
                      _hover={{ transform: 'scale(1.05)' }}
                      cursor="pointer"
                      onClick={() => viewVehicleDetails(vehicle)}
                    />
                  ) : (
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      color="gray.500"
                      cursor="pointer"
                      onClick={() => viewVehicleDetails(vehicle)}
                    >
                      <Icon as={FiTruck} boxSize={10} mb={2} />
                      <Text fontSize="sm">Sem imagem disponível</Text>
                    </Flex>
                  )}
                </Box>

                <Box p={4}>
                  <Heading
                    as="h2"
                    fontSize="lg"
                    color="gray.700"
                    borderBottom="2px solid"
                    borderColor="blue.200"
                    pb={2}
                    mb={3}
                    cursor="pointer"
                    onClick={() => viewVehicleDetails(vehicle)}
                  >
                    {vehicle.vehicleType?.name || 'Veículo'}
                  </Heading>

                  <Text fontSize="sm" mb={1}>
                    <strong>Placa:</strong> {vehicle.licensePlate || '---'}
                  </Text>
                  <Text fontSize="sm" mb={1}>
                    <strong>Classe:</strong>{' '}
                    {vehicle.vehicleType?.vehicleClass?.name || 'Não especificado'}
                  </Text>
                  <Text fontSize="sm" mb={1}>
                    <strong>Carga:</strong> {vehicle.loadType || 'Não especificado'}
                  </Text>
                  <Text fontSize="sm" mb={1}>
                    <strong>Localização:</strong> {vehicle.postalCode || '---'}
                  </Text>

                  {vehicle.description && (
                    <Text fontSize="xs" mt={2} noOfLines={2} color="gray.600">
                      {vehicle.description}
                    </Text>
                  )}

                  <Flex justify="space-between" mt={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Button
                      size="sm"
                      leftIcon={<FiEdit2 />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => startEditing(vehicle)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FiTrash2 />}
                      colorScheme="red"
                      onClick={() => confirmDelete(vehicle.id, vehicle.vehicleType?.name)}
                    >
                      Excluir
                    </Button>
                  </Flex>
                </Box>
              </GridItem>
            ))}
          </Grid>
        ) : (
          <VStack spacing={4} mb={8}>
            {vehicles.map((vehicle) => (
              <Flex
                key={vehicle.id}
                w="100%"
                bg="white"
                border="1px"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                p={4}
                align="center"
                justify="space-between"
              >
                <Flex align="center" gap={4}>
                  <Box
                    position="relative"
                    w="100px"
                    h="70px"
                    bg="gray.100"
                    overflow="hidden"
                    borderRadius="md"
                  >
                    {(vehicle.imageUrls && vehicle.imageUrls.length > 0) ? (
                      <Image
                        src={vehicle.imageUrls[0]}
                        alt={`Foto de ${vehicle.vehicleType?.name || 'Veículo'}`}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        transition="transform 0.5s"
                        _hover={{ transform: 'scale(1.05)' }}
                        cursor="pointer"
                        onClick={() => viewVehicleDetails(vehicle)}
                      />
                    ) : (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        color="gray.500"
                        w="100%"
                        h="100%"
                        cursor="pointer"
                        onClick={() => viewVehicleDetails(vehicle)}
                      >
                        <Icon as={FiTruck} boxSize={6} mb={1} />
                        <Text fontSize="xs">Sem imagem</Text>
                      </Flex>
                    )}
                  </Box>

                  <Box>
                    <Text
                      fontWeight="bold"
                      color="gray.700"
                      cursor="pointer"
                      onClick={() => viewVehicleDetails(vehicle)}
                    >
                      {vehicle.vehicleType?.name || 'Veículo'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Classe: {vehicle.vehicleType?.vehicleClass?.name || 'Não especificado'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Carga: {vehicle.loadType || 'Não especificado'}
                    </Text>
                  </Box>
                </Flex>

                <Flex align="center" gap={3}>
                  <IconButton
                    icon={<FiEdit2 />}
                    aria-label="Editar veículo"
                    variant="outline"
                    size="sm"
                    colorScheme="blue"
                    onClick={() => startEditing(vehicle)}
                  />
                  <IconButton
                    icon={<FiTrash2 />}
                    aria-label="Excluir veículo"
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    onClick={() => confirmDelete(vehicle.id, vehicle.vehicleType?.name)}
                  />
                </Flex>
              </Flex>
            ))}
          </VStack>
        )}
      </Container>

      {renderVehicleDetailDrawer()}
      {isEditing && renderEditForm()}
    </Box>
  );
}
