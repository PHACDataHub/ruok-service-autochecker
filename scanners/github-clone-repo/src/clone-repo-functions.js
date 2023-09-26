import * as fse from 'fs-extra'
import { simpleGit } from "simple-git";

export async function extractUrlParts(sourceCodeRepository) {
  const parts = sourceCodeRepository.split('/');
  const repoName = parts[parts.length - 1];
  const cloneUrl = `git@github.com:${parts[parts.length - 2]}/${repoName}.git`;

  return { repoName, cloneUrl };
}

export async function cloneRepository(clone_url, repo) {
    const repoPath = `../../temp-cloned-repo/${repo}`;
    try {
      const clonedRepoExists = await fse.pathExists(repoPath);
      if (clonedRepoExists) {
        // remove repo
        await removeClonedRepository(repoPath);
      }
  
      // Clone repo
      await simpleGit().clone(clone_url, repoPath);
      console.log('Repository cloned successfully.');
      return repoPath;
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw error; 
    }
  }

async function removeClonedRepository(clonedRepoPath) {
    try {
      await fse.remove(clonedRepoPath);
      console.log('Previously cloned repository removed successfully.');
    } catch (err) {
      console.error('Error removing directory:', err);
      throw err; 
    }
  }