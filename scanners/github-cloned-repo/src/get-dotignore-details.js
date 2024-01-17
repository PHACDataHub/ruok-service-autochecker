// fs docs node https://nodejs.org/docs/v0.3.4/api/fs.html

import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
// import { searchForFile, hasTextInFile } from './searching-functions.js';
import * as glob from 'glob';
import fs from 'fs';
import util from 'util';

export async function hasTextInFile(filePath, text) {
    // returns true if text found, false if not
    const readFileAsync = util.promisify(fs.readFile);
    const regEx = new RegExp(text);
    const result = [];
  
    try {
        const contents = await readFileAsync(filePath, 'utf8');
        let lines = contents.toString().split("\n");
        lines.forEach(line => {
            if (line && line.search(regEx) >= 0) {
                // console.log('found in file ', filePath);
                result.push(line);
            }
        });
  
        return result.length > 0

    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}


export async function searchIgnoreFile(repoPath, ignoreFileName) {  
    // const ignoreFilePaths = searchForFile(repoPath, ignoreFileName)
    const ignoreFilePaths = glob.sync(`${repoPath}/**/${ignoreFileName}`);

    const ignoreFileDetails = []
    // gitignoreDetails.push({numberOfGitignores: gitignoreFilePaths.length})

    if (ignoreFilePaths.length > 0) {
        for (const filePath of ignoreFilePaths) { //will this address null case?
            const ignoreFilePath = filePath.split('/').slice(3).join('/'); // removing ./temp-cloned-repo/${repo}
            const hasDotenv = await hasTextInFile(filePath, '.env') // temp value for logic  finding just .env in file (any form)
            const hasDoubleStarSlashStarDotenv = await hasTextInFile(filePath, '\\*\\*/\\*.env') // in this case is **/*.env
            const hasDoubleStarSlashDotenvStar = await hasTextInFile(filePath, '\\*\\*/.env.*') // looking for **/.env*
            ignoreFileDetails.push ({
                "ignoreFilePath": ignoreFilePath, 
                "hasDotenv": hasDotenv, 
                "hasDoubleStarSlashStarDotenv": hasDoubleStarSlashStarDotenv,
                "hasDoubleStarSlashDotenvStar": hasDoubleStarSlashDotenvStar
            });
        }
        return ignoreFileDetails     
    }
}

export class DotGitIgnoreDetails extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const gitIgnoreDetails = await searchIgnoreFile(this.clonedRepoPath, ".gitignore");        
        return {
            checkPasses: gitIgnoreDetails === undefined ? false : true,
            metadata: {'gitIgnoreFiles': gitIgnoreDetails}, // gitIgnoreDetails is an array 
            // lastUpdated: Date.now()
        }
    }
}

export class DotDockerIgnoreDetails extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const dockerIgnoreDetails = await searchIgnoreFile(this.clonedRepoPath, ".dockerignore");        
        return {
            checkPasses: dockerIgnoreDetails === undefined ? false : true,
            metadata: dockerIgnoreDetails === undefined ? null : {'dockerIgnoreFiles': dockerIgnoreDetails},
            // lastUpdated: Date.now()
        }
    }

}
