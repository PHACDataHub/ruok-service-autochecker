import { searchForDirectory, searchTests } from '../has-tests-directory.js';
import * as fs from 'fs';

// TODO use mock-fs https://www.npmjs.com/package/mock-fs

describe('searchForDirectory function', () => {
    let testDirectory;
  
    beforeAll(() => {
        testDirectory = './temp-test-directory';
        if (!fs.existsSync(testDirectory)) {
            fs.mkdirSync(testDirectory);
        }
  
      // create subdirectories in the temp directory
        fs.mkdirSync(`${testDirectory}/dir1`);
        fs.mkdirSync(`${testDirectory}/dir2`);
        fs.mkdirSync(`${testDirectory}/dir1/sub1`);
        fs.mkdirSync(`${testDirectory}/dir2/subdir2`);
    });
  
    afterAll(() => {
      // clean up
        if (fs.existsSync(testDirectory)) {
            fs.rmdirSync(testDirectory, { recursive: true });
        }
    });
  
    it('should find directories with a given name', () => {
        const foundDirs = searchForDirectory(testDirectory, 'dir');
        console.log('****************', foundDirs)
        expect(foundDirs).toHaveLength(3); 
        expect(foundDirs).toContain(`${testDirectory}/dir1`); 
        expect(foundDirs).toContain(`${testDirectory}/dir2`);
    });
  
    it('should return an empty array if no directories match', () => {
        const foundDirs = searchForDirectory(testDirectory, 'nonexistent');
    
        expect(foundDirs).toHaveLength(0); 
    });
  });


describe('searchTests function', () => {
  let testDirectory;
  
  beforeAll(() => {
      testDirectory = './temp-test-directory';
      if (!fs.existsSync(testDirectory)) {
          fs.mkdirSync(testDirectory);
      }

    // create subdirectories in the temp directory
      fs.mkdirSync(`${testDirectory}/dir1`);
      fs.mkdirSync(`${testDirectory}/dir2`);
      fs.mkdirSync(`${testDirectory}/dir2/__tests__`);
      fs.mkdirSync(`${testDirectory}/dir1/sub1`);
      fs.mkdirSync(`${testDirectory}/dir2/subdir2`);
      fs.mkdirSync(`${testDirectory}/dir2/subdir2/tests`);
  });

  afterAll(() => {
      if (fs.existsSync(testDirectory)) {
          fs.rmdirSync(testDirectory, { recursive: true });
      }
  });

  it('should return test details for a directory with tests', async () => {
    const testDetails = await searchTests(testDirectory);

    expect(testDetails).toHaveLength(2);
    expect(testDetails).toEqual([{"repoScopedPath": "__tests__"}, {"repoScopedPath": "subdir2/tests"}]);
  });

  it('should return an empty array for a directory without tests', async () => {
    const testDetails = await searchTests(`${testDirectory}/dir1`);

    expect(testDetails).toHaveLength(0);
  });

});