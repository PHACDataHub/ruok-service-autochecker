## Database - ArangoDB

## Update - using docker compose 
From root of project
```
docker compose up -d && ./database/db-init.sh
```
To Tear down 
```
docker compose down -v
```

TODO - change folder to migrations, and modify script to check if db/ collections already exist. 

Using [dockerized ArangoDB](https://hub.docker.com/_/arangodb) for this and this is an initial first pass to get this up and running. Chosing ArangoDB as we plan to look at relationships in the future and this works well with GraphQL.
### If want to run independently, start up and create db and collection, 

```
docker run -e ARANGO_ROOT_PASSWORD=yourpassword -p 8529:8529 -d --name arangodb arangodb
```
and create collection through UI or with commands in script. 
```
./db-init.sh
```

### To stop and remove container
```
docker stop arangodb
docker rm arangodb
```

### Create a document
```
curl -u root:yourpassword -X POST --header 'accept: application/json' --data-binary @- --dump - http://localhost:8529/_api/document/dataServicesCollection <<EOF
{ "Hello2": "World2" }
EOF
```
Or run API and use graphiql