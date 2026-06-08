FROM node:25-alpine

WORKDIR /app

COPY shared /shared
COPY api/package.json api/package-lock.json* ./

RUN npm install

COPY api .

EXPOSE 3000
