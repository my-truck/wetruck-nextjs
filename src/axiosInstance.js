// src/axiosInstance.js

import axios from 'axios';

// Cria uma instância do Axios
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://etc.wetruckhub.com', // Certifique-se de que isso está correto
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para adicionar o token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Pega o token do localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Anexa o token no cabeçalho
      if (process.env.NODE_ENV !== 'production') {
        console.log('Token anexado:', token);
      }
    } else {
      console.warn('Nenhum token encontrado no localStorage.');
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('Requisição para:', config.baseURL + config.url);
    }
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com erros
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.error('Token expirado ou inválido. Redirecionando para login.');
        localStorage.removeItem('authToken'); // Remove o token inválido
        window.location.href = '/auth/login'; // Redireciona para a página de login
      } else if (status === 404) {
        console.error('Recurso não encontrado (404).');
      } else if (status >= 500) {
        console.error('Erro no servidor (500).');
      } else {
        console.error(`Erro inesperado (status ${status}):`, error.response.data);
      }
    } else {
      console.error('Erro na conexão com o servidor ou outro problema.', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
