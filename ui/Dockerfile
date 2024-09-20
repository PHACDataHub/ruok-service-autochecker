FROM node:19-bullseye

WORKDIR /app

COPY package.json /app/

RUN npm install

RUN npm list

COPY [".env",".env.example","index.html","rspack.config.js","lingui.config.js","/app/"]

COPY src /app/src/

RUN ls -la

RUN npm run build

COPY server.js /app/

EXPOSE 8080

CMD ["node", "server.js"]
