import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdLock,
  MdDirectionsCar,
  MdLocalShipping,
  MdDateRange,
  // Adicione o ícone que desejar (ex. MdChat, MdMessage, etc.)
  MdChat,
} from 'react-icons/md';

// Importação das Páginas
import MainDashboard from './views/admin/default';
import Login from './views/auth/login/page';
import Signup from './views/auth/signup/page';
import ForgotPassword from './views/auth/forgot-password/page';
import ResetPassword from './views/auth/reset-password/page';
import Motorista from './views/motorista/page';
import Frete from './views/frete/page';
import UploadFotosCaminhao from './views/upload-fotos-caminhao/page';
import Confirmacao from './views/confirmacao/page';
import EscolhaOrigemDestino from './views/origemedestino/page';
import DetalhesCarga from './views/dadoscarga/page';
import AgendarDataHorario from './views/agendar/page';
import CalculoValorFinal from './views/calculovalorfinal/page';
import Profile from './views/perfil/page';
import ConnectBankAccount from './views/connect-bank-account/ConnectBankAccount';
import Corridas from './views/corridas/page'; 
import ChatPage from './views/admin/default/chat/page';
import FinalizarEtapas from './views/admin/default/finalizar-etapas/page';

// Importação da nova rota Meus Veículos
import MeusVeiculos from './views/meusveiculos/page';

// (Exemplo) import da página que lista as conversas ativas.
// Ajuste conforme o local em que você criou esse componente.
import ActiveChatsPage from './views/admin/default/chat/components/ActiveChats';

const routes = [
  // Rotas do Painel de Admin
  {
    name: 'Perfil',
    layout: '/admin',
    path: '/perfil',
    component: <Profile />,
    sidebar: false, 
  },

  {
    name: 'Finalizar Etapas',
    layout: '/admin',
    path: '/finalizar-etapas',
    component: <FinalizarEtapas />,
    sidebar: false, 
  },

  {
    name: 'Conectar Conta Bancária',
    layout: '/admin',
    path: '/connect-bank-account', 
    component: <ConnectBankAccount />,
    sidebar: false,
  },
  {
    name: 'Página Inicial',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
    sidebar: true,
  },
  {
    name: 'Motorista',
    layout: '/admin',
    path: '/motorista',
    icon: <Icon as={MdDirectionsCar} width="20px" height="20px" color="inherit" />,
    component: <Motorista />,
    sidebar: true,
  },
  {
    name: 'Frete',
    layout: '/admin',
    path: '/frete',
    icon: <Icon as={MdLocalShipping} width="20px" height="20px" color="inherit" />,
    component: <Frete />,
    sidebar: true,
  },
  {
    name: 'Upload de Fotos',
    layout: '/admin',
    path: '/upload-fotos-caminhao',
    icon: <Icon as={MdDateRange} width="20px" height="20px" color="inherit" />,
    component: <UploadFotosCaminhao />,
    sidebar: false,
  },
  {
    name: 'Escolha Origem e Destino',
    layout: '/admin',
    path: '/origemedestino',
    component: <EscolhaOrigemDestino />,
    sidebar: false,
  },
  {
    name: 'Detalhes da Carga',
    layout: '/admin',
    path: '/dadoscarga',
    component: <DetalhesCarga />,
    sidebar: false,
  },
  {
    name: 'Confirmação',
    layout: '/admin',
    path: '/confirmacao',
    component: <Confirmacao />,
    sidebar: false,
  },
  {
    name: 'Agendar Data e Horário',
    layout: '/admin',
    path: '/agendar',
    icon: <Icon as={MdDateRange} width="20px" height="20px" color="inherit" />,
    component: <AgendarDataHorario />,
    sidebar: false,
  },
  {
    name: 'Cálculo do Valor Final',
    layout: '/admin',
    path: '/calculovalorfinal',
    component: <CalculoValorFinal />,
    sidebar: false,
  },
  {
    name: 'Corridas',
    layout: '/admin',
    path: '/corridas',
    icon: <Icon as={MdDirectionsCar} width="20px" height="20px" color="inherit" />,
    component: <Corridas />,
    sidebar: true, 
  },
  {
    name: 'Chat',
    layout: '/admin',
    path: '/chat/:driverId', 
    component: <ChatPage />,
    sidebar: false, 
  },
  {
    name: 'Meus Veículos',
    layout: '/admin',
    path: '/meusveiculos',
    icon: <Icon as={MdDirectionsCar} width="20px" height="20px" color="inherit" />,
    component: <MeusVeiculos />,
    sidebar: true,
  },

  // *** Nova rota para listar conversas ativas ***
  {
    name: 'Conversas Ativas',
    layout: '/admin',
    path: '/active-chats',
    icon: <Icon as={MdChat} width="20px" height="20px" color="inherit" />,
    component: <ActiveChatsPage />,
    sidebar: true,
  },
  // Fim da nova rota

  // Rotas de Autenticação
  {
    name: 'Login',
    layout: '/auth',
    path: '/login',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <Login />,
    sidebar: false,
  },
  {
    name: 'Cadastro',
    layout: '/auth',
    path: '/signup',
    component: <Signup />,
    sidebar: false,
  },
  {
    name: 'Esqueci a Senha',
    layout: '/auth',
    path: '/forgot-password',
    component: <ForgotPassword />,
    sidebar: false,
  },
  {
    name: 'Redefinir Senha',
    layout: '/auth',
    path: '/reset-password',
    component: <ResetPassword />,
    sidebar: false,
  },
];

export default routes;
