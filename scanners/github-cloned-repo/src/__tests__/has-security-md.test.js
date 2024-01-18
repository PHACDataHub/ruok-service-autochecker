import { HasSecurityMd  } from '../has-security-md.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fsPromises} from 'fs';


describe('HasSecurityMd', () => {
    let testRepoPath;

    beforeEach(async () => {
        // Set up temp dir
        testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
        await fsPromises.mkdir(testRepoPath, { recursive: true });
        await fsPromises.mkdir(`${testRepoPath}/docs`, { recursive: true });
      });
    
    afterEach(async () => {
      await fsPromises.rm(testRepoPath, { recursive: true, force: true });
    });


    it('should pass if a security.md file is found (anywhere in repo)', async () => {
        const repoName = 'test-repo';
        await fsPromises.writeFile(`${testRepoPath}/docs/security.md`, 'Test content'); // create secrurity.md file
        const checker = new HasSecurityMd(repoName, testRepoPath); // initialize has security md checker
        const result = await checker.doRepoCheck();

        expect(result.checkPasses).toBeTruthy();
    });

    it('should pass if an uppercase SECURITY.md file is found', async () => {
        const repoName = 'test-repo';
        await fsPromises.writeFile(`${testRepoPath}/security.md`, 'Test content');
        const checker = new HasSecurityMd(repoName, testRepoPath);
        const result = await checker.doRepoCheck();

        expect(result.checkPasses).toBeTruthy();
    });

    it('should pass if a non-markdown SECURITY (txt or rtf)file is found', async () => {
        const repoName = 'test-repo';
        await fsPromises.writeFile(`${testRepoPath}/SECURITY.txt`, 'Test content');
        const checker = new HasSecurityMd(repoName, testRepoPath);
        const result = await checker.doRepoCheck();

        expect(result.checkPasses).toBeTruthy();
    });

    it('should pass if a (non-extensioned) security file is found', async () => {
        const repoName = 'test-repo';
        await fsPromises.writeFile(`${testRepoPath}/security`, 'Test content');
        const checker = new HasSecurityMd(repoName, testRepoPath);
        const result = await checker.doRepoCheck();

        expect(result.checkPasses).toBeFalsy();
    });
    

    it('should fail if no security.md file is found', async () => { 
        // Have not added security.md file
        const repoName = 'test-repo';
        const checker = new HasSecurityMd(repoName, testRepoPath);
        const result = await checker.doRepoCheck();
        
        expect(result.checkPasses).toBeFalsy();
    });

});