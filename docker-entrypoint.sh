#!/bin/bash
set -e
# Raise ulimit
echo '1: Before ulimit'
ulimit -n
ulimit -n 32768 65536
echo $?
ulimit -n
echo $?
echo '2. After ulimit'
echo $?
# Temp file
TFILE=`mktemp --tmpdir tfile.XXXXX`
trap "rm -f $TFILE" 0 1 2 3 15
## Sed of parameters in siege configuration file
sed 's/HTTP_AUTH/'"$HTTP_AUTH"'/g' "$SIEGE_CONF" > "$TFILE"
cat "$TFILE" > "$SIEGE_CONF"
exec "$@"
