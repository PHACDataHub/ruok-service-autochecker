// extract-branches.js

import { Octokit } from 'octokit';
// import { BranchProtectionStrategy } from './path-to-your-branch-protection-module'; // Replace with the actual path


const {
    NATS_URL,
    GITHUB_TOKEN,
    GITHUB_TOKEN_CLASSIC,
    NATS_SUB_STREAM,
    GRAPHQL_URL,
  } = process.env;
  
// Also note - this will be appended with repo name when published. 
// Authenicate with GitHub 
const octokit = new Octokit({ auth: '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' , });
// console.log(GITHUB_TOKEN_CLASSIC)


const orgName = 'PHACDataHub';
// const repoName = 'dns';
const repoName = 'cpho-phase2'



async function getRepoBranches(orgName, repoName, octokit) {
    const graphqlVars = {
        orgName: orgName,
        repoName: repoName,
      };

    const repoBranches = await octokit.graphql(
        `query getExistingRepoBranches($orgName: String!, $repoName: String!) {
          organization(login: $orgName) {
            repository(name: $repoName) {
              id
              name
              refs(refPrefix: "refs/heads/", first: 20) {
                edges {
                  node {
                    branchName:name
                  }
                }
                pageInfo {
                  endCursor #use this value to paginate through repos with more than 100 branches
                }
              }
            }
          }
        }`,
        graphqlVars,
      )
      const branches = repoBranches.organization.repository.refs.edges.map(({ node }) => node.branchName);

      return branches
    }

    

const x = await getRepoBranches(orgName, repoName, octokit)
console.log(JSON.stringify(x, null, 4))