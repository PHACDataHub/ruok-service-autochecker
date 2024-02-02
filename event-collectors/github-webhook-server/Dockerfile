FROM node:18-alpine

ENV NODE_ENV production

WORKDIR /app

# RUN apk --no-cache add curl=8.5.0-r0 
RUN apk --no-cache add curl

COPY package*.json ./

RUN npm ci

# COPY . . 
COPY ./.env ./.env.example ./
COPY ./index.js .
COPY ./src/ ./src

USER node

CMD ["npm", "--no-update-notifier", "start"]

EXPOSE 3000