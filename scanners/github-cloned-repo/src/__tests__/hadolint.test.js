// hadolint.test.js
// NOTE - this will need hadolint installed to run tests

import { Hadolint, runHadolintOnDockerfile, hadolintRepo } from '../hadolint.js'
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fsPromises} from 'fs';


describe('Hadolint runHadolintOnDockerfile', () => {
  let testRepoPath;

  beforeEach(async () => {
      // Set up temp dir
      testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); // added timestamp to eliminate race conditions
      await fsPromises.mkdir(testRepoPath, { recursive: true });
    });
  
  afterEach(async () => {
    await fsPromises.rm(testRepoPath, { recursive: true, force: true });
  });
  // const hadolintPath = await fsPromises.mkdir(`${testRepoPath}/docs`, { recursive: true });

  it('should lint a Dockerfile', async () => {
      const dockerfilePath = path.join(testRepoPath, 'Dockerfile');
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
      // fs.writeFileSync(dockerfilePath, dockerfileContent);
      await fsPromises.writeFile(dockerfilePath, dockerfileContent); 
      const results = await runHadolintOnDockerfile(dockerfilePath);

      expect(results).toHaveLength(7);
    });
  
    // it ('should lint Dockerfiles in a repo', async () => {

    //   const clonedRepoPath = path.join(tempDir, 'cloned-repo');
    //   const results = await hadolintRepo(clonedRepoPath);
    //   expect(results).toHaveLength(0);
    // });
  
    // test('doRepoCheck should check a cloned repo for hadolint', async () => {
    //   const repoName = 'your-repo-name';
    //   const clonedRepoPath = path.join(tempDir, 'cloned-repo');
    //   const hadolintChecker = new Hadolint(repoName, clonedRepoPath);
    //   const result = await hadolintChecker.doRepoCheck();
    //   expect(result.checkPasses).toBeTruthy();
    // });
  });
