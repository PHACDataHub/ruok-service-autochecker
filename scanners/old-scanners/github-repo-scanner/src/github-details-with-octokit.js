// Not entirely sure if these should be separate files - they kind of seem like they should.... keeping them here for now because it's
// easy to import and test. 
//https://octokit.rest/?query=/repos/%7Bowner%7D/%7Brepo%7D
// https://docs.github.com/en/free-pro-team@latest/rest/

// Security advisories • Enabled

import { Octokit, App,  RequestError } from "octokit";
const { 
  owner = 'PHACDataHub',
  token,
  // repo = "safe-inputs"
  repo = "it33-filtering"
  } = process.env;

// Authenicate with GitHub
const octokit = new Octokit({ 
    auth: token,
});



export async function getAllRepos(owner, octokit) {
    try {
        const response = await octokit.request('GET /orgs/{org}/repos', {
            org: owner,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
                }
        });
        // console.log(response.data)
        for (const i in response.data) {
            console.log(response.data[i].name)
        }
     
    } catch (error) {
        console.error('An error occurred:', error.message);
        console.log("")
    }
}

export async function licenceDetails(owner, repo, octokit) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/license', {
          owner: owner,
          repo: repo,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        console.log(response)
        // console.log("Licence:", response.data.license.spdx_id);
        return({"hasLicense": true, "license": response.data.license.spdx_id})
    
      } catch (error) {
        if (error.status === 404) {
            console.log('License not found for the repository')
            return({"hasLicense": false})
        } else {
            console.error('An error occurred:', error.message);
            return({"hasLicense": false})
        }
      }
    }

// licence = await licenceDetails(owner, repo, octokit)

export async function repoLanguages(owner, repo, octokit) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/languages', {
            owner: owner,
            repo: repo,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
    
        // console.log(response.data);
        return({"all-languages": response.data})
    } catch (error) {
        console.error("An error occurred while fetching repo langauges:", error.message);
    }
  }

export async function getFileContents(owner, repo, octokit, path) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: owner,
          repo: repo,
          path: path,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        // const names = repoContents.data.map(content => content.name);
        // console.log(names);
        console.log(response.data.path)
        console.log(Buffer.from(repoContents.data.content, 'base64').toString('utf-8'))
      } catch (error) {
        console.error("An error occurred while fetching repository contents:", error.message);
      }
    }
      
export async function getGithubPagesDetails(owner, repo, octokit) {
    try {
        const respGHPages = await octokit.request('GET /repos/{owner}/{repo}/pages', {
          owner: owner,
          repo: repo,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        console.log(respGHPages)
        console.log("url:", respGHPages.data.url);
        console.log("status:", respGHPages.data.status);
        console.log("https enforced:", respGHPages.data.https_enforced);
        console.log("protected domain state:", respGHPages.data.protected_domain_state)
        console.log("")
      } catch (error) {
        if (error.status === 404) {
          console.log("GitHub Pages are not found for this repository.");
          console.log("")
        } else {
          console.error("An error occurred while fetching GitHub Pages information:", error.message);
          console.log("")
        }
      }
    }

// required_pull_request_reviews

export async function getCodeScanningAlerts(owner, repo, octokit, branch) {
  // don't have permissions for this right now 
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
      owner: owner,
      repo: repo,
      branch: branch,
      headers: {
          'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log (response.data)
    return({
      "response": response.data
    })
  } catch (error) {
    console.error("An error occurred while fetching branch protection details:", error.message);
  }
}
// await getCodeScanningAlerts(owner, repo, octokit)
// don't have permissions for this right now 


export async function getBranchProtectionDetails(owner, repo, octokit, branch) {
  // don't have permissions for this right now 
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}/protection', {
      owner: owner,
      repo: repo,
      branch: branch,
      headers: {
          'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log (response.data)
    return({
      "protected": true,
      "response": response.data
    })
  } catch (error) {
    if (error.status === 404) {
      return({"protected": false})
    } else {
      console.error('An error occurred:', error.message);
      return({"protected": false})
    }
  }
}
// const test = await getBranchProtectionDetails(owner, repo, octokit, 'dns')
// console.log(test)


export async function getPullRequestProtection(owner, repo, octokit, branch) {
  // don't have permissions for this right now 
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews', {
      owner: owner,
      repo: repo,
      branch: branch,
      headers: {
          'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log (response.data)
    return({
      "protected": true,
      "response": response.data
    })
  } catch (error) {
    if (error.status === 404) {
      return({"protected": false})
    } else {
      console.error('An error occurred:', error.message);
      return({"protected": false})
    }
  }
}
// const test = await getPullRequestProtection(owner, repo, octokit, 'acm-core')
// console.log(test)


export async function getRepoDetails(owner, repo, octokit) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}', {
        owner: owner,
        repo: repo,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
        });
        return({
            "name": response.data.name,
            "description": response.data.description,
            "language": response.data.language, //TODO - if python - timeout re luc message cpho, react robot.txt...
            "visibility": response.data.visibility,
            "updated_at": response.data.updated_at, //TODO - there's also pushed out, but think this is for push to main - time since updated - re followups, tech debt, security
            "default_branch":response.data.default_branch, // TODO - use in branch protection checks...
            "clone_url": response.data.clone_url,
 
            "html_url": response.data.html_url,
            "created_at": response.data.created_at,
            "updated_at": response.data.updated_at,
            "pushed_at": response.data.pushed_at,
            "license": response.data.license,
            "has_pages": response.data.has_pages,
            // "all": response.data, // all langagus?
            // response.data.archived
        })
    
    } catch (error) {
        console.error("An error occurred while fetching repository details:", error.message);
    }
  }


// console.log("\n----- Dependabot -----")
// ----- Dependabot alerts - GET YOU ARE NOT AUTHORIZED TO DO THIS error for this one - I think we need to start with just checking if alerts 
//      enabled - not the alerts themselves at this point. 
// const response = await octokit.request('GET /repos/{owner}/{repo}/dependabot/alerts', {
//     owner: owner,
//     repo: repo,
//     // headers: {
//     //     'X-GitHub-Api-Version': '2022-11-28'
//     // }
//     });
// console.log(response.data);


// // vunerability alerts (https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#check-if-vulnerability-alerts-are-enabled-for-a-repository)
// // 404 not found 204 if is 
// const vunerabilityResponse = await octokit.request('GET /repos/{owner}/{repo}/vulnerability-alerts', {
//     owner: owner,
//     repo: repo,
//     headers: {
//         'X-GitHub-Api-Version': '2022-11-28'
//     }
//     });

// console.log(vunerabilityResponse.data.message);


// octokit.rest.codeScanning.listAlertsForRepo({
//     owner: owner,
//     repo: repo
//     });



// await octokit.request("POST /repos/{owner}/{repo}/issues", {
//     owner: "octocat",
//     repo: "hello-world",
//     title: "Hello, world!",
//     body: "I created this issue using Octokit!",
//   });

//   const { data } = await octokit.rest.repos.getContent({
//     mediaType: {
//       format: "raw",
//     },
//     owner: owner,
//     repo: repo,
//     path: "api/package.json",
//   });
//   console.log("package name: %s", JSON.parse(data).name);
// 

