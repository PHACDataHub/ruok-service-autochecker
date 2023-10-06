// fs docs node https://nodejs.org/docs/v0.3.4/api/fs.html
import * as fs from 'fs';
import * as util from 'util';

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

export function searchForDirectory(directory, targetDirectoryName) {
    const subDirectories = fs.readdirSync(directory);
    const foundDirectoryPaths = [];
  
    for (const subDir of subDirectories) {
      const fullPath = `${directory}/${subDir}`;
      const stat = fs.statSync(fullPath);
  
      if (stat.isDirectory()) {
        // if (subDir === targetDirectoryName) {
        if (subDir.includes(targetDirectoryName)) { // changing to includes to account for tests and __tests__
          foundDirectoryPaths.push(fullPath);
        }
        const subDirectoryPaths = searchForDirectory(fullPath, targetDirectoryName);
        foundDirectoryPaths.push(...subDirectoryPaths);
      }
    }
    return foundDirectoryPaths;
  }

 
export async function hasApiDirectory(directory) {
    const apiDirectories = searchForDirectory (directory, "api")
    if (apiDirectories.length > 0) {
        return true
    } else {
        return false
    }
} 

export async function hasDependabotYaml(directory) {
    // searchForFile returns array of found file paths
    const dependabotFile = searchForFile(directory, "dependabot.y") // accounting for both .yaml and .yml
    if (dependabotFile.length > 0) {
        // console.log('****', dependabotFile)
        return true
    } else {
        return false
    }
} 


export async function hasSecurityMd(directory) {
    const securityMds = searchForFile(directory, "SECURITY.md")
    if (securityMds.length > 0) {
        return true
    } else {
        return false
    }
}

// async function findTestingLibraries(directory, langague){
//     // Note -there must be a better way to do this... will 
//     const pythonTestingLibraries = ["pytest", "unittest", "django...", "coverage"]
//     const javascriptTestingLibraries = []

//     // search for each package.jsons and see if library
//     // search for pdm (can't remember the filename for this) or requirements.txt and 

//     // see (not here) if used in gh workflows or cloudbuild.yaml or other used ci process
// }

export async function searchTests(directory) {
    // Just returning basic if __test__ folder for now 
    const testDirectories = searchForDirectory (directory, "tests")
    const testDetails = []

    if (testDirectories.length > 0) {
        for (const dir of testDirectories) { //will this address null case?
            const repoScopedPath = dir.split('/').slice(3).join('/'); // removing ./temp-cloned-repo/${repo}
            testDetails.push ({
                "repoScopedPath": repoScopedPath, 
            // TODO
                // determine if non-empty - 
                // find testing libraries (langague? ) -get python - coverage, pytest, js, typescript jest, etc
                // maybe scrape readme for coverage report?
                // Any root directory with code - search for tests
            });
        }
    }
    return testDetails     
}

export async function searchIgnoreFile(directory, targetFileName) {
    const ignoreFilePaths = searchForFile(directory, targetFileName)
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


//Tests -search for tests, and non-empty file
// search for testing libraries present
// coverage ...

// const filePath = './temp-cloned-repo/it33-filtering/.gitignore'

export async function searchFileForText(filePath, text) {
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
