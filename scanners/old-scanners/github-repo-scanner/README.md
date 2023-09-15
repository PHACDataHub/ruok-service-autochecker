## GitHub Scanner

Using Octokit API to interact with GitHub, as well as to clone the repo and scan locally to remain under the request quota.  

1. Create a GitHub token and add to .env file
### To Run:

``` 
npm start 
``` 

### To Test
```
npm test
```

#### References:
* https://octokit.github.io/rest.js/v20

* https://docs.github.com/es/rest?apiVersion=2022-11-28

* https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-languages

* endpoints allowed for fine grained access token:
https://docs.github.com/en/rest/overview/endpoints-available-for-fine-grained-personal-access-tokens?apiVersion=2022-11-28

* [list all repositorys](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-organization-repositories) (compare to exisitng list...)
* https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#check-if-vulnerability-alerts-are-enabled-for-a-repository
* [enable vunerability alerts](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#enable-vulnerability-alerts)
* [secret scanning](https://docs.github.com/en/rest/secret-scanning/secret-scanning?apiVersion=2022-11-28)
* [Dependabot](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2022-11-28)






