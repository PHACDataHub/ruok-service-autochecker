
import * as fs from 'fs';
import { searchForFile, hasDependabotYaml } from '../wipe-later/old-separated-scanners/github-cloned-has-dependabot-yaml-check/src/has-dependabot-yaml.js';

describe('searchForFile function', () => {
    let testDirectory;

    beforeAll(() => {
        // create a temporary test directory and test files
        testDirectory = './src/__tests__/temp-test-directory';
        fs.mkdirSync(testDirectory, { recursive: true });
        fs.writeFileSync(`${testDirectory}/file1.txt`, '');
        fs.writeFileSync(`${testDirectory}/file2.txt`, '');
        fs.mkdirSync(`${testDirectory}/subdir`);
        fs.writeFileSync(`${testDirectory}/subdir/file3.txt`, '');
    });

    afterAll(() => {
        // clean up
        fs.rmdirSync(testDirectory, { recursive: true });
    });

    it('should find files with a given name', () => {
        const foundFiles = searchForFile(testDirectory, 'file1.txt');

        expect(foundFiles).toHaveLength(1);
        expect(foundFiles).toContain(`${testDirectory}/file1.txt`);
    });

    it('should return an empty array if no files match', () => {
        const foundFiles = searchForFile(testDirectory, 'nonexistent.txt');

        expect(foundFiles).toHaveLength(0);
    });
});

describe('hasDependabotYaml function', () => {
    let testDirectory

    beforeAll(() => {
        testDirectory = `./temp-test-directory`;
        if (!fs.existsSync(testDirectory)) {
            fs.mkdirSync(testDirectory);
        }
    });

    afterAll(() => {
        console.log('Cleaning up...');
        if (fs.existsSync(testDirectory)) {
            fs.rmdirSync(testDirectory, { recursive: true }, (err) => {
                if (err) {
                    console.error('Error removing directory:', err);
                } else {
                    console.log('Directory removed successfully.');
                }
            });
        }
    });
    it('should return true if a dependabot YAML file exists', async () => {
        // create a dependabot YAML file
        fs.writeFileSync(`${testDirectory}/dependabot.yaml`, '');
        const hasDependabotFile = await hasDependabotYaml(testDirectory);

        expect(hasDependabotFile).toBe(true); // Should return true because we created the file
    });

    it('should return true if a dependabot YML file exists', async () => {
        // remove YAML
        fs.unlinkSync(`${testDirectory}/dependabot.yaml`);
        // create a dependabot YML file 
        fs.writeFileSync(`${testDirectory}/dependabot.yml`, '');
        const hasDependabotFile = await hasDependabotYaml(testDirectory);

        expect(hasDependabotFile).toBe(true); 
    });

    it('should return false if no dependabot yaml/yml file exists', async () => {
        fs.unlinkSync(`${testDirectory}/dependabot.yml`);
        const hasDependabotFile = await hasDependabotYaml(testDirectory);

        expect(hasDependabotFile).toBe(false); 
    });
});
