
import { HasApiDirectory, hasApiDirectory } from '../has-api-directory.js';
import * as fse from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import * as fs from 'fs'

describe('hasApiDirectory function', () => {
  let testRepoPath;

  beforeEach(() => {
    testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
    fse.ensureDirSync(testRepoPath);
  });

  afterEach(() => {
      if (fs.existsSync(testRepoPath)) {
        fs.rmSync(testRepoPath, { recursive: true, force: true });
        // fs.rmSync(testRepoPath, { recursive: true});
      }
  });

  it('should be able find api directories at root', async () => {
    fse.ensureDirSync(`${testRepoPath}/api`);
    const result1 = await hasApiDirectory(testRepoPath);

    expect(result1).toBeTruthy()
  });


  it('should find case insenstive test directories', async () => {
    fse.ensureDirSync(`${testRepoPath}/API`);
    const result2 = await hasApiDirectory(testRepoPath);

    expect(result2).toBeTruthy()
  });

  it('should find api directories up the tree', async () => {
    fse.ensureDirSync(`${testRepoPath}/dirA/api/index.js`);
    const result3 = await hasApiDirectory(testRepoPath);

    expect(result3).toBeTruthy(); 
  });
});


describe('HasApiDirectory', () => {
  let testRepoPath;

  beforeEach(() => {
    testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
    fse.ensureDirSync(testRepoPath);
  });

  afterEach(() => {
      if (fs.existsSync(testRepoPath)) {
        // fs.rmSync(testRepoPath, { recursive: true, force: true });
        fs.rmSync(testRepoPath, { recursive: true});
      }
  });


  it('should pass if api directory is found up tree', async () => {
    const repoName = 'test-repo';
    // fse.ensureDirSync(`${testRepoPath}/dir1/sub1`);
    fse.ensureDirSync(`${testRepoPath}/dir2/subdir2/api`);

    const checker = new HasApiDirectory(repoName, testRepoPath);
    const result4 = await checker.doRepoCheck();

    console.log('Result:', result4);

    expect(result4.checkPasses).toBeTruthy();
  });

  it('should fail if no api directories are found', async () => {
    const repoName = 'test-repo';
    fse.ensureDirSync(`${testRepoPath}/dir2`);
    fse.ensureDirSync(`${testRepoPath}/dir1/sub1`);
    fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);

    const checker = new HasApiDirectory(repoName, testRepoPath);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeFalsy();
  });

  // Metadata
});
