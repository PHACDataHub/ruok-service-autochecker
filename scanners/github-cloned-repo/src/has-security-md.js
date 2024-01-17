import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { glob } from 'glob'
import path from 'path';

export class HasSecurityMd extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const securityMdFound = glob.sync(path.join(this.clonedRepoPath, '**', 'security*.{md,txt,rtf}'), { nocase: true }); // will match md or txt ext, case insensitive
        // const securityMdFound = await searchForFile(this.clonedRepoPath, "SECURITY") // Removed .md to search for .txt etc as well, glob is case insensitive
        return {
            checkPasses: (securityMdFound?.length ?? 0) > 0,
            metadata: null,
            // lastUpdated: Date.now()
        }
    }

}

