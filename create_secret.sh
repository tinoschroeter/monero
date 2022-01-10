#!/bin/bash

if [ ! -z "$1" ] && [ ! -z "$2" ] && [ ! -z "$3" ]; then

  name=$(echo $1 | tr '[:upper:]' '[:lower:]')
  cat <<EOF | kubectl apply -f -
  apiVersion: v1
  kind: Secret
  metadata:
    name: $name
  type: Opaque
  data:
    $2: $(echo -n $3 | base64 -w0)
EOF

else 
  echo "$0 secret_name name P@ssw0rd"
fi
