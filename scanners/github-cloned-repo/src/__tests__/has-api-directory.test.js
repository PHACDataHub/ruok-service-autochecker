
import { HasApiDirectory, hasApiDirectory } from '../has-api-directory.js';
// import * as fsPromises from 'fs/promises';
import * as fse from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fsPromises} from 'fs';
import * as fs from 'fs'
import {  existsSync, rmSync, writeFileSync } from 'fs';

// async function createDir(directory) {
//   try {
//     await fse.ensureDir(directory)
//     // console.log('created:', directory)
//   } catch (err) {
//     console.error(err)
//   }
// }

describe('hasApiDirectory function', () => {
  let testRepoPath;

  // beforeEach(async () => {
  //     // Set up temp dir
  //     testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`);
  //     await fsPromises.mkdir(testRepoPath, { recursive: true });
  //   });
  
  // afterEach(() => {
  //   fs.rmSync(testRepoPath, { recursive: true });
  // });

  beforeEach(() => {
    testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
    fse.ensureDirSync(testRepoPath);
  });

  afterEach(() => {
      if (existsSync(testRepoPath)) {
        rmSync(testRepoPath, { recursive: true, force: true });
      }
  });

  it('should be able find api directories at root', async () => {
    fse.ensureDirSync(`${testRepoPath}/api`);
    // await createDir(`${testRepoPath}/api`);
    const result = await hasApiDirectory(testRepoPath);

    expect(result).toBeTruthy()
  });


  it('should find case insenstive test directories', async () => {
    fse.ensureDirSync(`${testRepoPath}/API`);
    // await createDir(`${testRepoPath}/API`);
    const result = await hasApiDirectory(testRepoPath);

    expect(result).toBeTruthy()
  });

  it('should find api directories up the tree', async () => {
    fse.ensureDirSync(`${testRepoPath}/dirA/api/index.js`);
    // await createDir(`${testRepoPath}/dirA/api/index.js`);
    const result = await hasApiDirectory(testRepoPath);

    expect(result).toBeTruthy(); 
  });
});


describe('HasApiDirectory', () => {
  let testRepoPath;

  // beforeEach(async () => {
  //   // Set up temp dir
  //   testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`);
  //   console.log(testRepoPath)
  //   await fsPromises.mkdir(testRepoPath, { recursive: true });
  // });
  

  // afterEach(() => {
  //   fs.rmSync(testRepoPath, { recursive: true });
  // });
  beforeEach(() => {
    testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
    fse.ensureDirSync(testRepoPath);
  });

  afterEach(() => {
      if (existsSync(testRepoPath)) {
        rmSync(testRepoPath, { recursive: true, force: true });
      }
  });


  it('should pass if api directory is found up tree', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fse.ensureDirSync(`${testRepoPath}/dir1/sub1`);
    fse.ensureDirSync(`${testRepoPath}/dir2/subdir2/api`);
    // await createDir(`${testRepoPath}/dir1/sub1`);
    // await createDir(`${testRepoPath}/dir2/subdir2/api`);

    const checker = new HasApiDirectory(repoName, testRepoPath);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeTruthy();
  });

  it('should fail if no api directories are found', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fse.ensureDirSync(`${testRepoPath}/dir2`);
    fse.ensureDirSync(`${testRepoPath}/dir1/sub1`);
    fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);
    // await createDir(`${testRepoPath}/dir2`);
    // await createDir(`${testRepoPath}/dir1/sub1`);
    // await createDir(`${testRepoPath}/dir2/subdir2`);

    const checker = new HasApiDirectory(repoName, testRepoPath);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeFalsy();
  });

  // Metadata
});
