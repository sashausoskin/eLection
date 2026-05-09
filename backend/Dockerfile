FROM node:20-alpine AS build-stage
WORKDIR /usr/src/eLection-backend

COPY . .

RUN npm ci && \
	npm run build:schema && \
	npm test && \
	npm run build

FROM node:20-alpine
COPY --from=build-stage /usr/src/eLection-backend/dist .
COPY ./package.json ./package.json 
COPY ./package-lock.json ./package-lock.json 

RUN npm ci && \
	adduser -D appuser && \
	chown appuser .

USER appuser

EXPOSE 3000

CMD ["npm", "exec", "cross-env", "NODE_ENV=production", "node", "index.js"]
