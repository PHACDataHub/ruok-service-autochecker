// don't think this is needed anymore, given that we have branch-protection in place (with requiresApprovingReviews)
import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class PullRequestProtectionStrategy extends OctokitCheckStrategy {
    constructor(repoName, owner, octokit, branchName = 'main') {
        super(repoName, owner, octokit, branchName);

        this.endpoint = 'GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews'
        this.options = {
            owner: this.owner,
            repo: this.repo,
            branch: this.branch,
            headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            },
        };
    }

    async formatResponse() {
        try {
            const response = await this.makeOctokitRequest();
            if (response.status == 204) {
                return {
                    checkPasses: true,
                    metadata: null,
                }   
            }
        } catch (error) {
          // if (error.status == 404){
          if (error.message == 'Branch not protected'){
            return {
                checkPasses: false,
                metadata: null,
            }  
          } else {
            throw {
              'pull_request_protection': `error: ${error.message}`
            }
          }
        }
    }
}