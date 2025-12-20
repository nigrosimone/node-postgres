FROM node:24

WORKDIR /app/bench

RUN apt-get update && apt-get install -y \
    git \
    bash \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g yarn

COPY . /app

COPY package*.json ./
RUN yarn install

CMD [ "bash" ]
