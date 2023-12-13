import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { searchForFile } from './searching-functions.js'

export async function hasDependabotYaml(clonedRepoPath) {
    // searchForFile returns array of found file paths
    const dependabotFile = searchForFile(clonedRepoPath, "dependabot.y") // accounting for both .yaml and .yml
    if (dependabotFile.length > 0) {
        return true
    } else {
        return false
    }
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
            lastUpdated: Date.now()
        }
    }
}