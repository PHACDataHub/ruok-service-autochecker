// github-octokit-repo-details/index.js

import { connect, JSONCodec } from 'nats'
import { Octokit } from "octokit"
import { GraphQLClient, gql } from 'graphql-request';
import { AllChecksStrategy } from './src/all-checks.js';

import 'dotenv-safe/config.js'

const {
  NATS_URL,
  GITHUB_TOKEN,
  NATS_SUB_STREAM,
  GRAPHQL_URL,
} = process.env;

// Also note - this will be appended with repo name when published. 
// Authenicate with GitHub 
const octokit = new Octokit({ auth: GITHUB_TOKEN, });

// NATs connection 
const nc = await connect({ servers: NATS_URL, })
const jc = JSONCodec();

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
  ; (async () => {

    for await (const message of sub) {
      const gitHubEventPayload = await jc.decode(message.data)

      console.log('\n**************************************************************')
      console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(gitHubEventPayload)}`)
      // GitHub urls always follow `github.com/orgName/repoName`, so from this
      // structure we can construct the org name and repo name.
      const prefix = (new URL(gitHubEventPayload.endpoint)).pathname.split("/")
      const orgName = prefix[1];
      const repoName = prefix[2];

      const branchName = 'main' // TODO - come back for this after initial pass - when picked up by repodetails
      const check = new AllChecksStrategy(repoName, orgName, octokit, branchName);

      const payload = await check.formatResponse(check);
      // Mutation to add a graph for the new endpoints
      // TODO: refactor this into a testable query builder function
      const mutation = gql`
        mutation {
          githubEndpoint(
            endpoint: {
              url: "${gitHubEventPayload.endpoint}"
              kind: "Github"
              owner: "${orgName}"
              repo: "${repoName}"
              license: "${payload.GetRepoDetailsStrategy.metadata.license}"
              visibility: "${payload.GetRepoDetailsStrategy.metadata.visibility}"
              programmingLanguage: ["${Array.from(Object.keys(payload.ProgrammingLanguagesStrategy.metadata)).join('", "')}"]
              automatedSecurityFixes: {
                checkPasses: ${payload.AutomatedSecurityFixesStrategy.checkPasses}
                metadata: {
                  enabled: ${payload.AutomatedSecurityFixesStrategy.metadata.enabled}
                  paused: ${payload.AutomatedSecurityFixesStrategy.metadata.paused}
                }
              },
              vulnerabilityAlerts: {
                checkPasses: ${payload.VunerabilityAlertsEnabledStrategy.checkPasses}
                metadata: ${JSON.stringify(payload.VunerabilityAlertsEnabledStrategy.metadata)}
              },
              branchProtection: {
                checkPasses: ${payload.BranchProtectionStrategy.checkPasses}
                metadata: {
                  branches: ["${Array.from(payload.BranchProtectionStrategy.metadata.branches).join('", "')}"]
                  rules: ["${Array.from(payload.BranchProtectionStrategy.metadata.rules).join('", "')}"]
                }
              }
            }
          )
        }
        `;

      console.log('*************************\n',mutation,'\n*************************\n')        

      // New GraphQL client - TODO: remove hard-coded URL
      const graphqlClient = new GraphQLClient(GRAPHQL_URL);
      // Write mutation to GraphQL API
      const mutationResponse = await graphqlClient.request(mutation);
      console.log("GraphQL mutation submitted", mutationResponse);
    }
  })();

await nc.closed();


// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/ruok-service-autochecker\"}"