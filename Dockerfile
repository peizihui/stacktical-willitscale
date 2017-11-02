FROM node:6-slim

RUN useradd --user-group --create-home --shell /bin/false stacktical

RUN apt-get update && apt-get install -y \
  build-essential \
  libssl-dev \
  git \
&& rm -rf /var/lib/apt/lists/*

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
