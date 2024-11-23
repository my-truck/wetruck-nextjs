# Estágio de build da aplicação
FROM node:16 as build

WORKDIR /app

# Copiar os arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o código-fonte do frontend para o container
COPY ./src ./src
COPY ./public ./public

# Rodar o build do frontend
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar o build do frontend para a pasta padrão do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar o arquivo de configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80 para servir a aplicação
EXPOSE 80

# Rodar o Nginx no container
CMD ["nginx", "-g", "daemon off;"]
