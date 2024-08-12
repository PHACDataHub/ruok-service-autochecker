import { GithubEndpoint } from "./github-endpoint.js"
import { WebEndpoint } from "./web-endpoint.js"
import { ContainerEndpoint } from "./container-endpoint.js"
import { GenericEndpoint } from "./generic-endpoint.js"

export function getEndpoint(kind) {
  switch (kind) {
    case "githubEndpoint": return new GithubEndpoint()
    case "webEndpoint": return new WebEndpoint()
    case "containerEndpoint": return new ContainerEndpoint()
    default: return new GenericEndpoint()
  }
}
/**
 * Events from GitHub Webhooks usually correspond to GitHub endpoints,
 * with the exception that DNS A records are managed through a specific
 * GitHub repository. In this special case, there are 
 * @param {string} url 
 * @returns 
 */
export function getEndpointKind(url) {
  const githubEndpoint = "githubEndpoint";
  const webEndpoint = "webEndpoint";
  const containerEndpoint = "containerEndpoint";
  // TODO: Right now, these go from most specific to least specific. The
  // rationale is to have the first value in the array correspond to the
  // endpoint that the metadata check will happen on. E.g. the DNS github
  // repository is a web endpoint and a github endpoint, but for the
  // purposes of collecting metadata, we want to parse the DNS A records in
  // the repo rather than look for a .product.yaml file.
  const matches = [];

  // If the webhook is from the DNS repo, we need to create a message
  // for two updates: one that scans the contents of the DNS repo, and
  // another to scan the DNS GitHub repository itself.
  if (url.endsWith("dns")) {
    matches.push(webEndpoint);
  }
  if (url.includes("docker.pkg.dev")) {
    matches.push(containerEndpoint);
  }
  if (url.includes("canada.ca") || url.includes("gc.ca")) {
    matches.push(webEndpoint);
  }
  if (url.includes("github.com")) {
    matches.push(githubEndpoint);
  }

  return matches;
}
