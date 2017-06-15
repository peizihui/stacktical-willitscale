FROM node:7.2.1
ENV SIEGE_VER=4.0.2

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.10.8 &&\
  apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Compile siege with SSL support
RUN wget http://download.joedog.org/siege/siege-$SIEGE_VER.tar.gz && \
  tar zxvf siege-$SIEGE_VER.tar.gz && \
  cd siege-*/ && \
  ./configure --with-ssl && \
  make && \
  make install

ENV HOME=/home/app
#COPY package.json $HOME/bench/
COPY .siege/siege.conf $HOME/.siege/siege.conf
COPY . /$HOME/bench/
## Why?
RUN chown -R app:app $HOME/* && \
    chown -R app:app $HOME/.siege/

#USER app
WORKDIR $HOME/bench
RUN npm install &&\
  npm cache clean


COPY docker-entrypoint.sh  /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/stacktical.js"]
