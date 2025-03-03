// chatService.js
import axiosInstance from '../../../../../axiosInstance';

/**
 * Inicia/recupera a sala utilizando o freteId na URL:
 * POST /messages/startRoom/:freteId
 */
export const startRoom = async (freteId) => {
  const numericFreteId = parseInt(freteId, 10);
  const response = await axiosInstance.post(`/messages/startRoom/${numericFreteId}`);
  if (response.status === 200 || response.status === 201) {
    return response.data; // Ex.: { id, userMaster, workId, ... }
  } else {
    throw new Error(`Erro ao iniciar a sala. Status code: ${response.status}`);
  }
};

/**
 * Obtém a conversa de uma sala, utilizando o roomId:
 * GET /messages/conversation/:roomId
 */
export const getConversation = async (roomId) => {
  const numericRoomId = parseInt(roomId, 10);
  const response = await axiosInstance.get(`/messages/conversation/${numericRoomId}`);
  if (response.status === 200 || response.status === 201) {
    return response.data; // Array de mensagens
  } else {
    throw new Error(`Erro ao carregar a conversa. Status code: ${response.status}`);
  }
};

/**
 * Envia mensagem, com o payload exato: { roomId, message }
 * POST /messages/send
 */
export const sendMessage = async ({ roomId, message }) => {
  const payload = { roomId: parseInt(roomId, 10), message };
  const response = await axiosInstance.post('/messages/send', payload);
  if (response.status === 200 || response.status === 201) {
    return response.data;
  } else {
    throw new Error(`Erro ao enviar mensagem. Status code: ${response.status}`);
  }
};

/**
 * Exemplo de outras funções que você possa precisar
 */
export const getUserMessages = async () => {
  const response = await axiosInstance.get('/messages/user');
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axiosInstance.delete(`/messages/${messageId}`);
  return response.data;
};
