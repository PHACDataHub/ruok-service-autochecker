// copied from github-repo-scanner
import { simpleGit } from "simple-git";
import * as fse from 'fs-extra'
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function cloneDnsRepository() {
  // const repoPath = `../../temp-cloned-repo/${repo}`;
  const repoPath = path.join(__dirname, 'temp-cloned-repo', "dns");
  const clone_url = "git@github.com:PHACDataHub/dns.git"
  try {
    const clonedRepoExists = await fse.pathExists(repoPath);
    if (clonedRepoExists) {
      // remove repo
      await removeClonedDnsRepository(repoPath);
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

export async function removeClonedDnsRepository() {
  const clonedRepoPath = path.join(__dirname, 'temp-cloned-repo', 'dns');
  try {
    await fse.remove(clonedRepoPath);
    console.log('Previously cloned repository removed successfully.');
  } catch (err) {
    console.error('Error removing directory:', err);
    throw err; 
  }
}
