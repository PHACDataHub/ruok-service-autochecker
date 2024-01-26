import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import * as glob from 'glob';
import path from 'path';

// TODO - maybe include api dir path in metadata
// TODO - look at searching for api libraries and patterns, determine if REST vs graphQL vs...
 

export async function hasApiDirectory(clonedRepoPath) {
    // search api anywhere in path
    // const apiDirectories = glob.sync(path.join(clonedRepoPath, '**', 'api*'), { nocase: true });
    // case insenstive search anywhere for api
    const pattern = path.join(clonedRepoPath, '**', 'api*', '**').replace(/\\/g, '/');
    const apiDirectories = glob.sync(pattern, { nocase: true });

    
    return apiDirectories.length > 0;
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
            metadata: "Note - not a fully flushed out check yet.",
            // lastUpdated: Date.now()
        }
    }
}

