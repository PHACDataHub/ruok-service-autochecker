// github-cloned-repo/src/has-tests-directory.js
import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import * as glob from 'glob';

export async function findTestsPaths(repoPath) {
  // all directories with 'test' in the name
  const pattern = `${repoPath}/**/*test*`;
  const fullTestDirectoryPaths = glob.sync(pattern, { onlyDirectories: true });

  // Map the paths to repo-scoped paths
  const scopedTestDirectoryPaths = fullTestDirectoryPaths.map(dir => {
    const repoScopedPath = dir.split('/').slice(2).join('/');  //TODO - revisit (have changed from 3-2, need to confirm this is correct?)
    // console.log('**************************************',repoScopedPath)
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
        metadata: (testDirectories === undefined || testDirectories.length === 0) ? null : { testDirectoryPaths: testDirectories }, // returns null unless test-dir found 
        // lastUpdated: Date.now()
    }
  }
}