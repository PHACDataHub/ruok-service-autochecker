import { Octokit } from "octokit"

import { load } from "js-yaml";

import 'dotenv-safe/config.js'

import { getEndpointKind } from "./endpoint.js"

const { GITHUB_TOKEN } = process.env

const GRAPH_METADATA_NAME = ".product.yaml";


export class GithubEndpoint {
  constructor() {
    this.octokit = new Octokit({ auth: GITHUB_TOKEN, });
  }

  /**
   * For GitHub endpoints, graph metadata is specified in `.product.yaml`
   * files in the repository root.
   */
  async getGraphMetaData(payload) {
    // GitHub urls always follow `github.com/orgName/repoName`, so from this
    // structure we can construct the org name and repo name.
    const prefix = (new URL(payload.endpoint)).pathname.split("/")
    const orgName = prefix[1];
    const repoName = prefix[2];
    let extraEndpoints = new Set([]);
    // Try and get a .product.yaml file from the root of the repository
    try{
      const response = await this.octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}', {
        owner: orgName,
        repo: repoName,
        path: GRAPH_METADATA_NAME
      }
      )
      extraEndpoints = new Set([]);
      if (response && response.status === 200) {
        // base64 decode to ascii, then parse ascii string to yaml object
        const productDotYaml = load(
          Buffer
            .from(response.data.content, 'base64')
            .toString('ascii')
        );
        // Create list of endpoints associated with this endpoint
        extraEndpoints = this.extractEndpoints(productDotYaml);
      }
    }
    catch(error){
      if(error.status == 404){
        console.log("No product yaml found");
      }
    }
    const payloadEndpointKind = getEndpointKind(payload.endpoint)[0];
    var kind = payloadEndpointKind.split("E")[0];
    console.log(kind)
    kind = kind[0].toUpperCase() + kind.substring(1);
    var newEndpoints = new Set([
      `{url : "${payload.endpoint}", kind : "${kind}"}`,
      ...extraEndpoints
    ]);
    console.log("New endpoints: ", newEndpoints);
    return newEndpoints;
  }

  
  /**
   * Given a yaml object, extract all endpoints and return a set of all endpoints
   * found.
   * @param {Object} yamlObj 
   */
  extractEndpoints(yamlObj) {
    return new Set([
      ...((yamlObj.webEndpoints || []).map(endpoint => `{url : "${endpoint}", kind : "Web"}`)),
      ...((yamlObj.githubEndpoints || [])).map(endpoint => `{url : "${endpoint}", kind : "Github"}`),
      ...((yamlObj.containerEndpoints || [])).map(endpoint => `{url : "${endpoint}", kind : "Container"}`),
    ])
  }
}
