
import { HasApiDirectory, hasApiDirectory } from '../has-api-directory.js';
import * as fsPromises from 'fs/promises';
import * as fse from 'fs-extra';


describe('hasApiDirectory function', () => {
  let testDirectory;

  beforeEach(async () => {
    testDirectory = './temp-dir/temp-repo';
    await fse.ensureDir(testDirectory);
  });

  afterEach(async () => {
    await fsPromises.rm(testDirectory, { recursive: true });
  });

  it('should be able find api directories at root', async () => {
    const repoName = 'test-repo';
    fse.ensureDirSync(`${testDirectory}/api`);

    const result = await hasApiDirectory(testDirectory);
    expect(result).toBeTruthy()
  });


  it('should find case insenstive test directories', async () => {
    const repoName = 'test-repo';
    fse.ensureDirSync(`${testDirectory}/API`);

    const result = await hasApiDirectory(testDirectory);
    expect(result).toBeTruthy()
  });

   // This doesn't work - need to adjust if using this function.
  it('should find api directories not at the root', async () => {
    const repoName = 'test-repo';
    fse.ensureDirSync(`${testDirectory}/dirA/api/module.js`);

    const result = await hasApiDirectory(testDirectory);
    expect(result).toBeTruthy(); 
  });

});


describe('HasApiDirectory', () => {
  let testDirectory;

  beforeEach(() => {
    testDirectory = './temp-dir/temp-repo';
    fse.ensureDirSync(testDirectory);
  });

  afterEach(async () => {
    await fsPromises.rm(testDirectory, { recursive: true });
  });

  it('should pass if api directory is found', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fse.ensureDirSync(`${testDirectory}/dir1/sub1`);
    fse.ensureDirSync(`${testDirectory}/dir2/subdir2/api`);

    const checker = new HasApiDirectory(repoName, testDirectory);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeTruthy();
  });

  it('should fail if no test directories are found', async () => {
    const repoName = 'test-repo';
    // create subdirectories in the temp directory
    fse.ensureDirSync(`${testDirectory}/dir2`);
    fse.ensureDirSync(`${testDirectory}/dir1/sub1`);
    fse.ensureDirSync(`${testDirectory}/dir2/subdir2`);

    const checker = new HasApiDirectory(repoName, testDirectory);
    const result = await checker.doRepoCheck();

    expect(result.checkPasses).toBeFalsy();
  });
});
