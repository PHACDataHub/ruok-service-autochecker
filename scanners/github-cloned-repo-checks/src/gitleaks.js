// TODO test using https://github.com/gitleaks/fake-leaks
// Reference https://github.com/gitleaks/gitleaks
//  -r - report paht, -v verboth -f json -f json 

// exit codes 0 - no leaks present
// 1 - leaks or error encountered
// 126 - unknown flag


// gitleaks detect -f json --report-path gitleaks-report.json -b=/tmp/ruok-service-autochecker-1699554151272
// gitleaks detect --report-path gitleaks-report.json -b=/tmp/ruok-service-autochecker-1699554151272
import { resourceLimits } from 'worker_threads';
import { CheckOnClonedRepoInterface } from './check-on-cloned-repo-interface.js'
import { exec, spawn } from 'child_process';
// import { promisify } from 'util';


const clonedRepoPath = '/tmp/ruok-service-autochecker-1699554151272'

// function runGitleaks(clonedRepoPath) {
//     return new Promise((resolve, reject) => {
//       const gitleaksProcess = spawn('gitleaks', ['detect', '--source', clonedRepoPath, '-v']);
//       let gitleaksOutput = '';
  
//       gitleaksProcess.stdout.on('data', (data) => {
//         gitleaksOutput += data.toString();
//       });
  
//       gitleaksProcess.stderr.on('data', (data) => {
//         console.error(`gitleaks stderr: ${data}`);
//       });
  
//       gitleaksProcess.on('close', (code) => {
//         console.log(`gitleaks process exited with code ${code}`);
  
//         if ((code === 0 || code === 1) && gitleaksOutput.includes('leaks found')) {
//           const result = {
//             code,
//             leaksFound: true,
//             output: gitleaksOutput
//           };
//           resolve(result);
//         } else {
//           reject(new Error('No leaks found or unexpected error.'));
//         }
//       });
//     });
//   }
  
//   // Usage

  
//   runGitleaks(clonedRepoPath)
//     .then((result) => {
//       console.log('Result:', result);
//     })
//     .catch((error) => {
//       console.error('Error:', error.message);
//     });

// // const execPromisified = promisify(exec);

function extractSummaryInfo(summary) {
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
    const fileRegex = /File:\s+(.*)\n/;
    const lineRegex = /Line:\s+(\d+)\n/;
    const commitRegex = /Commit:\s+(.*)\n/;
    const authorRegex = /Author:\s+(.*)\n/;
    const emailRegex = /Email:\s+(.*)\n/;
    const dateRegex = /Date:\s+(.*)\n/;
  
    const fileMatch = details.match(fileRegex);
    const lineMatch = details.match(lineRegex);
    const commitMatch = details.match(commitRegex);
    const authorMatch = details.match(authorRegex);
    const emailMatch = details.match(emailRegex);
    const dateMatch = details.match(dateRegex);
  
    const extractedInfo = {
      File: fileMatch ? fileMatch[1] : null,
      Line: lineMatch ? parseInt(lineMatch[1]) : null,
      Commit: commitMatch ? commitMatch[1] : null,
      Author: authorMatch ? authorMatch[1] : null,
      Email: emailMatch ? emailMatch[1] : null,
      Date: dateMatch ? dateMatch[1] : null,
    };
  
    return extractedInfo;
}

function runGitleaks(clonedRepoPath) {
    return new Promise((resolve, reject) => {
      const gitleaksProcess = spawn('gitleaks', ['detect', '--source', clonedRepoPath, '-v']);
      let gitleaksDetails = '';
      let errorOutput = '';
      let exitCode = 0;
  
      gitleaksProcess.stdout.on('data', (data) => { // -v part of gitleaks 
        gitleaksDetails += data.toString();
        // console.log(gitleaksDetails);
      });
  
      gitleaksProcess.stderr.on('data', (data) => { // ths is where the summary lives as well
        errorOutput += data.toString();
        // console.log(errorOutput);
      });
  
      gitleaksProcess.on('close', (code) => { 
        exitCode += code.toString();
        // console.log(exitCode);
  
        if ((code === 0 || code === 1) && errorOutput.includes('leaks found')) { // If leak is found, gitleaks uses exit code of 1 -otherwise, it's an error 
            const summaryInfo = extractSummaryInfo(errorOutput);
            const detailsInfo = extractDetailsInfo(gitleaksDetails);
            
            const result = {
            //   exitCode,
                leaksFound: true,
                numberOfLeaks: summaryInfo.leaksFound,
                commitsScanned: summaryInfo.commitsScanned,
                details: extractDetailsInfo(gitleaksDetails),
            };
            return resolve(result);
        } else {
            const result = {
                exitCode,
                leaksFound: false,
            };
            return resolve(result);
            // return reject(new Error('No leaks found or unexpected error.'));
        }
      });
    });
  }
 
  async function formatGitleaksResults(clonedRepoPath) {
    try {
      const result = await runGitleaks(clonedRepoPath);
      
      if (!result.leaksFound) {
        return {
          checkPasses: true,
          metadata: result
        };
      } else {
        return {
          checkPasses: false,
          metadata: result
        };
      }
    } catch (error) {
      console.error(error.message);
    }
  }

// const results = await formatGitleaksResults(clonedRepoPath)
// console.log(results)

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