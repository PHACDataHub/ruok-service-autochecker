import { HasApiDirectory, hasDependabotYaml } from './has-api-directory.js'
import { HasDependabotYaml } from './has-dependabot-yaml.js'
import { HasTestsDirectory } from './has-tests-directory.js'
import { HasSecurityMd } from "./has-security-md.js"
import { DotDockerIgnoreDetails, DotGitIgnoreDetails }  from "./get-dotignore-details.js"
import { CheckOnClonedRepoStrategy } from './check-on-cloned-repo-strategy.js'


export class AllChecks extends CheckOnClonedRepoStrategy {
    constructor(repoName, clonedRepoPath) {
      super(repoName, clonedRepoPath);
      this.clonedRepoPath = clonedRepoPath;
      this.repoName = repoName
      this.checkers = [
        new HasApiDirectory(repoName, clonedRepoPath),
        new HasDependabotYaml(repoName, clonedRepoPath),
        new HasTestsDirectory(repoName, clonedRepoPath),
        new HasSecurityMd(repoName, clonedRepoPath),
        new DotDockerIgnoreDetails(repoName, clonedRepoPath),
        new DotGitIgnoreDetails(repoName, clonedRepoPath),
      ];
    }
  
    async doRepoCheck() {
      const checkResults = await Promise.all(
        this.checkers.map(async (checker) => {
          const result = await checker.doRepoCheck();
          console.log(`Ran ${checker.checkName()}: ${JSON.stringify(result)}`);
          return result;
        })
      )
  
      const allResults = {
        hasApiDirectory: checkResults[0],
        hasDependabotYaml: checkResults[1],
        hasTestsDirectory: checkResults[2],
        hasSecurityMd: checkResults[3],
        dotDockerIgnoreDetails: checkResults[4],
        dotGitIgnoreDetails: checkResults[5],
      }
  
      return allResults;
    }
  
    checkName() {
      return 'allChecks';
    }
  }
  