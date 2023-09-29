# RUOK Service Scanner - AKA Observatory

Automatically scans existing PHAC (GCP) services to provide visibility on endpoints and standards. 

This crawler pulls service endpoints from the [dns](https://github.com/PHACDataHub/dns/tree/main/dns-records) repo - these endpoints would be, source code repositories (eg. GitHub), container repositories (eg. dockerHub, Artifact Registry), URL endpoints (eg. webapp and it's API), and domains.  It then uses these endpoints to kickoff a series of checks to gather business and security information.  Some examples would be, does this service have an API, does it have GitHub main branch protection enabled, are there unit tests, and is vunerability scanning in place in both the code and container repositories. The plan is to also have this scanner perform uptime checks on these services and send alerts if a service goes down.  

Full list of checks can be found in the [scanners](./scanners) section. 


#### *Please note - this is work in progress* 

This uses [Safe Inputs](https://github.com/PHACDataHub/safe-inputs) and [Tracker](https://github.com/canada-ca/tracker) as a starting point.

## To build and run 
(Only the API, ArangoDB and the NATs server, but *not* the scanners - for the moment.) 
1. Set up api .env file 
```
./scripts/create-api-dotenv.sh
```
2. Run containers for database, Nats server and API
```
docker compose up --build -d && ./database/db-init.sh
```
(db-init.sh populates the database with 'projects' and 'services' collections, as well as some fabricated data in order to enable UI development concurrently.

If there's an error in the creation of this fabricated data, run it a second time and then it should work. TODO - add longer timeout or healthcheck on dockercompose file. 

## To tear down 
```
docker compose down -v
```
## To kick off the scanners
Refer to [scanners/README.md](./scanners/README.md).




