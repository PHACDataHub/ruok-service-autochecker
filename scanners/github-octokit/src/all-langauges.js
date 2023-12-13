import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class ProgrammingLanguagesStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit, branchName = 'main') {
    super(repoName, owner, octokit, branchName);

    this.endpoint = 'GET /repos/{owner}/{repo}/languages'
    this.options = {
      owner: this.owner,
      repo: this.repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };
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

    const repoLanguages = await this.octokit.graphql(
      `query($orgName:String!, $repoName: String!) {
        repository(owner: $orgName, name: $repoName) {
          languages(first:10) {
            edges {
              node {
                name
                color
              }
            }
          }
        }
      }`,
      graphqlVars,
    )
    //   __  __      _            _       _        
    //  |  \/  | ___| |_ __ _  __| | __ _| |_ __ _ 
    //  | |\/| |/ _ \ __/ _` |/ _` |/ _` | __/ _` |
    //  | |  | |  __/ || (_| | (_| | (_| | || (_| |
    //  |_|  |_|\___|\__\__,_|\__,_|\__,_|\__\__,_|
    const metadata = repoLanguages.repository.languages.edges.reduce((obj, item) => {
      return {
        ...obj,
        [item.node.name]: item.node.color,
      };
    }, {});

    return {
      checkPasses: null,
      metadata,
    }
  }
}
