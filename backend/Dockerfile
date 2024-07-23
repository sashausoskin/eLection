FROM node:slim
WORKDIR /usr/src/eLection-backend

COPY . .

RUN npm ci

RUN npm run build:schema

RUN npm test

RUN npm run build

CMD ["npm", "run", "start:prod"]
