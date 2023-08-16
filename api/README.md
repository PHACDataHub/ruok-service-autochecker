## API

Now start up with docker compose up 

Start up ArangoDB
```
docker run -e ARANGO_ROOT_PASSWORD=yourpassword -p 8529:8529 -d --name arangodb arangodb

```
Create a 'dataServices' database
```
curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data '{"name": "dataServices", "createCollection": true }' \
     --dump - http://localhost:8529/_api/database
```

Create a 'dataServicesCollection' (NOTE *should be able to do this on the fly, but not behaving yet so just using _system and creating collection there - to add this to the database created above change last line to  *--dump - http://localhost:8529/_db/dataServices/_api/collection*  
```
curl -u root:yourpassword -X POST --header 'accept: application/json' \
     --data '{"name": "dataServicesCollection"}' \
     --dump - http://localhost:8529/_api/collection

```
<!-- this adds it to the actual db  --dump - http://localhost:8529/_db/dataServices/_api/collection -->
## Installing dependencies

```bash
$ npm install
```

## Running it
Start up nats server [nats.io](https://docs.nats.io/running-a-nats-service/introduction/installation) for cli or use docker [image](https://hub.docker.com/_/nats) with 
``` 
docker pull nats:latest
docker run -p 4222:4222 -ti nats:latest
```
Start API
```bash
$ npm start
```
## Interact with Graphical 
http://0.0.0.0:4000/graphql
and modify mutation in the UI
```
mutation {
  createDataService(serviceName: "testService", domain: "something.alpha.phac.ca") {
    serviceName
    domain
  }
}
```
Log into the ArangoDB UI @ http://localhost:8529 root, yourpassword - choose _system db and view the records 

## To stop and remove container(s)
```
docker stop arangodb
docker stop nats
docker rm arangodb
docker rm nats
```

## TODO
Docker compose with set up

