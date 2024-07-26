FROM node:20-alpine AS build-stage
WORKDIR /usr/src/eLection-front

ARG VITE_BACKEND_URL=http://localhost:3000
ARG VITE_SOCKET_URL=http://localhost:3000
ARG VITE_SOCKET_PATH=/socket.io/


COPY . .

RUN npm ci

RUN CI=true npm test

ENV VITE_BACKEND_URL=$backend_url
ENV VITE_SOCKET_URL=$socket_url
ENV VITE_SOCKET_PATH=$socket_path

RUN npm run build

# This is a new stage, everything before this is gone, except the files we want to COPY

FROM nginx:mainline-alpine
# COPY the directory build from build-stage to /usr/share/nginx/html
# The target location here was found from the Docker hub page

COPY --from=build-stage /usr/src/eLection-front/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf