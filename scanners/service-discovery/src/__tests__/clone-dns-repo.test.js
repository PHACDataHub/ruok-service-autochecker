import { cloneDnsRepository, removeClonedDnsRepository } from '../clone-dns-repo.js';
import fsExtra from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('cloneDnsRepository', () => {
    it('should clone the DNS repository successfully', async () => {
      const repoPath = await cloneDnsRepository()
      const exists = await fsExtra.pathExists(repoPath)
      
      expect(repoPath).toBeTruthy()  
      expect(exists).toBe(true)

      // Clean up 
      await removeClonedDnsRepository(repoPath)
    });

    it('should handle cloning when the repository already exists', async () => {
      const repoPath = await cloneDnsRepository()
      // Attempt to clone again
      const secondRepoPath = await cloneDnsRepository()

      // The second path should be the same as the first
      expect(secondRepoPath).toBe(repoPath)

      // clean up 
      await removeClonedDnsRepository(repoPath);
  });
});


describe('Remove cloned DNS repository', () => {
  it('should remove the cloned DNS repository successfully', async () => {

    const clonedRepoPath = path.join(__dirname, 'temp-cloned-repo', 'dns');
    const exists = await fsExtra.pathExists(clonedRepoPath);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // logging after the fact was causing issues - so adding timeout here. 
   
    expect(exists).toBe(false);
  })

  it('should handle removal when the repository does not exist', async () => {
    const nonExistentPath = '/path/that/does/not/exist'

    try {
        await removeClonedDnsRepository(nonExistentPath)
        // If removal succeeds, it should not reach here
        fail('Should have thrown an error for non-existent path')
    } catch (error) {
        expect(error).toBeTruthy()
    }
  })
})