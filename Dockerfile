FROM node:7.2.1

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.10.8 &&\
  apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Run latest siege
RUN wget http://download.joedog.org/siege/siege-latest.tar.gz && \
  tar zxvf siege-latest.tar.gz && \
  cd siege-*/ && \
  ./configure --with-ssl && \
  make && \
  make install

ENV HOME=/home/app
#COPY package.json npm-shrinkwrap.json $HOME/bench/
COPY package.json $HOME/bench/
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
CMD ["node", "src/stacktical.js"]
