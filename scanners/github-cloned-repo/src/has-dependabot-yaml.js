import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
// import { searchForFile } from './searching-functions.js'
import { glob } from 'glob'

export async function hasDependabotYaml(clonedRepoPath) {
    // searchForFile returns array of found file paths
    const dependabotFile = glob.sync(path.join(clonedRepoPath, '**', 'dependabot.y*')); // accounting for both .yaml and .yml
    
    return dependabotFile.length > 0;
} 

export class HasDependabotYaml extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const hasDependabotYamlResult = await hasDependabotYaml(this.clonedRepoPath);
        return {
            checkPasses: hasDependabotYamlResult,
            metadata: null,
            // lastUpdated: Date.now()
        }
    }
}