#!/bin/bash

# api - only add if doesn't already exist
if [ -e api/.env ]; then
  echo "The .env file already exists. Exiting."
  exit 1
fi

cat <<EOF > api/.env
PORT=4000
HOST=0.0.0.0
DB_NAME=dataServices
DB_URL="http://database:8529"
DB_USER=root
DB_PASS=yourpassword
EOF

echo "The .env file has been created for api."