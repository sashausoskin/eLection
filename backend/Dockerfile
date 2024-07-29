FROM node:20-alpine AS build-stage
WORKDIR /usr/src/eLection-backend

COPY . .

RUN npm ci

RUN npm run build:schema

RUN npm test

RUN npm run build


FROM node:20-alpine
COPY --from=build-stage /usr/src/eLection-backend/dist .
COPY ./package.json ./package.json 
COPY ./package-lock.json ./package-lock.json 

RUN npm ci

CMD ["node", "index.js"]
