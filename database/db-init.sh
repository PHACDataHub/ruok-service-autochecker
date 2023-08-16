#!/bin/sh

ARANGO_DB_NAME="dataServices"
ARANGO_DB_USER="root"
ARANGO_DB_PASSWORD="yourpassword"


# Install curl
if ! command -v curl &> /dev/null; then
    echo "curl is not installed. Installing..."
    apk --no-cache add curl
fi

# docker run -e ARANGO_ROOT_PASSWORD=yourpassword -p 8529:8529 -d --name arangodb arangodb

echo "Waiting for ArangoDB to be ready..."
attempts=0
while [[ $attempts -lt 20 ]]; do
    if curl -u root:yourpassword -s http://0.0.0.0:8529/_admin/echo; then
    #   if curl -u root:yourpassword -s http://localhost:8529/_admin/echo; then
        echo "ArangoDB is ready."
        break
    fi
    sleep 1
    attempts=$(($attempts + 1))
done


# ----- Create database
echo ""
echo "Creating 'dataServices' database"
if curl -u root:yourpassword -X POST --header 'accept: application/json' \
    --data '{"name": "dataServices", "createCollection": true }' \
    --dump - http://0.0.0.0:8529/_api/database; then
    echo "'dataServices' database creation succeeded."
else
    echo "'dataServices' database creation failed."
fi

# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#     --data '{"name": "dataServices", "createCollection": true }' \
#     --dump - http://database:8529/_api/database; 
#     echo "'dataServices' database creation succeeded."


     
# echo ""
# echo "reading all databases"
# curl -u root:yourpassword  --header 'accept: application/json' --dump - http://localhost:8529/_api/database

# ---- Create collection 
echo ""
echo "Creating a 'dataServicesCollection' collection"
echo ""
# in _system db (which only seem to be able to access with AQL in API at the moment)
# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data '{"name": "dataServicesCollection"}' \
#      --dump - http://localhost:8529/_api/collection

curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data '{"name": "dataServicesCollection"}' \
     --dump - http://0.0.0.0:8529/_api/collection

# in the dataService database that we home to use
# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data '{"name": "dataServicesCollection"}' \
#      --dump - http://localhost:8529/_db/dataServices/_api/collection

curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data '{"name": "dataServicesCollection"}' \
     --dump - http://0.0.0.0:8529/_db/dataServices/_api/collection


# echo ""
# echo "Finding new collection"
# curl -u root:yourpassword --header 'accept: application/json' http://localhost:8529/_api/collection > response.json
# jq '.result[] | select(.name == "services")' response.json

# # curl -u root:yourpassword -X POST --header 'accept: application/json' --data-binary @- --dump - http://localhost:8529/_api/document/products <<EOF
# # { 1: "World" } EOF

# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data-binary '{"1": "World"}' \
#      --dump - http://localhost:8529/_db/dataServices/_api/document/dataServicesCollection

# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data-binary '{
#        "query": "INSERT { _key: @key, value: @value } INTO dataServicesCollection",
#        "bindVars": { "key": "2", "value": "World" }
#      }' \
#      --dump - http://localhost:8529/_db/dataServices/_api/cursor

echo "Database initialization complete."

# npm start