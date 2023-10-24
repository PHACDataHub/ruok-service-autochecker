// fs docs node https://nodejs.org/docs/v0.3.4/api/fs.html
import * as fs from 'fs'
import { CheckOnClonedRepoStrategy } from './check-on-cloned-repo-strategy.js'


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

export async function hasSecurityMd(clonedRepoPath) {
    const securityMds = searchForFile(clonedRepoPath, "SECURITY.md")
    if (securityMds.length > 0) {
        return true
    } else {
        return false
    }
}

export class HasSecurityMd extends CheckOnClonedRepoStrategy {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const securityMdFound = await hasSecurityMd(this.clonedRepoPath)
        console.log(
            `hasSecurityMd: ${securityMdFound }`
        )
        return {'hasSecurityMd':securityMdFound}
    }
    checkName() {
        this.checkName = 'hasSecurityMd'
        console.log(`checkName is ${this.checkName}`)
        return this.checkName
    }
}

