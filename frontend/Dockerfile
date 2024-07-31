FROM node:20-alpine AS build-stage
WORKDIR /usr/src/eLection-front

ARG VITE_BACKEND_URL=http://localhost:3000
ARG VITE_SOCKET_URL=http://localhost:3000
ARG VITE_SOCKET_PATH=/socket.io/

COPY . .

RUN npm ci

RUN CI=true npm test

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_SOCKET_PATH=$VITE_SOCKET_PATH

RUN npm run build

FROM nginx:mainline-alpine

COPY --from=build-stage /usr/src/eLection-front/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf