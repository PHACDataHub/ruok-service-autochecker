import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class GetRepoDetailsStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit) {
    super(repoName, owner, octokit);

    this.endpoint = 'GET /repos/{owner}/{repo}'
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
      const response = await this.makeOctokitRequest();

      return {
        checkPasses: null,
        metadata: {
          "name": response.data.name,
          "description": response.data.description || null,
          "main_language": response.data.language, //TODO - if python - timeout re luc message cpho, react robot.txt...
          "visibility": response.data.visibility,
          "main_branch_updated_at": response.data.updated_at, //TODO - there's also pushed out, but think this is for push to main - time since updated - re followups, tech debt, security
          "any_branch_pushed_at": response.data.pushed_at,
          "license": response.data.license ? response.data.license.spdx_id : null,
          "has_github_pages": response.data.has_pages,
          'security_and_analysis': response.data.security_and_analysis || null, // this only works for public repos at the moment!
        }
      };
    } catch (error) {
      console.error("An error occurred while formatting the response:", error.message);
      throw error;
    }
  }
}
