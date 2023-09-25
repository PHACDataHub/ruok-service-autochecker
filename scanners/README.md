## Scanners

Highly based on https://github.com/canada-ca/tracker

Currently working on the functionality for the different pieces that will be passed via NATs payload.  (Right now just started on the GitHub piece - pulling out details with the octokit API.)

Initial diagram (see [nats-message-flow-diagram](../nats-message-flow-diagram/)   )
![Alt text](nats-message-flow-diagram)
<img src="../nats-message-flow-diagram//nats-message-flow-diagram.svg">
### In the process of changing this! 
*Service discovery* pulls in metadata from the DNS GitHub repo to determine which services (defined by endpoints) will be scanned, and their associated GitHub or code repos. (TODO - add in container registries too). *NOTE: currently adding annotations to dns metadata - was causing failures, so working from json for now.  These are save in the database 'projects' collection, and kicks off service dispatch.

*Service Dispatch* pulls the projects from the database/ or just from service discovery - unsure what to do with orphaned db records if a service shuts does... and publishes (~ nats pub projects.\<project_db_key\> '{project:\<projectName\>, project_key:_key, github_repo:[], endpoints: [], containers: []})
* Right now this is all done in service discovery 

*GitHub scanning* subscribes to 'projects.\*', pull out various aspects from the code repo using the octokit API (and also cloning repo and querying directly), then publishes results on 'projects.\<project_db_key\>.github'

*GitHub processing* subscribes to 'projects.*github', will perform process and save (upsert?) in database

*Endpoint scanning* will subscribe to 'projects.\*', search for aspects like uptime, DNS take over, then publish on 'projects.\<project_db_key\>.endpoints'

*Endpoint processing* will subscribe to 'projects.*endpoints', similarly, process and save in database

*Container Scanning* will subscribe to 'projects.\*', scan container registries, then publish on 'projects.\<project_db_key\>.containers'

*Container processing* will subscribe to 'projects.\<project_db_key\>.containers'

#### References:
* https://jestjs.io/docs/mock-function-api

## Endpoint Scanner

If alpha.canada.ca - consider reviewing https://alpha.canada.ca/en/instructions.html 
* a “nofollow” meta tag or robots.txt file to prevent indexing by search engines (this probably fits better into the github scanner)
* an “alpha” banner to indicate to users that it is a prototype service
* a feedback or issue-reporting method (either email address, web form, or public issue tracker)

These are interesting resources that might be of use 
* https://github.com/cds-snc/status-statut
* https://github.com/cds-snc/scan-websites

Also:
* DNS takeovers
* Subdomain takeovers
* SLOs established?
* Uptime tracking?
* PHAC data standards - (where do we find these? - there's also this  https://www.dublincore.org/)