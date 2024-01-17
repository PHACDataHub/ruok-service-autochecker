// clone-repo-functions.test.js

import { cloneRepository, removeClonedRepository } from '../clone-remove-repo.js'; 
import fsExtra from 'fs-extra';

describe('Repository cloning and removal', () => {
  let clonedRepoPath; 

  it('should clone a repository', async () => {
    const cloneUrl = 'git@github.com:PHACDataHub/dns.git'; 
    const repoName = 'dns'; //(using this as it's a public repo and like will still be standing as this project progresses)
    clonedRepoPath = await cloneRepository(cloneUrl, repoName);
    expect(clonedRepoPath).toBeTruthy();  
  });

  it('should be able to handle being cloned more than once', async () => {
    const cloneUrl = 'git@github.com:PHACDataHub/dns.git'; 
    const repoName = 'dns'; 
    clonedRepoPath = await cloneRepository(cloneUrl, repoName);
    clonedRepoPath = await cloneRepository(cloneUrl, repoName);
    expect(clonedRepoPath).toBeTruthy();  
  });

  it('should be able to handle a non-valid repoName', async () => {
    const cloneUrl = 'git@github.com:PHACDataHub/dnses.git'; 
    const repoName = 'dns'; 
    const clonedRepoPath3 = await cloneRepository(cloneUrl, repoName);
    
    expect(clonedRepoPath3).toBeUndefined(); 
  });

  it('should remove the cloned repository', async () => {
    expect(clonedRepoPath).toBeDefined();

    await removeClonedRepository(clonedRepoPath);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const directoryExists = await fsExtra.pathExists(clonedRepoPath);

    expect(directoryExists).toBe(false); 
  });

  // it('should be able to handle the cloned repo not being there?) - this is internal, not sure ths is going to come up
});


