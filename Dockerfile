
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl 

WORKDIR /app


RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 5. Copy package files first to leverage Layer Caching
COPY package*.json ./

# 6. Install dependencies
RUN npm install

COPY . .

CMD ["node", "app.js"]

