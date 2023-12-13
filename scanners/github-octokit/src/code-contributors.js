
// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28
import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class CodeContributorsStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit, branchName = 'main') {
    super(repoName, owner, octokit, branchName);

    this.endpoint = 'GET /repos/{owner}/{repo}/contributors'
    this.options = {
      owner: this.owner,
      repo: this.repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };
  }


  async formatResponse() {
    try {
      const response = await this.makeOctokitRequest()
      const loginNames = response.data.map(contributor => contributor.login);

      return {
        checkPasses: null,
        metadata: {
          'code-contributors': loginNames
        }
      }
    } catch (error) {
      console.error("An error occurred while formatting the response:", error.message);
      throw error;
    }
  }
}