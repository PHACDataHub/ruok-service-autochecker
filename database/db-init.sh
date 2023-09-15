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
echo "Creating a 'dataServicesCollection' collection in a 'dataServices' database"
echo ""


curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data '{"name": "dataServicesCollection"}' \
     --dump - http://0.0.0.0:8529/_db/dataServices/_api/collection

echo ""
echo "Creating a 'projects' collection in a 'dataServices' database"
echo ""

curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data '{"name": "projects"}' \
     --dump - http://0.0.0.0:8529/_db/dataServices/_api/collection

echo ""
echo "Creating a 'services' collection in a 'dataServices' database"
echo ""

curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data '{"name": "services"}' \
     --dump - http://0.0.0.0:8529/_db/dataServices/_api/collection


# ---- Create documents
echo ""
echo "Creating sample projects - note records not confirmed - just using as an example!"
echo ""

curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data-binary '{"projectName": "HoPiC","projectOwnerDivisionAcronym": "DS","serviceURLs": ["https://hopic-sdpac.phac-aspc.alpha.canada.ca/"],"gitHubRepository": "https://github.com/PHACDataHub/cpho-phase2", "internalTool": true}' \
     --dump - http://localhost:8529/_db/dataServices/_api/document/dataServicesCollection

curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data-binary '{ "projectName": "epicenter", "projectOwnerDivisionAcronym": "DSCO","serviceURLs": ["https://time-deno.garden.dl.phac.alpha.canada.ca/"],"gitHubRepository": "https://github.com/PHACDataHub/phac-epi-garden", "internalTool": true}' \
     --dump - http://localhost:8529/_db/dataServices/_api/document/dataServicesCollection

curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data-binary '{ "projectName": "data-catalog", "projectOwnerDivisionAcronym": "DS", "serviceURLs": ["https://time-deno.garden.dl.phac.alpha.canada.ca/"], "gitHubRepository": "https://github.com/PHACDataHub/data-catalog", "internalTool": true}' \
     --dump - http://localhost:8529/_db/dataServices/_api/document/dataServicesCollection

echo ""
echo "Database initialization complete."
echo ""
