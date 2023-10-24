// github-cloned-has-tests-directory/src/has-tests-directory.js
import * as fs from 'fs';
import { CheckOnClonedRepoStrategy } from './check-on-cloned-repo-strategy.js'
// repoPath used to search for tests

// const directory = `../../temp-cloned-repo/${repoName}`

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

export async function searchTests(directory) {
  // Just returning basic if __test__ folder for now 
  const testDirectories = searchForDirectory (directory, "tests")
  const testDetails = []

  if (testDirectories.length > 0) {
      for (const dir of testDirectories) { //will this address null case?
          const repoScopedPath = dir.split('/').slice(3).join('/'); // removing ./temp-cloned-repo/${repo}
          testDetails.push ({
              "testPath": repoScopedPath, 
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

export async function formTestsDirectoryPayload(testDirectories) {
  if (testDirectories.length != 0) {
    return ({"hasTestsDirectory": true, "testDirectories": testDirectories})
    // return ({"testDirectories": testDirectories})
  } else {
    return ({"hasTestsDirectory": false})
    // return ({"testDirectories": null})
  }

}

export class HasTestsDirectory extends CheckOnClonedRepoStrategy {
  constructor(repoName, clonedRepoPath) { 
    super(repoName, clonedRepoPath); 
    this.clonedRepoPath = clonedRepoPath;
    this.repoName = repoName
}
  async doRepoCheck() {
      const testDirectories = await searchTests(this.clonedRepoPath)
      const formatedTestDirectory = await formTestsDirectoryPayload(testDirectories)
      console.log(
          `hasTestDirectory: ${JSON.stringify(formatedTestDirectory)}`
      )
      return formatedTestDirectory
  }
  checkName() {
      this.checkName = 'hasTestsDirectory'
      console.log(`checkName is ${this.checkName}`)
      return this.checkName
  }
}