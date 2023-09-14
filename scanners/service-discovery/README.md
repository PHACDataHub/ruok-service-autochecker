## Service Discovery
The plan is to kick off the crawler by scanning the [dns](https://github.com/PHACDataHub/dns) repo, pulling out metadata. 
* Project name
* Source code repository
* APM Id - if there is one
* Service endpoint urls
* Container registries

service-discovery will add these 'projects' to *services* database collection and kick off the scanners, using ProjectName as the key. (for now GitHub Repo scanner, but in also in the future, service health check and security scanner and container scanner.)

The dns repo does not have a complete list, and to test out some of the functionality, using the known-service-list.json to add some of these projects/repos to the scan.  (Note, currently this service is using the dns repo, but the githu-repo-scanner is using the know-service-list for the moment.)
### To Run
```
npm start
```
### To Test
```
npm test
```
TODO:
* Look at data catalog for additional services
* Link remaining dns records to source code repositories 
* move temp-cloned-repo into src

Metadata annotations in dns repo are in the form 

```
  annotations:
    projectName: "<project-name>"
    codeSourceRepository: "<codeSourceRepository>"
    # The following annotations are optional - please comment out or remove lines that are not applicable 
    serviceEndpointUrls: "<comma-separated-list-of-service url endpoints>"
    containerRegistries: "<comma-separated-list-of-container-registries>"
    apmId: <apm-id>
```