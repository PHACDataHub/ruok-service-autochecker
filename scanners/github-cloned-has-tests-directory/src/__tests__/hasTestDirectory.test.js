
import * as fs from 'fs';

describe('searchForDirectory function', () => {
    let testDirectory;
  
    beforeAll(() => {
      // temp dir
        testDirectory = './temp-test-directory';
        if (!fs.existsSync(testDirectory)) {
            fs.mkdirSync(testDirectory);
        }
  
      // subdirectories in the temp directory
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