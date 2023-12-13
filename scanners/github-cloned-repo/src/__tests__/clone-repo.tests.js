// clone-repo.tests.js

import { cloneRepository, removeClonedRepository } from '../clone-repo.js'; // Replace 'your-module' with the correct module path
import fsExtra from 'fs-extra';

describe('Repository cloning and removal', () => {
  let clonedRepoPath; 

  it('should clone a repository', async () => {
    const cloneUrl = 'git@github.com:PHACDataHub/dns.git'; 
    const repoName = 'dns';
    clonedRepoPath = await cloneRepository(cloneUrl, repoName);
    expect(clonedRepoPath).toBeTruthy();  
  });


  it('should remove the cloned repository', async () => {
    // Ensure repoPath is defined (it should have been set in the previous test)
    expect(clonedRepoPath).toBeDefined();

    await removeClonedRepository(clonedRepoPath);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const directoryExists = await fsExtra.pathExists(clonedRepoPath);

    expect(directoryExists).toBe(false); 
  });
});


