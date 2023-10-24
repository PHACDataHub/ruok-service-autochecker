## Checks on Cloned Repo
* Note removing timestamp in future 

1) Recieves payload from webhook service (subscribed to NATs message 'GitHubEvent').
2) Clones Repository
3) Performs scans
4) Saves to Database (API)
5) Removes Cloned Repository

Results:
* HasApiDirectory: passes if an 'api' directory exists at root of project. No metadata
    * Note - this is a first level search - will pull in langauges to find libraries/ determine if REST or GraphQL
* Has DependabotYaml: passes if dependabot.y* (either dependabot.yaml or dependabot.yml) is in the repo.
    * Note - dependabot can be enabled without having such file - and accounted for in octokit checks
* HasSecurityMd: passes if Security.md file is in the repo root (note will need to modify to search for .txt as well)
* dotDockerIgnoreDetails: passes if one exists.  Metadata includes dockerignore path(s) and what variation of .env is included in each.
* dotGitIgnoreDetails: passes if one exists.  Metadata includes dockerignore path(s) and what variation of .env is included in each.

#### * TODO - rename dotGitIgnoreDetails and dotDockerIgnoreDetails


#### Sample results
{"hasApiDirectory":{"checkPasses":true,"metadata":null,"lastUpdated":1698174245826},"hasDependabotYaml":{"checkPasses":false,"metadata":null,"lastUpdated":1698174245826},"hasTestsDirectory":{"checkPasses":true,"metadata":{"testDirectoryPaths":["api/src/__tests__","scanners/github-clone-repo/src/__tests__","scanners/github-cloned-repo-checks/src/__tests__","scanners/github-octokit-checks/src/__tests__"]},"lastUpdated":1698174245826},"hasSecurityMd":{"checkPasses":true,"metadata":null,"lastUpdated":1698174245826},"dotDockerIgnoreDetails":{"checkPasses":false,"metadata":null,"lastUpdated":1698174245826},"dotGitIgnoreDetails":{"checkPasses":true,"metadata":{"gitIgnoreFiles":[{"ignoreFilePath":".gitignore","hasDotenv":true,"hasDoubleStarSlashStarDotenv":true,"hasDoubleStarSlashDotenvStar":false}]},"lastUpdated":1698174245828}} 
