import {  existsSync, rmSync } from 'fs';
import * as fse from 'fs-extra';
import { hasDependabotYaml, HasDependabotYaml } from '../has-dependabot-yaml.js';


describe('hasDependabotYaml function', () => {
    let testDirectory

    beforeEach(() => {
        testDirectory = './temp-dir/temp-repo';
        fse.ensureDirSync(testDirectory);
    });

    afterEach(() => {
        if (existsSync(testDirectory)) {
          rmSync(testDirectory, { recursive: true });
        }
    });


    it('should return true if a dependabot YAML file exists at root', async () => {
        // create a dependabot YAML file
        fse.ensureDirSync(`${testDirectory}/dependabot.yaml`, '');

        const hasDependabotFile = await hasDependabotYaml(testDirectory);
        expect(hasDependabotFile).toBe(true); 
    });

    it('should return true if a dependabot YAML file exists not at the root', async () => {
        fse.ensureDirSync(`${testDirectory}/dir2/subdir2/dependabot.yaml`);
        const hasDependabotFile = await hasDependabotYaml(testDirectory);

        expect(hasDependabotFile).toBe(true); 
    });

    it('should return true if a dependabot YML file exists', async () => {
        fse.ensureDirSync(`${testDirectory}/dir2/dependabot.yml`);
        const hasDependabotFile = await hasDependabotYaml(testDirectory);

        expect(hasDependabotFile).toBe(true); 
    });

    it('should return false if no dependabot yaml/yml file exists', async () => {
        fse.ensureDirSync(`${testDirectory}/dir2/subdir2/bob.yaml`);
        const hasDependabotFile = await hasDependabotYaml(testDirectory);

        expect(hasDependabotFile).toBe(false); 
    });
});

describe('HasDependabotYaml class', () => {
    let testDirectory

    beforeEach(() => {
        testDirectory = './temp-dir/temp-repo';
        fse.ensureDirSync(testDirectory);
    });

    afterEach(() => {
        if (existsSync(testDirectory)) {
          rmSync(testDirectory, { recursive: true });
        }
    });

    it('should pass if dependabot.yaml(s) are found', async () => {
        const repoName = 'test-repo';
        // create subdirectories in the temp directory
        fse.ensureDirSync(`${testDirectory}/dir2/__tests__`);
        fse.ensureDirSync(`${testDirectory}/dir1/sub1`);
        fse.ensureDirSync(`${testDirectory}/dir2/subdir2/dependabot.yaml`);
    
        const checker = new HasDependabotYaml(repoName, testDirectory);
        const result = await checker.doRepoCheck();
    
        expect(result.checkPasses).toBeTruthy();

      });
    
      it('should fail if no dependabot.yaml are found', async () => {
        const repoName = 'test-repo';
        // create subdirectories in the temp directory
        fse.ensureDirSync(`${testDirectory}/dir2`);
        fse.ensureDirSync(`${testDirectory}/dir1/sub1`);
        fse.ensureDirSync(`${testDirectory}/dir2/subdir2`);
    
        const checker = new HasDependabotYaml(repoName, testDirectory);
        const result = await checker.doRepoCheck();
    
        expect(result.checkPasses).toBeFalsy();
        expect(result.metadata).toBeNull();
      });
    });
    


  