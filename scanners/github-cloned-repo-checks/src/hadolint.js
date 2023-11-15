// https://thenewstack.io/hadolint-lint-dockerfiles-from-the-command-line/#:~:text=is%20called%20Hadolint.-,Hadolint%20is%20a%20command%20line%20tool%20that%20helps%20you%20ensure,tool)%20to%20lint%20the%20code.

// Hadolint looks for built in rules https://github.com/hadolint/hadolint#rules
// And suggests best practices https://docs.docker.com/develop/develop-images/dockerfile_best-practices/

import { spawn } from 'child_process';
import { once } from 'events';
import path from 'path';
import {  searchForFile } from './searching-functions.js'
import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'


async function runHadolint(dockerfilePath) {
    try {
        const hadolintProcess = spawn('hadolint', [dockerfilePath, '--no-fail', '--format', 'json'])

        let stdoutData = '';
        let stderrData = '';
    
        hadolintProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
          });
    
        hadolintProcess.stderr.on('data', (data) => {
          stderrData += data.toString();
          console.log(stderrData)
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
    const dockerfilePaths = searchForFile(clonedRepoPath, 'Dockerfile');
    const results = {};
  
    for (const dockerfilePath of dockerfilePaths) {
      const relativePath = path.relative(clonedRepoPath, dockerfilePath);
      const hadolintResult = await runHadolint(dockerfilePath);
      results[relativePath] = hadolintResult;
    }
  
    // if no Dockerfiles found
    if (dockerfilePaths.length === 0) {
      results['noDockerfiles'] = {
        checkPasses: null,
        metadata: {
          dockerfiles: [],
        },
      };
    }
  
    return results;
  }

async function checkLevels(results, maxLevel) {
    for (const dockerfilePath in results) {
        const dockerfileResults = results[dockerfilePath];
        for (const result of dockerfileResults) {
            if (result.level !== 'info' && compareLevels(result.level, maxLevel) > 0) {
                return false; // Set checkPasses to false if a higher level is found
            }
        }
    }
    return true; // Set checkPasses to true if no higher levels are found
}

function compareLevels(level1, level2) {
    const levels = ['info', 'warning', 'error'];
    return levels.indexOf(level1) - levels.indexOf(level2);
}

const clonedRepoPath = '/tmp/ruok-service-autochecker-1700076813912'
const results = await hadolintRepo(clonedRepoPath)
const isLevelInfoOrBelow = await checkLevels(results, 'info')
console.log(results)
console.log(isLevelInfoOrBelow)


export class Hadolint extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) {
        super(repoName, clonedRepoPath);
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName;
    }

    async doRepoCheck() {
        try {
            const hadolintResult = await hadolintRepo(this.clonedRepoPath);

            // determine if warning or level
            const maxLevel = 'warning';
            const checkPasses = false;

            console.log({
                checkPasses: checkPasses,
                metadata: hadolintResult,
            });

            return {
                checkPasses: checkPasses,
                metadata: hadolintResult,
            };
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

