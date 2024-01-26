// export async function getBranchProtectionDetails(owner, repo, octokit, branch) {
// https://docs.github.com/en/rest/branches/branches?apiVersion=2022-11-28#get-branch-protection


import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class BranchProtectionStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit) {
    super(repoName, owner, octokit);

    this.options = {
      owner: this.owner,
      repo: this.repo,
      // branch: this.branchName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
    // this.endpoint = 'GET /repos/{owner}/{repo}/branches/main/protection'
  }
  async formatResponse() {
    //    ____                 _      ___  _     
    //   / ___|_ __ __ _ _ __ | |__  / _ \| |    
    //  | |  _| '__/ _` | '_ \| '_ \| | | | |    
    //  | |_| | | | (_| | |_) | | | | |_| | |___ 
    //   \____|_|  \__,_| .__/|_| |_|\__\_\_____|
    //                  |_|        
    const graphqlVars = {
      orgName: this.owner,
      repoName: this.repo,
    }

    const branchProtectionRules = await this.octokit.graphql(
      `query MyQuery($orgName: String!, $repoName: String!)  {
        repository(name: $repoName, owner: $orgName) {
          branchProtectionRules(first: 10) {
            edges {
              node {
                allowsDeletions
                allowsForcePushes
                blocksCreations
                dismissesStaleReviews
                isAdminEnforced
                lockAllowsFetchAndMerge
                lockBranch
                pattern
                requireLastPushApproval
                requiredApprovingReviewCount
                requiredDeploymentEnvironments
                requiresApprovingReviews
                requiresCodeOwnerReviews
                requiresCommitSignatures
                requiresConversationResolution
                requiresDeployments
                requiresLinearHistory
                requiresStatusChecks
                requiresStrictStatusChecks
                restrictsPushes
                restrictsReviewDismissals
              }
            }
          }
        }
      }`,
      graphqlVars
    )

    //   __  __      _            _       _        
    //  |  \/  | ___| |_ __ _  __| | __ _| |_ __ _ 
    //  | |\/| |/ _ \ __/ _` |/ _` |/ _` | __/ _` |
    //  | |  | |  __/ || (_| | (_| | (_| | || (_| |
    //  |_|  |_|\___|\__\__,_|\__,_|\__,_|\__\__,_|

    console.log('extracting metadata')

  
   const metadata = this.extractMetadata(branchProtectionRules); 

    //    ____ _               _    
    //   / ___| |__   ___  ___| | __
    //  | |   | '_ \ / _ \/ __| |/ /
    //  | |___| | | |  __/ (__|   < 
    //   \____|_| |_|\___|\___|_|\_\

    const checkPasses = this.passesCheck(metadata);
    return {
      checkPasses,
      metadata, 
    }
  }
  
  extractMetadata(branchProtectionRules) {
    // picks out branch ('pattern'), rules that are set to true, requiredApprovingReviewCount if <0 and requiredDeploymentEnvironments if non-empty
    
    // Get branch protection rules (octokit graphql query)
    const rules = branchProtectionRules.repository.branchProtectionRules.edges;
  
    // console.log(JSON.stringify(rules, null, 4));
  
    // transform rules to pick out only relevant ones
    let transformedRules = [];
  
    if (rules !== undefined && rules.length !== 0) {
      transformedRules = rules.map(({ node }) => {
        const trueKeys = Object.entries(node) 
          .filter(([key, value]) => value === true)
          .map(([key]) => key);
  
        const { pattern, requiredApprovingReviewCount, requiredDeploymentEnvironments } = node; // keys that don't have boolean values 
  
        const transformedRule = {
          branch: pattern,
          ...trueKeys.reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {}),
        };
  
        // Include requiredApprovingReviewCount only if it's greater than 0
        if (requiredApprovingReviewCount > 0) {
          transformedRule.requiredApprovingReviewCount = requiredApprovingReviewCount;
        }
  
        // Include requiredDeploymentEnvironments only if it's non-empty
        if (requiredDeploymentEnvironments && requiredDeploymentEnvironments.length > 0) {
          transformedRule.requiredDeploymentEnvironments = requiredDeploymentEnvironments;
        }
  
        return transformedRule; // add to transformed rules array (note don;t have an example with more than one branch with protection, imagine this will need to be modified in the future to accomidate)
      });
  
      // console.log(transformedRules);
    }
  
    // if (transformedRules == []){
    //   transformedRules = null;
    // }
    return {rules: transformedRules};
  }
    
  passesCheck(metadata) {
    // At least one protected branch rule matches branch in repository
    return metadata.rules.length > 0;
  }
}
