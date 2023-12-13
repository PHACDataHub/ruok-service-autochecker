import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { searchForDirectory } from './searching-functions.js'

// TODO - maybe include api dir path in metadata
// TODO - look at searching for api libraries and patterns, determine if REST vs graphQL vs...
 
export async function hasApiDirectory(directory) {
    const apiDirectories = searchForDirectory (directory, "api")
    if (apiDirectories.length > 0) {
        return true
    } else {
        return false
    }
} 


export class HasApiDirectory extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const hasApiDirectoryResult = await hasApiDirectory(this.clonedRepoPath);
        return {
            checkPasses: hasApiDirectoryResult,
            metadata: null,
            lastUpdated: Date.now()
        }
    }
}