import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { glob } from 'glob'
import path from 'path';

export async function hasDependabotYaml(clonedRepoPath) {
    // search dependabot.yaml or dependabot.yml anywhere in path
    const dependabotFile = glob.sync(path.join(clonedRepoPath, '**', 'dependabot.y*')); 
    // console.log('******************************', dependabotFile)
    // console.log(dependabotFile.length > 0)
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