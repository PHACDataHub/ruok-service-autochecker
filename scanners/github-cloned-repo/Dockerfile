FROM node:18-alpine

ENV NODE_ENV production

WORKDIR /app

RUN apk --no-cache add \
    curl=8.5.0-r0 \
    git=2.43.0-r0

# Install gitleaks
RUN curl -LO https://github.com/zricethezav/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz && \
    tar -xzf gitleaks_8.18.0_linux_x64.tar.gz && \
    mv gitleaks /usr/local/bin && \
    chmod +x /usr/local/bin/gitleaks && \
    rm gitleaks_8.18.0_linux_x64.tar.gz

# # Install hadolint
# RUN wget https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64 && \
#     mv hadolint-Linux-x86_64 /usr/local/bin/hadolint && \
#     chmod +x /usr/local/bin/hadolint

# Install hadolint
RUN curl -fsSL https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64 -o /usr/local/bin/hadolint && \
    chmod +x /usr/local/bin/hadolint


# Install trivy for repo scan
# RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin 

# Install trivy for repo scan
SHELL ["/bin/ash", "-o", "pipefail", "-c"]
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin


COPY package*.json ./

RUN npm ci

# COPY . . 
COPY ./.env ./.env.example ./
COPY ./src ./src
COPY ./index.js .

CMD ["npm", "--no-update-notifier", "start"]