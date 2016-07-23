FROM node:4.4

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.10.5

ENV HOME=/home/app
USER app
WORKDIR $HOME/bench
