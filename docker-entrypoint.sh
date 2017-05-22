#!/bin/bash
set -e
sed -i 's/HTTP_AUTH/'"$HTTP_AUTH"'/g' ~/.siege/siege.conf
exec "$@"
