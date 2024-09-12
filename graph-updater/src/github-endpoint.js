import { Octokit } from 'octokit';

import 'dotenv-safe/config.js';

import { getEndpointKind } from './endpoint.js';
import { cloneRepository } from './utils.js';
import { ScanEndpoints } from './scan-endpoints.js';

const { GITHUB_TOKEN } = process.env;

export class GithubEndpoint {
  constructor() {
    this.octokit = new Octokit({ auth: GITHUB_TOKEN });
  }

  /**
   * For GitHub endpoints, graph metadata is specified in `.product.yaml`
   * files in the repository root.
   */
  async getGraphMetaData(payload) {
    // GitHub urls always follow `github.com/orgName/repoName`, so from this
    // structure we can construct the org name and repo name.
    const prefix = new URL(payload.endpoint).pathname.split('/');
    const repoName = prefix[2];

    const clonedRepoPath = cloneRepository(
      (clone_url = payload.endpoint),
      (repoName = repoName),
      (GITHUB_TOKEN = GITHUB_TOKEN),
    );

    const endPointsScanner = new ScanEndpoints(
      (repoName = repoName),
      (clonedRepoPath = clonedRepoPath),
    );

    const extraEndpoints = await endPointsScanner.doRepoCheck();

    const payloadEndpointKind = getEndpointKind(payload.endpoint)[0];
    var kind = payloadEndpointKind.split('E')[0];
    console.log(kind);
    kind = kind[0].toUpperCase() + kind.substring(1);
    var newEndpoints = new Set([
      `{url : "${payload.endpoint}", kind : "${kind}"}`,
      ...extraEndpoints,
    ]);
    console.log('New endpoints: ', newEndpoints);
    return newEndpoints;
  }

  /**
   * Given a yaml object, extract all endpoints and return a set of all endpoints
   * found.
   * @param {Object} yamlObj
   */
  extractEndpoints(yamlObj) {
    return new Set([
      ...(yamlObj.webEndpoints || []).map(
        (endpoint) => `{url : "${endpoint}", kind : "Web"}`,
      ),
      ...(yamlObj.githubEndpoints || []).map(
        (endpoint) => `{url : "${endpoint}", kind : "Github"}`,
      ),
      ...(yamlObj.containerEndpoints || []).map(
        (endpoint) => `{url : "${endpoint}", kind : "Container"}`,
      ),
    ]);
  }
}
