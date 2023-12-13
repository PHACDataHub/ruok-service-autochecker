// github-cloned-has-tests-directory/src/has-tests-directory.js
import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { searchForDirectory } from './searching-functions.js';

export async function findTestsPaths(repoPath) {
  // Returns paths of folders containing 'tests' in the name
  const fullTestDirectoryPaths = searchForDirectory(repoPath, "tests");
  const scopedTestDirectoryPaths = fullTestDirectoryPaths.map(dir => {
    const repoScopedPath = dir.split('/').slice(3).join('/'); // removing ./temp-cloned-repo/${repo}
    return repoScopedPath;
  });
  return scopedTestDirectoryPaths;
}

export class HasTestsDirectory extends CheckOnClonedRepoInterface {
  constructor(repoName, clonedRepoPath) { 
    super(repoName, clonedRepoPath); 
    this.clonedRepoPath = clonedRepoPath;
    this.repoName = repoName
}
  async doRepoCheck() {
      const testDirectories = await findTestsPaths(this.clonedRepoPath)
      return {
        checkPasses:  (testDirectories?.length ?? 0) > 0,
        metadata: testDirectories === undefined ? null : {testDirectoryPaths: testDirectories},
        lastUpdated: Date.now()
    }
  }
}