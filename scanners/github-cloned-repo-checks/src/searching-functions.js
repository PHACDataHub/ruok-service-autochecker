import * as fs from 'fs';

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