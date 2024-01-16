
// import * as fs from 'fs';
import { HasSecurityMd  } from '../has-security-md.js';
import { promisify } from 'util';
// import { exec } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fsPromises} from 'fs';


const setupTestRepo = async (repoPath) => {
    // Create a temp dir for the test "repo" with a simple directory structure and security.md file
    await fsPromises.mkdir(`${repoPath}/docs`, { recursive: true });
    // await fsPromises.writeFile(`${repoPath}/docs/security.md`, 'Test content');
  };
  
  const teardownTestRepo = async (repoPath) => {
    // Remove tmp dir
    await fsPromises.rm(repoPath, { recursive: true });
  };

describe('HasSecurityMd', () => {
    let testRepoPath;

    // beforeAll(async () => {
    beforeEach(async () => {
        // Set up temp dir
        testRepoPath = join(tmpdir(), 'test-repo');
        await setupTestRepo(testRepoPath);
      });
    
    afterEach(async () => {
        await teardownTestRepo(testRepoPath);
      });

    it('should pass if a security.md file is found (anywhere in repo)', async () => {
        const repoName = 'test-repo';
        await fsPromises.writeFile(`${testRepoPath}/docs/security.md`, 'Test content');
        const checker = new HasSecurityMd(repoName, testRepoPath);
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

    it('should pass if a security file is found', async () => {
        const repoName = 'test-repo';
        await fsPromises.writeFile(`${testRepoPath}/security`, 'Test content');
        const checker = new HasSecurityMd(repoName, testRepoPath);
        const result = await checker.doRepoCheck();

        expect(result.checkPasses).toBeTruthy();
    });
    

    it('should fail if no security.md file is found', async () => { 
        // Have not added security.md file
        const repoName = 'test-repo';
        const checker = new HasSecurityMd(repoName, testRepoPath);
        const result = await checker.doRepoCheck();
        
        expect(result.checkPasses).toBeFalsy();
    });

//   test SECURITY, security, security.md, SECURITY.md, not at root 
});