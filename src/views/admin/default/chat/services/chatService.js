// src/services/chatService.js
import axiosInstance from '../../../../../axiosInstance';

// Inicia/recupera a sala, enviando o receiverId (id do motorista) como número
export const startRoom = async (receiverId) => {
  const payload = { receiverId: Number(receiverId) }; // Converte para número
  const response = await axiosInstance.post('/messages/startRoom', payload);
  return response.data; // Ex.: { id, userMaster, ... }
};


export const getConversation = async (roomId) => {
  const numericRoomId = Number(roomId); 
  const response = await axiosInstance.get(`/messages/conversation/${numericRoomId}`);
  return response.data; 
};

// Obter todas as mensagens de um usuário
export const getUserMessages = async () => {
  const response = await axiosInstance.get('/messages/user');
  return response.data; 
};


export const sendMessage = async ({ roomId, receiverId, message }) => {
  const payload = { roomId, receiverId: Number(receiverId), message };
  const response = await axiosInstance.post('/messages/send', payload);
  return response.data; // Retorna a mensagem enviada
};

// Deletar mensagem
export const deleteMessage = async (messageId) => {
  const response = await axiosInstance.delete(`/messages/${messageId}`);
  return response.data;
};
