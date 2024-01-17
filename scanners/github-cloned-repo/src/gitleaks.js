// TODO test using https://github.com/gitleaks/fake-leaks
// Reference https://github.com/gitleaks/gitleaks

import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { spawn } from 'child_process';
import { readFile, mkdtemp, rm } from 'fs/promises';
import { once } from 'events';
import os from 'os';
import path from 'path';


export function extractSummaryInfo(summary) {
  // Runing gitleaks ouputs an ascii image, followed by results as a string if using -v, then the summary as stderr
  // It uses exit code of 0 for no leaks found, 95 if leaks are found, and anthing else is error
  // This pulls out the leaks found, and number of commits scanned. 
    const leaksFoundRegex = /leaks found: (\d+)/;
    const commitsScannedRegex = /(\d+) commits scanned/;
  
    const leaksFoundMatch = summary.match(leaksFoundRegex);
    const commitsScannedMatch = summary.match(commitsScannedRegex);
  
    const leaksFound = leaksFoundMatch ? parseInt(leaksFoundMatch[1]) : 0;
    const commitsScanned = commitsScannedMatch ? parseInt(commitsScannedMatch[1]) : 0;
  
    return {
      leaksFound,
      commitsScanned
    };
  }


export async function readGitleaksOutputFile(reportFilePath) {
  // Reads contents of gitleaks output file, filters for specific fields and returns array of results
  try {
    const data = await readFile(reportFilePath, 'utf-8');
    const jsonData = JSON.parse(data);

    if (jsonData) {
      const filteredDetails = jsonData.map(detail => ({
        Description: detail.Description,
        File: detail.File,
        StartLine: detail.StartLine,
        EndLine: detail.EndLine,
        StartColumn: detail.StartColumn,
        EndColumn: detail.EndColumn,
        Commit: detail.Commit,
        Author: detail.Author,
        Email: detail.Email,
      }));
      return filteredDetails;
    } else {
      return [];
    }
  } catch (error) {
    console.log(`Error reading or parsing JSON file: ${error.message}`);
  }
}


export async function runGitleaks(clonedRepoPath) {
  try {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'gitleaks-'));
    const reportFilePath = path.join(tempDir, 'gitleaks-report.json');

    const gitleaksProcess = spawn('gitleaks', [
      'detect',
      '--source', clonedRepoPath,
      '-v',
      '--redact',
      '--no-banner',
      '--exit-code', 95,
      '-f', 'json',
      '-r', reportFilePath,
    ]);

    let errorOutput = '';
    let results

    // Extract summary form sterr and exit code
    gitleaksProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    const [code] = await once(gitleaksProcess, 'close');

    // Get details from the report output as json file
    const gitleaksJson = await readGitleaksOutputFile(reportFilePath);

    // Remove temp dir
    try {
      await rm(tempDir, { recursive: true });
      // console.log(`Temporary directory ${tempDir} removed.`);
    } catch (removeError) {
      console.error(`Error removing temporary directory ${tempDir}: ${removeError.message}`);
    }

    if (code === 95 && errorOutput.includes('leaks found')) {
      const summaryInfo = extractSummaryInfo(errorOutput);

      results = {
        leaksFound: true,
        numberOfLeaks: summaryInfo.leaksFound,
        commitsScanned: summaryInfo.commitsScanned,
        details: gitleaksJson,
      };
    } else if (code === 0) {
      results = {
        leaksFound: false,
      };
    } else {
      results = {
        exitCode: code,
        leaksFound: null,
        errorMessage: 'An error was encountered running the Gitleaks check.',
      };
    }

    return results

  } catch (error) {
    console.error(error.message);
    return {
      exitCode: -1, 
      leaksFound: null,
      errorMessage: 'An unexpected error occurred.',
    };
  }
}


export class Gitleaks extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    
    async doRepoCheck() {
      try {
        const gitleaksResult = await runGitleaks(this.clonedRepoPath);
        let checkPasses

        if (gitleaksResult.leaksFound == true) {
          checkPasses = false
        } else if (gitleaksResult.leaksFound == null){
            checkPasses = null
        } else {
          checkPasses = true
        }

        return {
          checkPasses: checkPasses,
          metadata: gitleaksResult
        }
    } catch (error) {
        console.error(error.message);
    }
  }
}