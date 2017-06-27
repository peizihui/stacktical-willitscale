#!/bin/bash
set -e
sed -i 's/HTTP_AUTH/'"$HTTP_AUTH"'/g' $HOME/.siege/siege.conf
exec "$@"
