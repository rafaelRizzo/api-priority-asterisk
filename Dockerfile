# Use uma imagem oficial do Node.js como base
FROM node:22-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie os arquivos de package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

RUN npx prisma generate

# Copie o restante dos arquivos do projeto para dentro do container
COPY . .

# Exponha a porta em que o Fastify irá rodar (por padrão, Fastify roda na porta 3000)
EXPOSE 3133

# Defina o comando para iniciar o servidor Fastify
CMD ["npm", "start"]
