## Scanners

Highly based on https://github.com/canada-ca/tracker

Each of these 'scanners' are a contained running service with their own dependcies.  They will eventually each have their own dockerfile, and be deployed with Kubernetes, but in the meantime, each service will need to be launched separately.  To do that, change directory into that scanner service then:
### To Run
```
npm start
```
### To Test
```
npm t
```

docker-compose -f docker-compose-scanners.yaml up --build

Currently splitting out the functions from the monolithic function created in the old-scanners/github-scanner into smaller, self contained functions. These all communicate using [NATs.io](https://nats.io/) which is a lightweight, cloud-native messaging system designed for distributed systems. 

The following diagram shows the inital nats message flow through these services ( [nats-message-flow-diagram](../diagram-nats-message-flow/))
('\<sN\>' refers to serviceName - which is the unique key derived from project name, with spaces and special characters removed.  serviceName is passed as the last NATs subject token (after the last '.') and is extracted from the subject by downstream services to be used for processing. 
![image info](../diagram-nats-message-flow/nats-message-flow.png)

### Kick off
* *Service discovery* - this will likely become a scheduled job.  This is the entrypoint.  Service Discovery clones the DNS GitHub repository and extracts the metadata annotations, as well as the specName for domain from the dns records. It uses the project Name with the with spaces/ special characters removed, as the serviceName, which is also now the database key for the service. These records are consloidated, saved in the database 'services' collection and passed to Endpoint dispatcher.   

* *Endpoint Dispatcher* parses and verifies the endpoints, then fires the endpoint to the appropriate NATs subject - where the associated checkers are listening. 

* Suffixed by '-check'* performs the scan or check

* Some checks will trigger additional checks, or will be consolidated with other checks.  For instance, we're collecting programming languages used for each service, which can be used to search for particular API librabies to determine type of API used, or specific testing dependencies being used, and further search for patterns in the code, or to look for certain security considerations for that langauge and dependency.  

* There are other services that assist with the checks rather than perform the actual check, such as, github-clone-repo, which clones the services' GitHub respository to be able to more easily scan the files and directories.  github-octokit-repo-details returns a large result, which other check services will individually parse out. These are included here under scanners regardless.

* *Done Collector* contains a set of checks that needs to be performed for an endpoint for a particular service.  As each check comes in, it's added to the result. Once the done collector receives 'checked' payloads from all of the checks from the set, the result is sent on to saveToDatabase

* *Save to Database* upserts the service record with the newly checked information for that endpoint into the database.
TODO - does this make more sense to split out in to endpoint collections?


### Original list of checks 
- [ ] SLOs established
- [ ] Uptime tracking
- [ ] Are there tests? Is coverage enabled? (only have existance of test directory now- will use langagues to dig into libraries and languagues)
- [x] Does the project contain a LICENSE file
- [ ] DNS takeovers
- [ ] Subdomain takeovers 
- [x] Does the .gitignore file ignore files with credentials? ie: includes **/*.env 
- [x] Does the .dockerignore files ignore files with credentials? ie: includes **/*.env 
- [ ] Is Secret scanning enabled for that repo?
- [x] Is there a security.md file?
- [ ] existence of an API (only have directory now - will use langagues to dig into libraries and languagues)
- [ ] REST/graphql (see above)
- [ ] vuln scanning enabled (only see dependabot.yml now... but seems like you can have without this)
- [ ] More from Open data products spec: https://opendataproducts.org/
- [ ] PHAC data standards (also see https://www.dublincore.org)

### Other checks that we have now (note - some not-so-useful-yet ones will be fed into more useful checks later)
- [x] has dependabot.yml or yml
- [x] main and all programming langagues (to be used for more later)
- [x] main branch name (for main branch protection)
- [x] has test directory
- [x] has API directory

#### References:
* https://jestjs.io/docs/mock-function-api

If alpha.canada.ca - consider reviewing https://alpha.canada.ca/en/instructions.html 
* a “nofollow” meta tag or robots.txt file to prevent indexing by search engines (this probably fits better into the github scanner)
* an “alpha” banner to indicate to users that it is a prototype service
* a feedback or issue-reporting method (either email address, web form, or public issue tracker)

These are interesting resources that might be of use 
* https://github.com/cds-snc/status-statut
* https://github.com/cds-snc/scan-websites


 



