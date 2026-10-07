# Imagem oficial do Node.js como base
FROM node:18

# Diretório de trabalho dentro do container
WORKDIR /main

EXPOSE 3000

# Copia os arquivos do projeto para o diretório de trabalho
COPY . /main

# Instala as dependências
RUN npm install

# Comando de entrada do container (executa "node server.js")
CMD ["npm", "start"]
