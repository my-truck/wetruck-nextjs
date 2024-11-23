// src/utils/freightMapping.js

export const categoryToSubcategories = {
  "Frete Residencial": ["Carga Geral"],
  "Frete Comercial": ["Conteinerizada", "Carga Geral"],
  "Frete Cargas Pesadas": ["Granel Sólido", "Granel Líquido", "Neogranel", "Carga Granel Pressurizada"],
  "Frete Refrigerado, Congelado ou Aquecido": ["Frigorificada ou Aquecida", "Perigosa (frigorificada ou aquecida)"],
  "Frete Cargas Especiais": ["Perigosa (granel sólido)", "Perigosa (granel líquido)", "Perigosa (conteinerizada)"]
};

export const freightToAxes = {
  "Frete Residencial": [1, 2], // Permitir Eixo 1 e Eixo 2
  "Frete Comercial": [2],
  "Frete Cargas Pesadas": [3],
  "Frete Refrigerado, Congelado ou Aquecido": [2],
  "Frete Cargas Especiais": [4],
  // Adicione outras categorias conforme necessário
};

export const eixoToVehicles = {
  1: {
    veiculos: ["Fiorino", "Strada", "Saveiro", "Kombi", "HR Baú", "Iveco Daily", "VUC (Veículo Urbano de Carga)"],
    peso: "0kg a 3 toneladas",
  },
  2: {
    veiculos: ["Caminhão 3/4", "Caminhão Toco", "Caminhão Baú"],
    peso: "3 a 8 toneladas",
  },
  3: {
    veiculos: ["Caminhão Truck", "Caminhão Basculante", "Caminhão Silo", "Caminhão Prancha"],
    peso: "8 a 15 toneladas",
  },
  4: {
    veiculos: ["Carreta Simples", "Carreta Eixo Extendido", "Bi-trem", "Rodotrem"],
    peso: "15 a 30 toneladas",
  },
};

// Novo mapeamento para veículos específicos por categoria e eixo
export const categoryEixoToVehicles = {
  "Frete Residencial": {
    eixo1: { veiculos: ["Fiorino", "Strada", "Saveiro", "Kombi", "HR Baú", "Iveco Daily", "VUC (Veículo Urbano de Carga)"] },
    eixo2: { veiculos: ["Caminhão 3/4", "Caminhão Toco", "Caminhão Baú"] },
  },
  "Frete Comercial": {
    eixo2: { veiculos: ["Caminhão 3/4", "Caminhão Toco", "Caminhão Baú"] },
  },
  // Adicione outras categorias conforme necessário
};

// Mapeamento de subcategorias para IDs
export const subcategoriaParaId = {
  'Carga Geral': 1,
  'Conteinerizada': 2,
  'Granel Sólido': 3,
  'Granel Líquido': 4,
  'Neogranel': 5,
  'Carga Granel Pressurizada': 6,
  'Frigorificada ou Aquecida': 7,
  'Perigosa (frigorificada ou aquecida)': 8,
  'Perigosa (granel sólido)': 9,
  'Perigosa (granel líquido)': 10,
  'Perigosa (conteinerizada)': 11,
  // Adicione outras subcategorias conforme necessário
};

// Mapeamento de categorias para IDs
export const categoriaParaId = {
  'Frete Residencial': 1,
  'Frete Comercial': 2,
  'Frete Cargas Pesadas': 3,
  'Frete Refrigerado, Congelado ou Aquecido': 4,
  'Frete Cargas Especiais': 5,
  // Adicione outras categorias conforme necessário
};

// Mapeamentos Reversos
export const idParaCategoria = Object.fromEntries(
  Object.entries(categoriaParaId).map(([key, value]) => [value, key])
);

export const idParaSubcategoria = Object.fromEntries(
  Object.entries(subcategoriaParaId).map(([key, value]) => [value, key])
);
