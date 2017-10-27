FROM node:6

RUN useradd --user-group --create-home --shell /bin/false stacktical

RUN apt-get update && \
  apt-get install build-essential libssl-dev git -y

RUN git clone https://github.com/wg/wrk.git wrk && \
  cd wrk && \
  make && \
  cp wrk /usr/local/bin

ENV HOME=/home/stacktical

COPY . /$HOME/willitscale

RUN chown -R stacktical:stacktical $HOME/*

USER stacktical

WORKDIR $HOME/willitscale

RUN npm install && \
  npm cache clean

CMD ["node", "src/stacktical.js"]
