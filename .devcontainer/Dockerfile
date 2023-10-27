# [Choice] Node.js version (use -bookworm, and -bullseye variants on local arm64/Apple Silicon): 20, 18, 20-bookworm, 18-bookworm, 20-bullseye, 18-bullseye, 20-buster, 18-buster
ARG VARIANT=18-bullseye
# modified in devcontainer.json
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

#       _                 _              _     
#    __| | _____   __    | |_ ___   ___ | |___ 
#   / _` |/ _ \ \ / /____| __/ _ \ / _ \| / __|
#  | (_| |  __/\ V /_____| || (_) | (_) | \__ \
#   \__,_|\___| \_/       \__\___/ \___/|_|___/

# Install d2lang
RUN curl -fsSL https://d2lang.com/install.sh | sh -s --
# Install direnv
RUN curl -qfsSL https://github.com/direnv/direnv/releases/download/v2.32.1/direnv.linux-amd64 -o direnv && \
    chmod +x direnv && \
    sudo mv direnv /usr/local/bin && \
    echo eval "$(direnv hook bash)" >> /home/node/.bashrc
# Install smee-client and figlet
RUN npm install -g smee-client figlet
# Install nats client for debugging
RUN curl -fsSL https://github.com/nats-io/natscli/releases/download/v0.1.1/nats-0.1.1-linux-amd64.zip -o nats-0.1.1-linux-amd64.zip && \
    unzip nats-0.1.1-linux-amd64.zip && \
    chmod +x nats-0.1.1-linux-amd64/nats && \
    mv nats-0.1.1-linux-amd64/nats /usr/local/bin/nats && \
    rm -r nats-0.1.1-linux-amd64 && rm nats-0.1.1-linux-amd64.zip
# Install dependencies for Chrome
RUN sudo apt-get update && \
    sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2

# Start container as non-root user
USER node

# Install puppeteer globally as node user
RUN npm install -g puppeteer
