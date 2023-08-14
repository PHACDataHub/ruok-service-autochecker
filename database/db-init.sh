#!/bin/bash

ARANGO_DB_NAME="dataServices"
ARANGO_DB_USER="root"
ARANGO_DB_PASSWORD="yourpassword"

/usr/bin/arangosh \
--server.endpoint=unix:///tmp/arangodb-tmp.sock \
--server.password ${ARANGO_ROOT_PASSWORD} \
--javascript.execute-string "db._createDatabase('${ARANGO_DB_NAME}', [{username: '${ARANGO_DB_USER}', password: '${ARANGO_DB_PASSWORD}'}]);"

# # # ---- Start up ArangoDB container
# # docker run -e ARANGO_ROOT_PASSWORD=yourpassword -p 8529:8529 -d --name arangodb arangodb

# # Install curl
# apk --no-cache add curl

# # Wait for ArangoDB to be ready
# echo "Waiting for ArangoDB to be ready..."
# while ! curl -u root:yourpassword -s http://localhost:8529/_admin/echo; do
#     sleep 1
# done
# echo "ArangoDB is ready."

# # ----- Create database
# echo ""
# # db._createDatabase(${ARANGO_DB_NAME}

# echo "Creating 'dataServices' database"
# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data '{"name": "dataServices", "createCollection": true }' \
#      --dump - http://localhost:8529/_api/database

# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data '{"name": "dataServices", "createCollection": true }' \
#      --dump - http://localhost:8529/_api/database
     
# # echo ""
# # echo "reading all databases"
# # curl -u root:yourpassword  --header 'accept: application/json' --dump - http://localhost:8529/_api/database

# # ---- Create collection 
# echo ""
# echo "Creating a 'dataServicesCollection' collection"
# echo ""
# # in _system db (which only seem to be able to access with AQL in API at the moment)
# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data '{"name": "dataServicesCollection"}' \
#      --dump - http://localhost:8529/_api/collection

# # in the dataService database that we home to use
# curl -u root:yourpassword -X POST --header 'accept: application/json' \
#      --data '{"name": "dataServicesCollection"}' \
#      --dump - http://localhost:8529/_db/dataServices/_api/collection


# # echo ""
# # echo "Finding new collection"
# # curl -u root:yourpassword --header 'accept: application/json' http://localhost:8529/_api/collection > response.json
# # jq '.result[] | select(.name == "services")' response.json

# # # curl -u root:yourpassword -X POST --header 'accept: application/json' --data-binary @- --dump - http://localhost:8529/_api/document/products <<EOF
# # # { 1: "World" } EOF

# # curl -u root:yourpassword -X POST --header 'accept: application/json' \
# #      --data-binary '{"1": "World"}' \
# #      --dump - http://localhost:8529/_db/dataServices/_api/document/dataServicesCollection

# # curl -u root:yourpassword -X POST --header 'accept: application/json' \
# #      --data-binary '{
# #        "query": "INSERT { _key: @key, value: @value } INTO dataServicesCollection",
# #        "bindVars": { "key": "2", "value": "World" }
# #      }' \
# #      --dump - http://localhost:8529/_db/dataServices/_api/cursor

# echo "Database initialization complete."