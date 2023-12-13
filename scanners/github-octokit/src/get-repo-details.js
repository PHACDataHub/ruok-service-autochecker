import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class GetRepoDetailsStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit, branchName = 'main') {
    super(repoName, owner, octokit, branchName);

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
          'description': response.data.description,
          "name": response.data.name,
          "repo_description": response.data.description,
          "main_language": response.data.language, //TODO - if python - timeout re luc message cpho, react robot.txt...
          "visibility": response.data.visibility,
          "updated_at": response.data.updated_at, //TODO - there's also pushed out, but think this is for push to main - time since updated - re followups, tech debt, security
          "updated_at": response.data.updated_at,
          "pushed_at": response.data.pushed_at,
          "default_branch": response.data.default_branch, // TODO - use in branch protection checks...
          "html_url": response.data.html_url, // this is same as source code repository - not sure if needed or need to rename...
          "license": response.data.license ? response.data.license.spdx_id : null,
          "has_github_pages": response.data.has_pages,
          'security_and_analysis': response.data.security_and_analysis, // this only works if 
        }
      };
    } catch (error) {
      console.error("An error occurred while formatting the response:", error.message);
      throw error;
    }
  }
}
