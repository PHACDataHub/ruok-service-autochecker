// fs docs node https://nodejs.org/docs/v0.3.4/api/fs.html
import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'
import { CheckOnClonedRepoStrategy } from './check-on-cloned-repo-strategy.js'

// api directory - libraries? - expand into endpoints etc...consume it?

export function searchForFile(directory, targetFileName) {
    // searches directory and returns array of file paths for any found targetFileNames
    const files = fs.readdirSync(directory);
    const foundFilePaths = []
    for (const file of files) {
        const fullPath = `${directory}/${file}`;
        // Determine if it's a file or directory
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const subDirectoryPaths = searchForFile(fullPath, targetFileName);
            foundFilePaths.push(...subDirectoryPaths); 
        } else if (file.includes(targetFileName)) { //changing for part name too like dependabot.y
        // } else if (file === targetFileName) {
            foundFilePaths.push(fullPath); 
        }
    }
    return(foundFilePaths)
}


export async function hasDependabotYaml(clonedRepoPath) {
    // searchForFile returns array of found file paths
    console.log('hasDependabotYaml called with path:', clonedRepoPath);

    const dependabotFile = searchForFile(clonedRepoPath, "dependabot.y") // accounting for both .yaml and .yml
    if (dependabotFile.length > 0) {
        // console.log('****', dependabotFile)
        return true
    } else {
        return false
    }
} 


export class HasDependabotYaml extends CheckOnClonedRepoStrategy {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const hasDependabotYamlResult = await hasDependabotYaml(this.clonedRepoPath);
        console.log(`hasDependabotYamlResult: ${hasDependabotYamlResult}`)
        return {'hasDependabotYaml': hasDependabotYamlResult}
    }
    checkName() {
        this.checkName = 'hasDependabotYaml'
        console.log(`checkName is ${this.checkName}`)
        return this.checkName
    }
}