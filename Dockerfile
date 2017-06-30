FROM node:6.11.0
ENV SIEGE_VER=3.1.3
ENV SIEGE_CONF=/usr/local/etc/siegerc

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
COPY .siege/siege.conf $SIEGE_CONF
COPY . /$HOME/bench/
RUN chown -R app:app $HOME/* && \
    chown -R app:app $SIEGE_CONF

USER app
WORKDIR $HOME/bench
RUN npm install &&\
  npm cache clean


COPY docker-entrypoint.sh  /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/stacktical.js"]
