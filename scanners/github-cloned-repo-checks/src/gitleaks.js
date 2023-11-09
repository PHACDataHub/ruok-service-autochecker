import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { exec } from 'child_process';
import util from 'util';

const execPromisified = util.promisify(exec);

export async function gitleaksScan(clonedRepoPath) {
    return new Promise((resolve, reject) => {
      exec(`gitleaks --path=${clonedRepoPath}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else if (stderr) {
          reject(new Error(stderr));
        } else {
          resolve(stdout);
        }
      });
    });
  }

export class Gitleaks extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const gitleaksResult = await gitleaksScan(this.clonedRepoPath);
        return {
            checkPasses: gitleaksResult ,
            metadata: null,
            // lastUpdated: Date.now()
        }
    }
}