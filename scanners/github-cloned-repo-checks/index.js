// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec } from 'nats'

import { initializeChecker } from './src/initialize-checker.js'
import { cloneRepository, removeClonedRepository } from './src/clone-repo-functions.js'
import { GraphQLClient, gql } from 'graphql-request'
import 'dotenv-safe/config.js'

const {
    NATS_URL,
    GRAPHQL_URL,
    NATS_SUB_STREAM
} = process.env;


// API connection 
const graphQLClient = new GraphQLClient(GRAPHQL_URL);

// NATs connection 
const nc = await connect({ servers: NATS_URL, })
const jc = JSONCodec()

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
    ; (async () => {

        for await (const message of sub) {
            // decode payload 
            const gitHubEventPayload = await jc.decode(message.data)

            console.log('\n**************************************************************')
            console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(gitHubEventPayload)}`)

            // GitHub urls always follow `github.com/orgName/repoName`, so from this
            // structure we can construct the org name and repo name.
            const prefix = (new URL(gitHubEventPayload.endpoint)).pathname.split("/")
            const orgName = prefix[1];
            const repoName = prefix[2];

            console.log('orgName', orgName)
            console.log('repoName', repoName)

            // Clone repository
            const repoPath = await cloneRepository(gitHubEventPayload.endpoint, repoName)
            console.log ('repoPath', repoPath)

            // Instantiate and do the check(s)
            const checkName = 'allChecks'
            // const checkName = 'gitleaks'
            const check = await initializeChecker(checkName, repoName, repoPath)
            const results = await check.doRepoCheck()

            console.log('Scan Results:',results)
            console.log('gitleaks metadata',results.gitleaks.metadata)
            console.log('gitleaks stingified metadata',JSON.stringify(results.gitleaks.metadata))

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
                        hasSecurityMd: {
                            checkPasses: ${results.hasSecurityMd.checkPasses}
                            metadata: {}
                        },
                        hasDependabotYaml: {
                            checkPasses: ${results.hasDependabotYaml.checkPasses}
                            metadata: {}
                        },
                        gitleaks: {
                            checkPasses: ${results.gitleaks.checkPasses}
                            metadata: ${JSON.stringify(results.gitleaks.metadata, null, 4).replace(/"([^"]+)":/g, '$1:')}
                        }
                    }
                )
            }
            `;
            // New GraphQL client - TODO: remove hard-coded URL
            const graphqlClient = new GraphQLClient(GRAPHQL_URL);
            // Write mutation to GraphQL API
            const mutationResponse = await graphqlClient.request(mutation);
            console.log('saved to database!')
            
            // Remove temp repository
            await removeClonedRepository(repoPath)
    
        }
    })();

await nc.closed();

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/ruok-service-autochecker\"}"