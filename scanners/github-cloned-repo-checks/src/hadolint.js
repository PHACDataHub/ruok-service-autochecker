// https://thenewstack.io/hadolint-lint-dockerfiles-from-the-command-line/#:~:text=is%20called%20Hadolint.-,Hadolint%20is%20a%20command%20line%20tool%20that%20helps%20you%20ensure,tool)%20to%20lint%20the%20code.

// Hadolint looks for built in rules https://github.com/hadolint/hadolint#rules
// And suggests best practices https://docs.docker.com/develop/develop-images/dockerfile_best-practices/

import { spawn } from 'child_process';
import { once } from 'events';
import path from 'path';
import { glob } from 'glob'
import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'


async function runHadolintOnDockerfile(dockerfilePath) {
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
          console.log('stderrData', stderrData)
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

async function hadolintRepo(clonedRepoPath) {
  // For each Dockerfile in Repo, runs hadolint and consolidates results 
    const dockerfilePaths = glob.sync(path.join(clonedRepoPath, '**', '*Dockerfile*'));
    // let results = {};
    let results = [];
  
    for (const dockerfilePath of dockerfilePaths) {
      const relativePath = path.relative(clonedRepoPath, dockerfilePath);
      const hadolintResult = await runHadolintOnDockerfile(dockerfilePath);
      // results[relativePath] = hadolintResult;
      results.push({
        Dockerfile: relativePath,
        RulesViolated: hadolintResult,
    });
    }

    return results;
}

function areAllArraysEmpty(obj) {
  for (const key in obj) {
    if (obj[key] instanceof Array && obj[key].length > 0) {
      return false; // If any array is not empty, return false
    }
  }
  return true; e
}

// // const clonedRepoPath = '/tmp/ruok-service-autochecker-1701808283929'
// // const clonedRepoPath ='../../test-repo/ruok-service-autochecker'
// const clonedRepoPath = '../../test-repo/django-htmx-autocomplete'
// const results = await hadolintRepo(clonedRepoPath)
// console.log(results)

// const ifempty = areAllArraysEmpty(results)
// console.log(ifempty)

// const isEmpty = isObjectEmpty(results);

// console.log('Is the object empty?', isEmpty);
// // (isObjectEmpty(hadolintResult)


export class Hadolint extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) {
        super(repoName, clonedRepoPath);
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName;
    }

    async doRepoCheck() {
        try {
            const hadolintResult = await hadolintRepo(this.clonedRepoPath);
            let areResults = areAllArraysEmpty(hadolintResult) // Will result in true if no dockerfiles and if no warnings or errors from linting. 

            if (Object.keys(hadolintResult).length === 0){ // In the case of no Dockerfiles in repo
              areResults = null
            }
      
            return {
              checkPasses: areResults,
              metadata: hadolintResult
            }

        } catch (error) {
            console.error(error.message);
            // Handle the error as needed
            return {
                checkPasses: null,
                metadata: {
                errorMessage: 'An unexpected error occurred.',
                },
            };
        }
    }
}