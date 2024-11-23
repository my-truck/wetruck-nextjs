import React from 'react';
import { Icon } from '@chakra-ui/react';
import { MdHome, MdLock, MdDirectionsCar, MdLocalShipping, MdDateRange } from 'react-icons/md';
import EscolhaOrigemDestino from './views/origemedestino/page';
import DetalhesCarga from './views/dadoscarga/page';
import AgendarDataHorario from './views/agendar/page';
import CalculoValorFinal from './views/calculovalorfinal/page'; // Importação da nova página
import MainDashboard from './views/admin/default';
import Login from './views/auth/login/page';
import Signup from './views/auth/signup/page';
import ForgotPassword from './views/auth/forgot-password/page';
import ResetPassword from './views/auth/reset-password/page';
import Motorista from './views/motorista/page';
import Frete from './views/frete/page';
import UploadFotosCaminhao from './views/upload-fotos-caminhao/page';
import Confirmacao from './views/confirmacao/page';

const routes = [
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
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <EscolhaOrigemDestino />,
    sidebar: false,
  },
  {
    name: 'Detalhes da Carga',
    layout: '/admin',
    path: '/dadoscarga',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <DetalhesCarga />,
    sidebar: false,
  },
  {
    name: 'Confirmação',
    layout: '/admin',
    path: '/confirmacao',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
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
    path: '/CalculoValorFinal', // Nova rota
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <CalculoValorFinal />,
    sidebar: false,
  },
  {
    name: 'Login',
    layout: '/auth',
    path: '/login',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <Login />,
    sidebar: false,
  },
  {
    layout: '/auth',
    path: '/signup',
    component: <Signup />,
    sidebar: false,
  },
  {
    name: 'Esqueci a Senha',
    layout: '/auth',
    path: '/forgot-password',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <ForgotPassword />,
    sidebar: false,
  },
  {
    name: 'Redefinir Senha',
    layout: '/auth',
    path: '/reset-password',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <ResetPassword />,
    sidebar: false,
  },
];

export default routes;
