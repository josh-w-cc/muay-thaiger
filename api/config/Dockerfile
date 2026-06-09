FROM node:26-alpine

WORKDIR /app

COPY shared /shared
COPY api/package.json api/package-lock.json* ./

RUN npm install

COPY api .

EXPOSE 3000
