import * as fse from 'fs-extra';
import { simpleGit } from 'simple-git';
import os from 'os';
import path from 'path';

/**
 * TODO: tidy up the API for this helper function.
 * @param {*} natsClient
 * @param {*} queueName
 * @param {*} endpointList
 */
export async function publishToNats(
  natsClient,
  encoder,
  queueName,
  endpointList,
) {
  for (let i = 0; i < endpointList.length; i++) {
    await natsClient.publish(
      queueName,
      encoder.encode({
        endpoint: endpointList[i],
      }),
    );
  }
}

export async function cloneRepository(clone_url, repoName, GITHUB_TOKEN) {
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

    clone_url = `https://${GITHUB_TOKEN}@${clone_url.split('https://')[1]}`;
    console.log(clone_url);

    // Clone the repository
    await simpleGit().clone(clone_url, repoPath);
    console.log('Repository cloned successfully.');

    return repoPath;
  } catch (error) {
    // console.error('Error cloning repository:', error);
    console.log('Error cloning repository:', error);
    throw error;
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
