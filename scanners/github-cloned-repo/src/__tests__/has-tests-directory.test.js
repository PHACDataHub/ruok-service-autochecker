
import { HasTestsDirectory, findTestsPaths } from '../has-tests-directory.js';
import {  existsSync, rmdirSync } from 'fs';
import * as fs from 'fs-extra';

describe('HasTestsDirectory', () => {
  let testDirectory;

  beforeEach(() => {
    testDirectory = './temp-cloned-repo/temp-repo';
    fs.ensureDirSync(testDirectory);
  });

  afterEach(() => {
    if (existsSync(testDirectory)) {
      rmdirSync(testDirectory, { recursive: true });
    }
  });

  it('should pass if test directories are found', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fs.ensureDirSync(`${testDirectory}/dir2/__tests__`);
    fs.ensureDirSync(`${testDirectory}/dir1/sub1`);
    fs.ensureDirSync(`${testDirectory}/dir2/subdir2/tests`);

    const checker = new HasTestsDirectory(repoName, testDirectory);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeTruthy();
    expect(result.metadata).toEqual({ testDirectoryPaths: ['dir2/__tests__', 'dir2/subdir2/tests'],});
  });

  it('should fail if no test directories are found', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fs.ensureDirSync(`${testDirectory}/dir2`);
    fs.ensureDirSync(`${testDirectory}/dir1/sub1`);
    fs.ensureDirSync(`${testDirectory}/dir2/subdir2`);

    const checker = new HasTestsDirectory(repoName, testDirectory);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeFalsy();
    expect(result.metadata).toBeNull();
  });
});
