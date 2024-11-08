// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec } from 'nats';

import { initializeChecker } from './src/initialize-checker.js';
import {
  cloneRepository,
  removeClonedRepository,
} from './src/clone-remove-repo.js';
import { GraphQLClient, gql } from 'graphql-request';
import 'dotenv-safe/config.js';

const { NATS_URL, GRAPHQL_URL, NATS_SUB_STREAM, GITHUB_TOKEN_CLASSIC } =
  process.env;

// API connection
const graphQLClient = new GraphQLClient(GRAPHQL_URL);

// NATs connection
const nc = await connect({ servers: NATS_URL });
const jc = JSONCodec();

const sub = nc.subscribe(NATS_SUB_STREAM);
console.log(
  '🚀 Connected to NATS server - listening on ...',
  sub.subject,
  'channel...',
);

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
(async () => {
  for await (const message of sub) {
    // decode payload
    const gitHubEventPayload = await jc.decode(message.data);

    console.log(
      `\n****************************** ${new Date()} ********************************`,
    );
    console.log(
      `Recieved from ... ${message.subject}:\n ${JSON.stringify(gitHubEventPayload)}`,
    );

    // GitHub urls always follow `github.com/orgName/repoName`, so from this
    // structure we can construct the org name and repo name.
    const prefix = new URL(gitHubEventPayload.endpoint).pathname.split('/');
    const orgName = prefix[1];
    const repoName = prefix[2];

    console.log('orgName', orgName);
    console.log('repoName', repoName);

    // Clone repository
    try {
      const repoPath = await cloneRepository(
        gitHubEventPayload.endpoint,
        repoName,
        GITHUB_TOKEN_CLASSIC,
      );
      console.log('repoPath', repoPath, '\n');

      // Instantiate and do the check(s)
      const checkName = 'allChecks';
      const check = await initializeChecker(checkName, repoName, repoPath);
      const results = await check.doRepoCheck();
      // Mutation to add a graph for the new endpoints
      // TODO: refactor this into a testable query builder function

      // TODO: figure out why this only works with 'trivyRepoVulnerability', where it's coded as 'trivy_repo_vulnerability'
      //      in api, etc
      const mutation = gql`
        mutation addGraph(
          $url: String!
          $owner: String!
          $repo: String!
          $api: Boolean!
          $hasSecurityMd: CheckPassesInput
          $hasDependabotYaml: CheckPassesInput
          $gitleaks: CheckPassesInput
          $hadolint: CheckPassesInput
          $trivyRepoVulnerability: CheckPassesInput
        ) {
          githubEndpoint(
            endpoint: {
              url: $url
              kind: "Github"
              owner: $owner
              repo: $repo
              api: $api
              hasSecurityMd: $hasSecurityMd
              hasDependabotYaml: $hasDependabotYaml
              gitleaks: $gitleaks
              hadolint: $hadolint
              trivyRepoVulnerability: $trivyRepoVulnerability
            }
          )
        }
      `;

      const variables = {
        url: gitHubEventPayload.endpoint,
        owner: orgName,
        repo: repoName,
        api: results.hasApiDirectory.checkPasses,
        hasSecurityMd: results.hasSecurityMd,
        hasDependabotYaml: results.hasDependabotYaml,
        gitleaks: results.gitleaks,
        hadolint: results.hadolint,
        trivyRepoVulnerability: results.trivy_repo_vulnerability,
      };
      //console.log('*************************\n',mutation,'\n*************************\n')

      // New GraphQL client - TODO: remove hard-coded URL
      try {
        const graphqlClient = new GraphQLClient(GRAPHQL_URL);

        // Write mutation to GraphQL API
        const mutationResponse = await graphqlClient.request(
          mutation,
          variables,
        );
        console.log('Scan results saved to database.');
      } catch (error) {
        console.error(
          'An error occurred - unable to save to the database.',
          error,
        );
      }

      // Remove temp repository
      await removeClonedRepository(repoPath);
    } catch (error) {}
  }
})();

await nc.closed();
