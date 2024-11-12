// github-octokit-repo-details/index.js

import { connect, JSONCodec } from 'nats';
import { Octokit } from 'octokit';
import { GraphQLClient, gql } from 'graphql-request';
import { AllChecksStrategy } from './src/all-checks.js';

import 'dotenv-safe/config.js';

const {
  NATS_URL,
  GITHUB_TOKEN_FINE_GRAINED,
  GITHUB_TOKEN_CLASSIC,
  NATS_SUB_STREAM,
  GRAPHQL_URL,
} = process.env;

// Authenicate with GitHub

const octokit = new Octokit({ auth: GITHUB_TOKEN_CLASSIC });
// const octokit = new Octokit({ auth: GITHUB_TOKEN_FINE_GRAINED, });

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

    const check = new AllChecksStrategy(repoName, orgName, octokit);
    const result = await check.formatResponse(check);

    console.log(result);

    // TODO: refactor this into a testable query builder function
    const mutation = gql`
      mutation CreateGithubEndpoint(
        $url: String!
        $kind: String!
        $owner: String!
        $repo: String!
        $description: String
        $visibility: String!
        $license: String
        $programmingLanguages: [String!]!
        $automatedSecurityFixes: CheckPassesInput
        $vulnerabilityAlerts: CheckPassesInput
        $branchProtection: CheckPassesInput
      ) {
        githubEndpoint(
          endpoint: {
            url: $url
            kind: $kind
            owner: $owner
            repo: $repo
            description: $description
            visibility: $visibility
            license: $license
            programmingLanguage: $programmingLanguages
            automatedSecurityFixes: $automatedSecurityFixes
            vulnerabilityAlerts: $vulnerabilityAlerts
            branchProtection: $branchProtection
          }
        )
      }
    `;

    // Define the variables
    const variables = {
      url: gitHubEventPayload.endpoint,
      kind: 'Github',
      owner: orgName,
      repo: repoName,
      description: result.GetRepoDetailsStrategy.metadata.description || null,
      visibility: result.GetRepoDetailsStrategy.metadata.visibility,
      license: result.GetRepoDetailsStrategy.metadata.license || 'null',
      programmingLanguages: Object.keys(
        result.ProgrammingLanguagesStrategy.metadata,
      ),
      automatedSecurityFixes: result.AutomatedSecurityFixesStrategy,
      vulnerabilityAlerts: result.VulnerabilityAlertsEnabledStrategy,
      branchProtection: result.BranchProtectionStrategy,
    };

    // New GraphQL client - TODO: remove hard-coded URL
    const graphqlClient = new GraphQLClient(GRAPHQL_URL);

    // Write mutation to GraphQL API
    const mutationResponse = await graphqlClient.request(mutation, variables);
    console.log('GraphQL mutation submitted', mutationResponse);
  }
})();

await nc.closed();

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/ruok-service-autochecker\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/cpho-phase2\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/it33-filtering\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/phac-bots\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/pelias-canada\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/safe-inputs\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/phac-dns\"}"

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/django-phac_aspc-helpers\"}"

// securityAndAnalysis: "${JSON.stringify(result.GetRepoDetailsStrategy.metadata.security_and_analysis, null, 4).replace(/"([^"]+)":/g, '$1:')}"
