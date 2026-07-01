FROM node:18

WORKDIR /usr/src/app

# Instala as ferramentas do SQLite
RUN apt-get update && apt-get install -y sqlite3

# Copia os pacotes e força a compilação do zero
COPY package*.json ./
RUN npm install --build-from-source=sqlite3

# Copia apenas o código para não sujar o contêiner
COPY index.js ./

# Expõe a porta do Serviço de Logging
EXPOSE 8082

CMD [ "node", "index.js" ]