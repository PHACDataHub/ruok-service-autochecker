# Checks on Cloned Repo

* Note removing timestamp in future

1) Recieves payload from webhook service (subscribed to NATs message 'GitHubEvent').
2) Clones Repository
3) Performs scans
4) Saves to Database (API)
5) Removes Cloned Repository

## Checks

### hasApiDirectory

Check passes if an 'api' directory exists at root of project. No metadata

* Note - this is a first level search - will eventually pull in langauges to find libraries/ determine if REST or GraphQL.

#### Sample HasApiDirectory

```Bash
"hasApiDirectory":{"checkPasses":true,"metadata":null,"lastUpdated":1698174245826}
```

### hasDependabotYaml

Check passes if dependabot.y* (either dependabot.yaml or dependabot.yml) is in the repo.

* Note - dependabot can be enabled without having such file - and is accounted for in the octokit checks.

#### Sample dependabotYaml

```Bash
"hasDependabotYaml":{"checkPasses":false,"metadata":null,"lastUpdated":1698174245826}
```

### hasSecurityMd

Check passes if a Security (can have any extension) file is in the root of the repository.

#### Sample hasSecurityMd

```Bash
"hasSecurityMd":{"checkPasses":true,"metadata":null,"lastUpdated":1698174245826}
```

### dotDockerIgnoreDetails

Check passes if one exists.  Metadata includes dockerignore path(s) and what variation of .env is included in each.

#### Sample dotDockerIgnoreDetails

```Bash
"dotDockerIgnoreDetails":{"checkPasses":false,"metadata":null,"lastUpdated":1698174245826}
```

### dotGitIgnoreDetails

Check passes if a .gitignore exists in the repository.  Metadata includes dockerignore path(s) and what variation of .env is included in each.

#### Sample dotGitIgnoreDetails

```Bash
"dotGitIgnoreDetails":{"checkPasses":true,"metadata":{"gitIgnoreFiles":[{"ignoreFilePath":".gitignore","hasDotenv":true,"hasDoubleStarSlashStarDotenv":true,"hasDoubleStarSlashDotenvStar":false}]},"lastUpdated":1698174245828}
```

*TODO - rename dotGitIgnoreDetails and dotDockerIgnoreDetails*

