# builder
FROM ubuntu:20.04 AS monero-miner-builder

RUN apt-get update && apt-get dist-upgrade -y

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Berlin

RUN apt install git automake autoconf libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev build-essential \
    libgl-dev libglu-dev libglib2.0-dev libsm-dev libxrender-dev libfontconfig1-dev libxext-dev -y

RUN git clone https://github.com/tpruvot/cpuminer-multi.git

RUN cd cpuminer-multi && ./autogen.sh
RUN cd cpuminer-multi && ./configure

RUN cd cpuminer-multi && ./build.sh

# monero-miner
FROM ubuntu:20.04 AS monero-miner

RUN apt-get update && apt dist-upgrade -y && \
    apt-get install libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev -y

RUN rm -rf /var/lib/apt/lists/*

WORKDIR /

COPY --from=monero-miner-builder /cpuminer-multi/cpuminer .
COPY /miner/miner.sh /bin
RUN chmod +x /bin/miner.sh

CMD ["/bin/miner.sh"]

# monero-miner-shipper
FROM node:16 AS monero-miner-shipper

WORKDIR /opt

RUN touch /var/log/metrics.log

COPY /miner/logs2postgres.js /opt
COPY /miner/package.json /opt

RUN npm install --only=production

CMD ["npm", "start"]


# monero-scraper
FROM balenalib/aarch64-ubuntu-node:10-latest-run AS monero-scraper

RUN apt-get update && apt-get dist-upgrade -y && \
    apt-get install chromium-browser -y

COPY jobs/local.conf /etc/fonts/local.conf

RUN mkdir -p /usr/src/app 

WORKDIR /usr/src/app

COPY jobs/package.json .
COPY jobs/index.js .

RUN npm install --only=production

CMD ["npm", "start"]

# monero-backend
FROM node:16 AS monero-backend

WORKDIR /opt

COPY backend/package.json .
COPY backend/index.js .

RUN npm install --only=production

CMD ["npm", "start"]

# monero-frontend
FROM nginx:1.19.8 AS monero-frontend

WORKDIR /opt 

COPY frontend/entrypoint.sh .
RUN chmod +x entrypoint.sh

WORKDIR /var/www/html
COPY frontend .

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["/opt/entrypoint.sh"]
