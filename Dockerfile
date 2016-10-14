FROM node:4.4

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.10.5 &&\
  apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Run latest siege
RUN wget http://download.joedog.org/siege/siege-latest.tar.gz && \
  tar zxvf siege-latest.tar.gz && \
  cd siege-*/ && \
  ./configure --with-ssl && \
  make && \
  make install

ENV HOME=/home/app
COPY package.json npm-shrinkwrap.json $HOME/bench/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/bench 
RUN npm install &&\
  npm cache clean

USER root
COPY . $HOME/bench
RUN chown -R app:app $HOME/*
USER app

# TODO remove apikey argument
CMD ["node", "src/stacktical.js", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.zQiHGS3o2Km9n1p60VXYSxsKa30s2F4XqT9jYdAuHv0"]
