# Scanners

Highly based on <https://github.com/canada-ca/tracker>

Each of these 'scanners' are a contained running service with their own dependcies.  They will eventually each have their own dockerfile, and be deployed with Kubernetes, but in the meantime, each service will need to be launched separately.  To do that, change directory into that scanner service then:

## To Run Individually

```bash
npm start
```

## To Test

```bash
npm t
```

## GitHub Scanners

### github-cloned-repo-checks

When this recieves a NATs payload on the GitHubEvents subject, it will clone the repository and perform checks that look at the directories, files and within the files. 

### github-octokit-checks

Also listens to NATs GitHubEvents, and when it recieves a message, it will use GitHub's octokit API to inquire about things like branch protection, as well as collecting details about the repository.

## Original list of checks

* [ ] SLOs established
* [ ] Uptime tracking
* [ ] Are there tests? Is coverage enabled? (only have existance of test directory now- will use langagues to dig into libraries and languagues)
* [x] Does the project contain a LICENSE file
* [ ] DNS takeovers
* [ ] Subdomain takeovers
* [x] Does the .gitignore file ignore files with credentials? ie: includes **/*.env
* [x] Does the .dockerignore files ignore files with credentials? ie: includes **/*.env
* [ ] Is Secret scanning enabled for that repo?
* [x] Is there a security.md file?
* [ ] existence of an API (only have directory now - will use langagues to dig into libraries and languagues)
* [ ] REST/graphql (see above)
* [ ] vuln scanning enabled (only see dependabot.yml now... but seems like you can have without this)
* [ ] More from Open data products spec: <https://opendataproducts.org/>
* [ ] PHAC data standards (also see <https://www.dublincore.org>)

### Other checks that we have now (note - some not-so-useful-yet ones will be fed into more useful checks later)

* [x] has dependabot.yml or yml

* [x] main and all programming langagues (to be used for more later)
* [x] main branch name (for main branch protection)
* [x] has test directory
* [x] has API directory

#### References

* <https://jestjs.io/docs/mock-function-api>

If alpha.canada.ca - consider reviewing <https://alpha.canada.ca/en/instructions.html>

* a “nofollow” meta tag or robots.txt file to prevent indexing by search engines (this probably fits better into the github scanner)
* an “alpha” banner to indicate to users that it is a prototype service
* a feedback or issue-reporting method (either email address, web form, or public issue tracker)

These are interesting resources that might be of use

* <https://github.com/cds-snc/status-statut>
* <https://github.com/cds-snc/scan-websites>
