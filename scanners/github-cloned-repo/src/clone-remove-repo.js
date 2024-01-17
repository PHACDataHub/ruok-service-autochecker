import * as fse from 'fs-extra'
import { simpleGit } from "simple-git"
import os  from 'os'
import path from 'path'


export async function cloneRepository(clone_url, repoName) {
  // Clones Repository into tmp directory - returns path
  try {
    const tempDir = os.tmpdir();
    const repoPath = path.join(tempDir, `${repoName}-${Date.now()}`);

    // Check if the repository directory already exists
    const repoExists = await fse.pathExists(repoPath);

    // If the repository exists, remove it
    if (repoExists) {
      console.log('Repository already exists. Removing...');
      await removeClonedRepository(repoPath);
      console.log('Repository removed successfully.');
    }

    // Clone the repository
    await simpleGit().clone(clone_url, repoPath);
    console.log('Repository cloned successfully.');
    
    return repoPath;
  } catch (error) {
    // console.error('Error cloning repository:', error);
    console.log('Error cloning repository:', error);
    // throw error;
  }
}

export async function removeClonedRepository(clonedRepoPath) {
  // ```Given tmp dir path of cloned repository, removes it```
    try {
      await fse.remove(clonedRepoPath);
      console.log('Cloned repository removed successfully.');
    } catch (err) {
      console.error('Error removing directory:', err);
      throw err; 
    }
  }