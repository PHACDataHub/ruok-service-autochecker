FROM node:18-alpine

ENV NODE_ENV production

WORKDIR /app

RUN apk --no-cache add curl
RUN apk add --no-cache git

# # Install gitleaks
# RUN sudo curl -LO https://github.com/zricethezav/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz && \
#     sudo tar -xzf gitleaks_8.18.0_linux_x64.tar.gz && \
#     sudo mv gitleaks /usr/local/bin && \
#     sudo chmod +x /usr/local/bin/gitleaks && \
#     rm gitleaks_8.18.0_linux_x64.tar.gz

COPY package*.json ./

RUN npm ci

# COPY . . 
COPY ./.env ./.env.example ./
COPY ./src ./src
COPY ./index.js .

CMD ["npm", "--no-update-notifier", "start"]