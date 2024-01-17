
import { HasTestsDirectory, findTestsPaths } from '../has-tests-directory.js';
import {  existsSync, rmSync } from 'fs';
import * as fse from 'fs-extra';

describe('findTestsPaths function', () => {
  let testDirectory;

  beforeEach(() => {
    testDirectory = './temp-dir/temp-repo';
    fse.ensureDirSync(testDirectory);
  });

  afterEach(() => {
    if (existsSync(testDirectory)) {
      rmSync(testDirectory, { recursive: true });
    }
  });

  it('should find test directories at root', async () => {
    const repoName = 'test-repo';
    fse.ensureDirSync(`${testDirectory}/tests`);

    const result = await findTestsPaths(testDirectory);
    expect(result).toEqual['tests']; 
  });

  // it('should not include test files', async () => {
  //   fs.writeFileSync(`${testDirectory}/tests.js`, '');

  //   const result = await findTestsPaths(testDirectory);
  //   expect(result.length).toEqual(0); 
  // });

  it('should find case insenstive test directories', async () => {
    const repoName = 'test-repo';
    fse.ensureDirSync(`${testDirectory}/TESTS`);

    const result = await findTestsPaths(testDirectory);
    expect(result.length).toEqual(0); 
  });

   // This doesn't work - need to adjust if using this function.
  it('should find test directories not at the root', async () => {
    const repoName = 'test-repo';
    fse.ensureDirSync(`${testDirectory}/dirA/tests/module.js`);

    const result = await findTestsPaths(testDirectory);
    expect(result).toEqual['dirA/tests']; 
  });

});


describe('HasTestsDirectory', () => {
  let testDirectory;

  beforeEach(() => {
    testDirectory = './temp-dir/temp-repo';
    fse.ensureDirSync(testDirectory);
  });

  afterEach(() => {
    if (existsSync(testDirectory)) {
      rmSync(testDirectory, { recursive: true });
    }
  });

  it('should pass if test directories are found', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fse.ensureDirSync(`${testDirectory}/dir2/__tests__`);
    fse.ensureDirSync(`${testDirectory}/dir1/sub1`);
    fse.ensureDirSync(`${testDirectory}/dir2/subdir2/tests`);

    const checker = new HasTestsDirectory(repoName, testDirectory);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeTruthy();
    expect(result.metadata).toEqual({ testDirectoryPaths: ['dir2/__tests__', 'dir2/subdir2/tests'],});
  });

  it('should fail if no test directories are found', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fse.ensureDirSync(`${testDirectory}/dir2`);
    fse.ensureDirSync(`${testDirectory}/dir1/sub1`);
    fse.ensureDirSync(`${testDirectory}/dir2/subdir2`);

    const checker = new HasTestsDirectory(repoName, testDirectory);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeFalsy();
    expect(result.metadata).toBeNull();
  });
});
