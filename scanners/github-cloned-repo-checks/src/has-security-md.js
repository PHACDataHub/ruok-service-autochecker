// fs docs node https://nodejs.org/docs/v0.3.4/api/fs.html
import * as fs from 'fs'
import { CheckOnClonedRepoStrategy } from './check-on-cloned-repo-strategy.js'
import { searchForFile } from './searching-functions.js';

// export async function hasSecurityMd(clonedRepoPath) {
//     const securityMds = searchForFile(clonedRepoPath, "SECURITY.md")
//     if (securityMds.length > 0) {
//         return true
//     } else {
//         return false
//     }
// }

export class HasSecurityMd extends CheckOnClonedRepoStrategy {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        // const securityMdFound = await hasSecurityMd(this.clonedRepoPath)
        // return {'hasSecurityMd':securityMdFound}
        return {
            // checkPasses: securityMdFound,
            checkPasses: (searchForFile(this.clonedRepoPath, "SECURITY.md")?.length ?? 0) > 0,
            metadata: null,
            lastUpdated: Date.now()
        }
    }

}

