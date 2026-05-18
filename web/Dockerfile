FROM node:26-alpine

WORKDIR /app

COPY shared /shared
COPY web/package.json web/package-lock.json* ./

RUN npm install

COPY web .

EXPOSE 5173
