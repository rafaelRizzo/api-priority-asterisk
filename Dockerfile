# Use uma imagem oficial do Node.js como base
FROM node:22-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie os arquivos de package.json e package-lock.json para o diretório de trabalho
COPY . .

# Instale as dependências do projeto
RUN npm install

RUN npx prisma generate

# Defina o comando para iniciar o servidor Fastify
CMD ["npm", "start"]