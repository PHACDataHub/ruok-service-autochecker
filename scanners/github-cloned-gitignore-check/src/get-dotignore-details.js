// fs docs node https://nodejs.org/docs/v0.3.4/api/fs.html
import * as fs from 'fs';
import * as util from 'util';

// const repoPath = `../../temp-cloned-repo/${repoName}`;

function searchForFile(directory, targetFileName) {
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

async function searchFileForText(filePath, text) {
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

        if (result.length > 0) {
            // console.log(text, "found text in file", result.length, "times");
            return true;
        } else {
            // console.log("text not found in file");
            return false;
        }
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}


export async function searchIgnoreFile(repoName, ignoreFileName) {
    const repoPath = `../../temp-cloned-repo/${repoName}`
    const ignoreFilePaths = searchForFile(repoPath, ignoreFileName)
    const ignoreFileDetails = []
    // gitignoreDetails.push({numberOfGitignores: gitignoreFilePaths.length})

    if (ignoreFilePaths.length > 0) {
        for (const filePath of ignoreFilePaths) { //will this address null case?
            const repoScopedPath = filePath.split('/').slice(3).join('/'); // removing ./temp-cloned-repo/${repo}
            const hasDotenv = await searchFileForText(filePath, '.env') // temp value for logic  finding just .env in file (any form)
            const hasDoubleStarSlashStarDotenv = await searchFileForText(filePath, '\\*\\*/\\*.env') // in this case is **/*.env
            const hasDoubleStarSlashDotenvStar = await searchFileForText(filePath, '\\*\\*/.env.*') // looking for **/.env*
            ignoreFileDetails.push ({
                "repoScopedPath": repoScopedPath, 
                "hasDotenv": hasDotenv, 
                "hasDoubleStarSlashStarDotenv": hasDoubleStarSlashStarDotenv,
                "hasDoubleStarSlashDotenvStar": hasDoubleStarSlashDotenvStar
            });
        }
        return ignoreFileDetails     
    }
}
