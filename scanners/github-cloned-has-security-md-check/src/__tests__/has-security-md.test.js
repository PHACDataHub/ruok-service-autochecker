
import * as fs from 'fs';
import { searchForFile, hasSecurityMd  } from '../has-security-md.js';

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

describe('hasSecurityMd function', () => {
    let testDirectory;

    beforeAll(() => {
        // Create a temporary test directory and SECURITY.md file
        testDirectory = './temp-test-directory';
        fs.mkdirSync(testDirectory, { recursive: true });
        fs.writeFileSync(`${testDirectory}/SECURITY.md`, '');
    });

    afterAll(() => {
        // Clean up the temporary test directory
        fs.rmdirSync(testDirectory, { recursive: true });
    });

    it('should return true if a SECURITY.md file exists', async () => {
        const securityMdFound = await hasSecurityMd(testDirectory);

        expect(securityMdFound).toBe(true);
    });

    it('should return false if no SECURITY.md file exists', async () => {
        // Delete the SECURITY.md file to simulate absence
        fs.unlinkSync(`${testDirectory}/SECURITY.md`);
        const securityMdFound = await hasSecurityMd(testDirectory);

        expect(securityMdFound).toBe(false);
    });
});


