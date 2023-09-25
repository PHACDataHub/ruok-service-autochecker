## Scanners

Highly based on https://github.com/canada-ca/tracker

Currently working on the functionality for the different pieces that will be passed via NATs payload.  (Right now just started on the GitHub piece - pulling out details with the octokit API and by cloning and scanning the contents of the repo.)


Initial diagram (see [nats-message-flow-diagram](../diagram-nats-message-flow/))
(note - <sN> is service Name - derived from the project name listed in DNS repo - with spaces/ special characters removed.  It's passed as the last NATs subject token (after the last '.' and is pullout out from this to be used for processing. 
![image info](../diagram-nats-message-flow/nats-message-flow.png)

### In the process of changing this! 
*Service discovery* pulls in metadata from the DNS GitHub repo to determine which services (defined by endpoints) will be scanned, and their associated GitHub or code repos. (TODO - add in container registries too). *NOTE: currently adding annotations to dns metadata - was causing failures, so working from json for now.  These are save in the database 'projects' collection, and kicks off service dispatch.

#### References:
* https://jestjs.io/docs/mock-function-api

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

