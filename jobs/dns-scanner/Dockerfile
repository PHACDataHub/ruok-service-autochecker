FROM node:18-alpine

ENV NODE_ENV production

WORKDIR /app

# RUN apk --no-cache add curl=8.5.0-r0
RUN apk add --no-cache git

COPY package*.json ./

RUN npm ci

COPY ./.env ./.env.example ./
COPY ./src ./src
COPY ./index.js .

CMD ["npm", "--no-update-notifier", "start"]
