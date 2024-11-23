// next.config.js
module.exports = {
    webpack: (config, { isServer }) => {
      // Desativar totalmente os source maps
      config.devtool = false;
  
      return config;
    },
  };
  