import * as fse from 'fs-extra'
import { simpleGit } from "simple-git"
import os  from 'os'
import path from 'path'

export async function formCloneUrl(sourceCodeRepository) {
  // ```Forms cloneurl from sourceCodeRepository```
  const parts = sourceCodeRepository.split('/');
  const repoName = parts[parts.length - 1];
  const cloneUrl = `git@github.com:${parts[parts.length - 2]}/${repoName}.git`;
  return { cloneUrl };
}


export async function cloneRepository(clone_url, repoName) {
  // ```Clones Repository into tmp directory - returns path```
  try {
    const tempDir = os.tmpdir();
    const repoPath = path.join(tempDir, `${repoName}-${Date.now()}`)

    await simpleGit().clone(clone_url, repoPath)
    console.log('Repository cloned successfully.')
    return repoPath

  } catch (error) {
    console.error('Error cloning repository:', error);
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