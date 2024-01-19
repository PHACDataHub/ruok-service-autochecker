# Scanners

Please see the [docs site, scanners section](https://phacdatahub.github.io/ruok-service-autochecker/scanners/)) for the scanner check details. 
Highly based on <https://github.com/canada-ca/tracker>


## To Run Individually

You will need a running database populated with the ruok database framework, a nats server and api up and running. 

```bash
npm start
```
Then trigger the the scan, the scanner's corresponding NATs message (ie. for github, nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/ruok-service-autochecker\"}" )

## To Test 

(can do without db, api and nats, but will need hadolint, trivy and gitleaks installed (note - they are installed in the dev container).)

```bash
npm t
```

## GitHub Scanners

### github-cloned-repo

When this recieves a NATs payload on the GitHubEvents subject, it will clone the repository and perform checks that look at the directories, files and within the files. 

### github-octokit

Also listens to NATs GitHubEvents, and when it recieves a message, it will use GitHub's octokit API to inquire about things like branch protection, as well as collecting details about the repository.

## Web Endpoint Scanners

### web-endpoint

Accessibility Checks (Puppeteer)

Performs accessibility checks for a given webendpoint. 

## Container Scanners

### container

This is partially done with the github-cloned-repo scan with Trivy - finds vunerabilies within the repo.  Hadolint lints the Dockerfiles.  The hope is to use [Artifact Registries built in vunerability scanner](https://cloud.google.com/artifact-registry/docs/analysis) (will need to be turned on in each project), and have that sent to the the Observatory's security command centre. ([Here](https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-two-ad730e7cf649)) is a tutorial.

## Original list of checks

* [ ] SLOs established
* [ ] Uptime tracking
* [ ] Are there tests? Is coverage enabled? (only have existance of test directory now- will use langagues to dig into libraries and languagues)
* [x] Does the project contain a LICENSE file
* [ ] DNS takeovers
* [ ] Subdomain takeovers
* [x] Does the .gitignore file ignore files with credentials? ie: includes **/*.env
* [x] Does the .dockerignore files ignore files with credentials? ie: includes **/*.env
* [x] Is Secret scanning enabled for that repo?
* [x] Is there a security.md file?
* [ ] existence of an API (only have directory now - will use langagues to dig into libraries and languagues)
* [ ] REST/graphql (see above)
* [x] vuln scanning enabled (only see dependabot.yml now... but seems like you can have without this)
* [ ] More from Open data products spec: <https://opendataproducts.org/>
* [ ] PHAC data standards (also see <https://www.dublincore.org>)



<!-- If alpha.canada.ca - consider reviewing <https://alpha.canada.ca/en/instructions.html>

* a “nofollow” meta tag or robots.txt file to prevent indexing by search engines (this probably fits better into the github scanner)
* an “alpha” banner to indicate to users that it is a prototype service
* a feedback or issue-reporting method (either email address, web form, or public issue tracker) -->

