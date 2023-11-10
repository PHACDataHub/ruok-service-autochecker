// TODO test using https://github.com/gitleaks/fake-leaks
// Reference https://github.com/gitleaks/gitleaks

// TODO - link to add config doc
// TODO - gitleaks protect . in ci?
// gitleaks protect --staged
// TODO - detail how to handle false positives (.gitleaksignore)
// TODO - document how to remove leaks from history, and how to check prior
// TODO - check if repo exists/ exits for other reasons (right now defaults to passes if no leaks found (for anyreasone))
// TODO - git guardian

// https://blog.gitguardian.com/rewriting-git-history-cheatsheet/
//  install git-filter-repo
// ORIGINAL==>REPLACEMENT in replacements.txt (in route)
// git filter-repo --replace-text ../replacements.txt
// git filter-repo --replace-text ../replacements.txt --force
// git push --all --tags --force

import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { spawn } from 'child_process';


// const clonedRepoPath = '/tmp/ruok-service-autochecker-1699630267330'

function extractSummaryInfo(summary) {
  // Runing gitleaks ouputs an ascii image, followed by results as a string if using -v, then the summary as stderr
  // It uses exit code of 0 for no leaks found, 1 if leaks are found, and 126 if unknown
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

  function extractDetailsInfo(details) {
    // Runing gitleaks ouputs an ascii image, followed by results as a string if using -v, then the summary as stderr
    // This pulls out the details section (minus the actual secret), and collects into an array
    const fileRegex = /File:\s+(.*)\n/;
    const lineRegex = /Line:\s+(\d+)\n/;
    const commitRegex = /Commit:\s+(.*)\n/;
    const authorRegex = /Author:\s+(.*)\n/;
    const emailRegex = /Email:\s+(.*)\n/;
    const dateRegex = /Date:\s+(.*)\n/;

    const detailsArray = Array.isArray(details) ? details : [details];

    return detailsArray.map((detail) => {
        return {
            File: detail.match(fileRegex) ? detail.match(fileRegex)[1] : null,
            Line: detail.match(lineRegex) ? parseInt(detail.match(lineRegex)[1]) : null,
            Commit: detail.match(commitRegex) ? detail.match(commitRegex)[1] : null,
            Author: detail.match(authorRegex) ? detail.match(authorRegex)[1] : null,
            Email: detail.match(emailRegex) ? detail.match(emailRegex)[1] : null,
            Date: detail.match(dateRegex) ? detail.match(dateRegex)[1] : null,
        };
    });
}
  

function runGitleaks(clonedRepoPath) {
  return new Promise((resolve) => {
    const gitleaksProcess = spawn('gitleaks', ['detect', '--source', clonedRepoPath, '-v']);
    let gitleaksDetails = '';
    let errorOutput = '';
    let exitCode = 0;

    gitleaksProcess.stdout.on('data', (data) => { // -v (verbose) part of gitleaks 
      gitleaksDetails += data.toString();
    });

    gitleaksProcess.stderr.on('data', (data) => { // this is where the summary lives as well
      errorOutput += data.toString();
    });

    gitleaksProcess.on('close', (code) => { 
      exitCode += code.toString();

      if ((code === 0 || code === 1) && errorOutput.includes('leaks found')) { // If leak is found, gitleaks uses exit code of 1 -otherwise, it's an error 
        const summaryInfo = extractSummaryInfo(errorOutput);
        const detailsArray = gitleaksDetails.split('Finding:');

        const result = {
            leaksFound: true,
            numberOfLeaks: summaryInfo.leaksFound,
            commitsScanned: summaryInfo.commitsScanned,
            details: [].concat(detailsArray.slice(1).map(extractDetailsInfo)),
          };
        return resolve(result);

      } else if (code === 126) {
        // This is an error - or unknown situation
        const result = {
            exitCode,
            leaksFound: null,
            errorMessage: 'An error was encountered running the Gitleaks check.',
        };
        return resolve(result);

      } else {
        const result = {
            leaksFound: false,
        };
        return resolve(result);
      }
    });
  });
}

 
  async function formatGitleaksResults(clonedRepoPath) {
    try {
        const result = await runGitleaks(clonedRepoPath);

        if (result.leaksFound == true) {
            return {
                checkPasses: false,
                metadata: result
            };
        } else if (result.leaksFound == null){
            return {
                checkPasses: null,
                metadata: result
            };
        } else {
          return {
            checkPasses: true,
            metadata: result
          };
        }
    } catch (error) {
        console.error(error.message);
    }
}


// const results = await formatGitleaksResults(clonedRepoPath)
// console.log(JSON.stringify(results, null, 2))

export class Gitleaks extends CheckOnClonedRepoInterface {
    constructor(repoName, clonedRepoPath) { 
        super(repoName, clonedRepoPath); 
        this.clonedRepoPath = clonedRepoPath;
        this.repoName = repoName
    }
    async doRepoCheck() {
        const gitleaksResult = await formatGitleaksResults(this.clonedRepoPath)
        return gitleaksResult
    }
}