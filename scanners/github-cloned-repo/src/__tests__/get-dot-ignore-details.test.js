import { hasTextInFile, searchIgnoreFile, DotGitIgnoreDetails, DotDockerIgnoreDetails } from '../get-dotignore-details.js'
import * as fs from 'fs';
import * as fse from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
// import { promises as fsPromises} from 'fs';

// TODO dockerignore as well! 
describe('searchIgnoreFile function', () => {
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

    it('should return details of ignore files with .env', async () => {
        fse.ensureDirSync(`${testRepoPath}/dir1`);
        fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);

        fs.writeFileSync(`${testRepoPath}/.gitignore`, '');
        fs.writeFileSync(`${testRepoPath}/dir1/.env`, '');
        fs.writeFileSync(`${testRepoPath}/dir2/.env.dev`, '');
        fs.writeFileSync(`${testRepoPath}/dir2/subdir2/.env.test`, '');

        const ignoreFileDetails = await searchIgnoreFile(testRepoPath, '.gitignore');

        expect(ignoreFileDetails).toHaveLength(1); 
        // expect(ignoreFileDetails[0].repoScopedPath).toBe('');
        expect(ignoreFileDetails[0].hasDotenv).toBe(false); 
        expect(ignoreFileDetails[0].hasDoubleStarSlashStarDotenv).toBe(false);
        expect(ignoreFileDetails[0].hasDoubleStarSlashDotenvStar).toBe(false);
    });


    it('should return details of gitignore containing .env', async () => {
        fse.ensureDirSync(`${testRepoPath}/dir1`);
        fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);
        
        fs.writeFileSync(`${testRepoPath}/.gitignore`, '.env');

        const ignoreFileDetails = await searchIgnoreFile(testRepoPath, '.gitignore');

        expect(ignoreFileDetails).toHaveLength(1); 
        expect(ignoreFileDetails[0].hasDotenv).toBe(true);
        expect(ignoreFileDetails[0].hasDoubleStarSlashStarDotenv).toBe(false);
        expect(ignoreFileDetails[0].hasDoubleStarSlashDotenvStar).toBe(false);
    });

    it('should return details of gitignore containing .env', async () => {
        fse.ensureDirSync(`${testRepoPath}/dir1`);
        fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);
        
        fs.writeFileSync(`${testRepoPath}/.gitignore`, '**/*.env');

        const ignoreFileDetails = await searchIgnoreFile(testRepoPath, '.gitignore');

        expect(ignoreFileDetails).toHaveLength(1); 
        expect(ignoreFileDetails[0].hasDotenv).toBe(true); 
        expect(ignoreFileDetails[0].hasDoubleStarSlashStarDotenv).toBe(true);
        expect(ignoreFileDetails[0].hasDoubleStarSlashDotenvStar).toBe(false);
    });

    it('should return details of gitignore containing .env', async () => {
        fse.ensureDirSync(`${testRepoPath}/dir1`);
        fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);
        
        fs.writeFileSync(`${testRepoPath}/.gitignore`, '**/.env*');

        const ignoreFileDetails = await searchIgnoreFile(testRepoPath, '.gitignore');

        expect(ignoreFileDetails).toHaveLength(1); 
        // expect(ignoreFileDetails[0].repoScopedPath).toBe('');
        expect(ignoreFileDetails[0].hasDotenv).toBe(true); 
        expect(ignoreFileDetails[0].hasDoubleStarSlashStarDotenv).toBe(false);
        expect(ignoreFileDetails[0].hasDoubleStarSlashDotenvStar).toBe(true);
    });
  
    it('should return details of gitignore containing in subdirectory .env', async () => {
        fse.ensureDirSync(`${testRepoPath}/dir1`);
        fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);
        
        fs.writeFileSync(`${testRepoPath}/.gitignore`, '');
        fs.writeFileSync(`${testRepoPath}/dir1/.gitignore`, '.env');
        const ignoreFileDetails = await searchIgnoreFile(testRepoPath, '.gitignore');
        
        expect(ignoreFileDetails).toHaveLength(2); 
        // expect(ignoreFileDetails[0].repoScopedPath).toBe(''); //to test this path! (cuts at 3rd)
        expect(ignoreFileDetails[0].hasDotenv).toBe(false); 
        expect(ignoreFileDetails[0].hasDoubleStarSlashStarDotenv).toBe(false);
        expect(ignoreFileDetails[0].hasDoubleStarSlashDotenvStar).toBe(false);

        // expect(ignoreFileDetails[1].repoScopedPath).toBe('.gitignore'); //todo - need to test this path!  This isn't right
        expect(ignoreFileDetails[1].hasDotenv).toBe(true); 
        expect(ignoreFileDetails[1].hasDoubleStarSlashStarDotenv).toBe(false);
        expect(ignoreFileDetails[1].hasDoubleStarSlashDotenvStar).toBe(false);

    });


    it('should return an empty array if no ignore files exist', async () => {
        fse.ensureDirSync(`${testRepoPath}/dir1`);
        fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);

        const ignoreFileDetails = await searchIgnoreFile(testRepoPath, '.gitignore');
        console.log(ignoreFileDetails)

        expect(ignoreFileDetails).toBe(undefined); 
    });
});


describe('hasTextInFile function', () => {
    let testFile;

    beforeAll(() => {
        testFile = './temp-test-file.txt';
        fs.writeFileSync(testFile, 'This is a test file.\nIt contains some text to search.');
    });

    afterAll(() => {
        if (fs.existsSync(testFile)) {
            fs.rmSync(testFile);
        }
    });

    it('should return true if the text is found in the file', async () => {
        const textToSearch = 'test file';
        const foundText = await hasTextInFile(testFile, textToSearch);
        
        expect(foundText).toBe(true);
    });

    it('should return false if the text is not found in the file', async () => {
        const textToSearch = 'nonexistent text';
        const foundText = await hasTextInFile(testFile, textToSearch);
        
        expect(foundText).toBe(false);
    });

});
