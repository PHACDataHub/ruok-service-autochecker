
// Trivy filesystem scan - looks for vunerablities based on lock files. 
// https://aquasecurity.github.io/trivy/v0.17.2/scanning/filesystem/

// Note trivy has scan remote Git Repository functionality, but only available for public repositories. Since, we
// have the repositories cloned and available as filesystems, we will be using that option instead. 

import { spawn } from 'child_process';
import path from 'path';
import { mkdtemp, rm } from 'fs/promises';
import os from 'os';
import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import fs from 'fs'


async function runTrivyScan(clonedRepoPath) {
    try {
        // create temp output file path 
        const tempDir = await mkdtemp(path.join(os.tmpdir(), 'trivy-'));
        const scanResultsFilePath = path.join(tempDir, 'trivy-report.json');

        // run trivy
        const trivyProcess = spawn('trivy', [
            'fs',
            '-f', 'json',
            '-o', scanResultsFilePath,
            // '--scanners', 'vuln',
            // '--scanners', 'misconfig',
            // '--scanners', 'license', // need to npm install for this to work 
            clonedRepoPath
        ]);

        trivyProcess.stderr.on('data', (data) => {
            console.error(`Trivy stderr: ${data}`);
        });

        const code = await new Promise((resolve) => {
            trivyProcess.on('close', resolve);
        });

        console.log(`Trivy process exited with code ${code}`);

        if (code === 0) {
            console.log(`Trivy scan completed successfully. Results saved to ${scanResultsFilePath}`);
            const results = await parseScanResults(scanResultsFilePath);

            // remove temp dir with results
            await rm(tempDir, { recursive: true });
            // console.log(`Temporary directory ${tempDir} removed.`);

            return results;
        } else {
            console.error('Trivy scan failed.');
            throw new Error('trivy failed');
        }
    } catch (error) {
        console.error(`Error in runTrivyScan: ${error.message}`);
        throw error;
    }
}


async function parseScanResults(scanResultsFilePath){
    // Reads trivy results from the json file, and pulls out relevant vunerability summary
    let results = []
    try {
        const jsonData = fs.readFileSync(scanResultsFilePath, 'utf8');
        const json = JSON.parse(jsonData);

        // check for "Results"  in data
        if (json && json.Results && Array.isArray(json.Results)) {
            json.Results.forEach(result => {
                // Check if the "Vulnerabilities" in each result
                if (result.Vulnerabilities && Array.isArray(result.Vulnerabilities)) {

                    result.Vulnerabilities.forEach(vulnerability => {
                        results.push({
                            library: vulnerability.PkgName,
                            vulnerabilityID: vulnerability.VulnerabilityID,
                            severity: vulnerability.Severity,
                            installedVersion: vulnerability.InstalledVersion,
                            fixedVersion: vulnerability.FixedVersion || 'N/A',
                            title: vulnerability.Title,
                            url: vulnerability.PrimaryURL
                        });
 
                    });
                }
            });
            // console.log('*****************')
            // console.log(results)
            return results
        }

    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return []
    }
}



export class TrivyRepo extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) {
        super(repoName, clonedRepoPath);
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName;
    }

    async doRepoCheck() {
        try {
            const trivyRepoResult = await runTrivyScan(this.clonedRepoPath); 
      
            return {
              checkPasses: (trivyRepoResult == 0),
              metadata: trivyRepoResult
            }

        } catch (error) {
            console.error(error.message);
            return {
                checkPasses: null,
                metadata: {
                errorMessage: 'An unexpected error occurred with trivy check.',
                },
            };
        }
    }
}