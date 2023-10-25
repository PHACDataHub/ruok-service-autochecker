import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { searchForFile } from './searching-functions.js';

// TODO add path to metadata/ filename

export class HasSecurityMd extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const securityMdFound = await searchForFile(this.clonedRepoPath, "SECURITY") // Removed .md to search for .txt etc as well
        return {
            checkPasses: (securityMdFound?.length ?? 0) > 0,
            metadata: null,
            lastUpdated: Date.now()
        }
    }

}

