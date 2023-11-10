# [Choice] Node.js version (use -bookworm, and -bullseye variants on local arm64/Apple Silicon): 20, 18, 20-bookworm, 18-bookworm, 20-bullseye, 18-bullseye, 20-buster, 18-buster
ARG VARIANT=18-bullseye
# modified in devcontainer.json
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

#   ____        _   _                 
#  |  _ \ _   _| |_| |__   ___  _ __  
#  | |_) | | | | __| '_ \ / _ \| '_ \ 
#  |  __/| |_| | |_| | | | (_) | | | |
#  |_|    \__, |\__|_| |_|\___/|_| |_|
#         |___/                       

# Install Python and pip
RUN apt update && \
    apt install -y python3-all python3-pip python3-venv
# Add alias for python3 to bashrc
RUN echo "alias python=python3" >> /home/node/.bashrc

#        _                              
#    ___| |__  _ __ ___  _ __ ___   ___ 
#   / __| '_ \| '__/ _ \| '_ ` _ \ / _ \
#  | (__| | | | | | (_) | | | | | |  __/
#   \___|_| |_|_|  \___/|_| |_| |_|\___|

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
                           
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

# Install gitleaks
RUN sudo curl -LO https://github.com/zricethezav/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz && \
    sudo tar -xzf gitleaks_8.18.0_linux_x64.tar.gz && \
    sudo mv gitleaks /usr/local/bin && \
    sudo chmod +x /usr/local/bin/gitleaks


# Start container as non-root user
USER node

# Install puppeteer globally as node user
RUN npm install -g puppeteer

