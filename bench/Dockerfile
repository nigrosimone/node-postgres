FROM node:24

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    bash \
    libpq-dev \
    python3 \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Fix git owner issue
RUN git config --global --add safe.directory /app

# Fix git owner issue
RUN git config --global --add safe.directory /app

COPY . .

RUN npm install

CMD [ "bash" ]
