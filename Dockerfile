FROM node:6.11.0
ENV SIEGE_VER=3.1.3
ENV SIEGE_CONF=/usr/local/etc/siegerc

RUN useradd --user-group --create-home --shell /bin/false app

# Compile siege with SSL support
RUN wget http://download.joedog.org/siege/siege-$SIEGE_VER.tar.gz && \
  tar zxvf siege-$SIEGE_VER.tar.gz && \
  cd siege-*/ && \
  ./configure --with-ssl=/usr/local/ssl && \
  make && \
  make install

ENV HOME=/home/app
COPY .siege/siege.conf $SIEGE_CONF
COPY . /$HOME/bench/
RUN chown -R app:app $HOME/* && \
    chown -R app:app $SIEGE_CONF && \
    mkdir $HOME/.siege/ && \
    ln -s  $SIEGE_CONF $HOME/.siege/siege.conf

USER app
WORKDIR $HOME/bench
RUN npm install &&\
  npm cache clean

COPY docker-entrypoint.sh  /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/stacktical.js"]
