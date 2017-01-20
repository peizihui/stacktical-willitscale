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
CMD ["node", "src/stacktical.js",  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzNiZWQwOC0wMjM3LTRmY2EtOTc5NC1iZDQ2NzNiMjRiZWUiLCJqdGkiOiI2MGJhMGRhYy1hZWQ3LTRkYzAtODE1Yi04YmU5OTc5ZTcyOTciLCJjbGllbnQiOnsidHlwZSI6ImFwcGxpY2F0aW9uIn0sInNjb3BlcyI6WyJ0ZXN0cyIsInJlcG9ydHMiXX0.tfOdvARi4qpbQVAD9o0R9i61LVXgfJzqDLueoGn78Ks", "bc3bed08-0237-4fca-9794-bd4673b24bee"]
