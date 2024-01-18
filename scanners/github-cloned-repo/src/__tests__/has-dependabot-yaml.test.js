import * as fse from 'fs-extra';
import { hasDependabotYaml, HasDependabotYaml } from '../has-dependabot-yaml.js';
import path from 'path';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fsPromises} from 'fs';
import * as fs from 'fs'

describe('hasDependabotYaml function', () => {
  let testRepoPath;

  beforeEach(() => {
    testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
    fse.ensureDirSync(testRepoPath);
  });

  afterEach(() => {
      if (fs.existsSync(testRepoPath)) {
        // fs.rmSync(testRepoPath, { recursive: true, force: true });
        fs.rmSync(testRepoPath, { recursive: true});
      }
  });

  it('should return true if a dependabot YAML file exists at root', async () => {
      // create a dependabot YAML file
      const dependabotFilePath = path.join(testRepoPath, 'dependabot.yaml');
      await fsPromises.writeFile(dependabotFilePath, '');

      const hasDependabotFile = await hasDependabotYaml(testRepoPath);
      expect(hasDependabotFile).toBe(true); 
  });

  it('should return true if a dependabot YAML file exists up tree', async () => {
      fse.ensureDirSync(`${testRepoPath}/dir2/subdir2/dependabot.yaml`);
      const hasDependabotFile = await hasDependabotYaml(testRepoPath);

      expect(hasDependabotFile).toBe(true); 
  });

  it('should return true if a dependabot "YML" file exists', async () => {
      fse.ensureDirSync(`${testRepoPath}/dir2/dependabot.yml`);
      const hasDependabotFile = await hasDependabotYaml(testRepoPath);

      expect(hasDependabotFile).toBe(true); 
  });

  it('should return false if no dependabot yaml/yml file exists', async () => {
      fse.ensureDirSync(`${testRepoPath}/dir2/subdir2/bob.yaml`);
      const hasDependabotFile = await hasDependabotYaml(testRepoPath);

      expect(hasDependabotFile).toBe(false); 
  });
});

describe('HasDependabotYaml class', () => {
  let testRepoPath;

  // beforeEach(async () => {
  //     // Set up temp dir
  //     testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
  //     await fsPromises.mkdir(testRepoPath, { recursive: true });
  //     await fsPromises.mkdir(`${testRepoPath}/docs`, { recursive: true });
  //   });
  
  // afterEach(async () => {
  //   await fsPromises.rm(testRepoPath, { recursive: true, force: true });
  // });
  beforeEach(() => {
    testRepoPath = join(tmpdir(), `test-repo-${Date.now()}`); 
    fse.ensureDirSync(testRepoPath);
  });

  afterEach(() => {
      if (fs.existsSync(testRepoPath)) {
        // fs.rmSync(testRepoPath, { recursive: true, force: true });
        fs.rmSync(testRepoPath, { recursive: true});
      }
  });

  it('should pass if dependabot.yaml(s) are found', async () => {
      const repoName = 'test-repo';
      // create subdirectories in the temp directory
      fse.ensureDirSync(`${testRepoPath}/dir2/__tests__`);
      fse.ensureDirSync(`${testRepoPath}/dir1/sub1`);
      fse.ensureDirSync(`${testRepoPath}/dir2/subdir2/dependabot.yaml`);
  
      const checker = new HasDependabotYaml(repoName, testRepoPath);
      const result = await checker.doRepoCheck();
  
      expect(result.checkPasses).toBeTruthy();

    });
  
    it('should fail if no dependabot.yaml are found', async () => {
      const repoName = 'test-repo';
      // create subdirectories in the temp directory
      fse.ensureDirSync(`${testRepoPath}/dir2`);
      fse.ensureDirSync(`${testRepoPath}/dir1/sub1`);
      fse.ensureDirSync(`${testRepoPath}/dir2/subdir2`);
  
      const checker = new HasDependabotYaml(repoName, testRepoPath);
      const result = await checker.doRepoCheck();
  
      expect(result.checkPasses).toBeFalsy();
      expect(result.metadata).toBeNull();
    });
  });
    


  