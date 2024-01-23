// https://thenewstack.io/hadolint-lint-dockerfiles-from-the-command-line/#:~:text=is%20called%20Hadolint.-,Hadolint%20is%20a%20command%20line%20tool%20that%20helps%20you%20ensure,tool)%20to%20lint%20the%20code.

// Hadolint looks for built in rules https://github.com/hadolint/hadolint#rules
// And suggests best practices https://docs.docker.com/develop/develop-images/dockerfile_best-practices/

import { spawn } from 'child_process';
import { once } from 'events';
import path from 'path';
import { glob } from 'glob'
import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'


export async function runHadolintOnDockerfile(dockerfilePath) {
  // lints a particular Dockerfile
    try {
        const hadolintProcess = spawn('hadolint', [dockerfilePath, '--no-fail', '--format', 'json'])

        let stdoutData = '';
        let stderrData = '';
    
        hadolintProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
          });
    
        hadolintProcess.stderr.on('data', (data) => {
          stderrData += data.toString();
          // console.log('stderrData', stderrData)
        });

        const [code] = await once(hadolintProcess, 'close');

        // Get details from the report output as JSON, then filter out extra fields
        const hadolintJson = JSON.parse(stdoutData);
        const filteredResults = hadolintJson.map(({ code, level, line, message }) => ({
            code,
            level,
            line,
            message,
          }));
        return(filteredResults)

      } catch (error) {
        console.error(error.message);
    }
}

export async function hadolintRepo(clonedRepoPath) {
  // For each Dockerfile in Repo, runs hadolint and consolidates results 
    const dockerfilePaths = glob.sync(path.join(clonedRepoPath, '**', '*dockerfile*'), { nocase: true });

    let results = []; 
  
    for (const dockerfilePath of dockerfilePaths) {
      const relativePath = path.relative(clonedRepoPath, dockerfilePath);
      const hadolintResult = await runHadolintOnDockerfile(dockerfilePath);
      // results[relativePath] = hadolintResult;
      results.push({
        dockerfile: relativePath,
        rules_violated: hadolintResult,
      });
    }

    return results;
}


function anyArrayNonEmpty(obj) {
  // If no rules violated for hadolint scan, ruleViolated will be empty
  for (const entry of obj) {
    if (entry.rules_violated && entry.rules_violated.length > 0) {
      return true; // If any rules_violated array is non-empty, return true
    }
  }
  return false; // Return false only if all rules_violated arrays are empty
}


export class Hadolint extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) {
        super(repoName, clonedRepoPath);
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName;
    }

    async doRepoCheck() {
        try {
            const hadolintResult = await hadolintRepo(this.clonedRepoPath);
            let areResults = !anyArrayNonEmpty(hadolintResult) // areResults will result in true if there are dockerfiles and if no warnings or errors from linting.

            if (Object.keys(hadolintResult).length === 0){ // In the case of no Dockerfiles in repo
              return {
                checkPasses: null,
                metadata: null
              }
            } else {
      
            return {
              checkPasses: areResults,
              metadata: hadolintResult
            }
          }

        } catch (error) {
            console.error(error.message);
            return {
                checkPasses: null,
                metadata: {
                errorMessage: 'An unexpected error occurred with hadolint check.',
                },
            };
        }
    }
}