// hadolint.test.js
// NOTE - this will need hadolint installed to run tests

import { Hadolint, runHadolintOnDockerfile, hadolintRepo } from '../hadolint.js'
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdtemp = promisify(fs.mkdtemp);
const rmdir = promisify(fs.rmdir);


describe('Hadolint', () => {
    let tempDir;

    beforeAll(async () => {
        // Set up: create a temporary directory for the test Dockerfile
        tempDir = await mkdtemp('/tmp/hadolint-test-');
      });
    
      afterAll(async () => {
        // Tear down: remove the temporary directory
        await rmdir(tempDir, { recursive: true });
      });

    test('runHadolintOnDockerfile should lint a Dockerfile', async () => {
      const dockerfilePath = path.join(tempDir, 'test-dockerfile');
      const dockerfileContent = `
        # Dockerfile with linting errors for testing
  
        # Incorrect order of commands
        WORKDIR /app
        COPY . /app
  
        # Running apt-get without updating
        RUN apt-get install -y nginx
  
        # Incorrect CMD format
        CMD "nginx"
      `;
  
      // Write the Dockerfile content to the temporary directory
      fs.writeFileSync(dockerfilePath, dockerfileContent);
  
      const results = await runHadolintOnDockerfile(dockerfilePath);
      expect(results).toHaveLength(0);
    });
  
    test('hadolintRepo should lint Dockerfiles in a repo', async () => {
      // Similar setup steps as above for creating Dockerfiles in the temporary directory
      const clonedRepoPath = path.join(tempDir, 'cloned-repo');
      const results = await hadolintRepo(clonedRepoPath);
      expect(results).toHaveLength(0);
    });
  
    test('doRepoCheck should check a cloned repo for hadolint', async () => {
      const repoName = 'your-repo-name';
      const clonedRepoPath = path.join(tempDir, 'cloned-repo');
      const hadolintChecker = new Hadolint(repoName, clonedRepoPath);
      const result = await hadolintChecker.doRepoCheck();
      expect(result.checkPasses).toBeTruthy();
    });
  });
