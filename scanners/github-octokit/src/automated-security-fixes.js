
// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28
// dependabot enabled
import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class AutomatedSecurityFixesStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit) {
    super(repoName, owner, octokit);

    this.endpoint = 'GET /repos/{owner}/{repo}/automated-security-fixes'
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
      const {
        enabled,
        paused
      } = response.data;
      return {
        checkPasses: enabled,
        metadata: {
          enabled: enabled,
          paused: paused,

        } 
      }
    } catch (error) {
      throw {
        'dependabot': `error: ${error.message}` 
      }
    }
  }
}
