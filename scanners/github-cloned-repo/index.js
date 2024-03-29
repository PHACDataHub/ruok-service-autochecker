// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec } from 'nats'

import { initializeChecker } from './src/initialize-checker.js'
import { cloneRepository, removeClonedRepository } from './src/clone-remove-repo.js'
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
            console.log ('repoPath', repoPath, '\n')

            // Instantiate and do the check(s)
            const checkName = 'allChecks'
            const check = await initializeChecker(checkName, repoName, repoPath)
            const results = await check.doRepoCheck()

            console.log('Scan Results:',results)
 
            // Mutation to add a graph for the new endpoints
            // TODO: refactor this into a testable query builder function

            // TODO: figure out why this only works with 'trivyRepoVulnerability', where it's coded as 'trivy_repo_vulnerability'
            //      in api, etc
            const mutation = gql`
            mutation {
                githubEndpoint(
                    endpoint: {
                        url: "${gitHubEventPayload.endpoint}"
                        kind: "Github"
                        owner: "${orgName}"
                        repo: "${repoName}"
                        api: ${results.hasApiDirectory.checkPasses}                       
                        hasSecurityMd: {
                            checkPasses: ${results.hasSecurityMd.checkPasses}
                            metadata: ${results.hasSecurityMd.metadata}
                        },
                        hasDependabotYaml: {
                            checkPasses: ${results.hasDependabotYaml.checkPasses}
                            metadata: ${results.hasDependabotYaml.metadata}
                        },
                        gitleaks: {
                            checkPasses: ${results.gitleaks ? results.gitleaks.checkPasses : null}
                            metadata: ${results.gitleaks ? JSON.stringify(results.gitleaks.metadata, null, 4).replace(/"([^"]+)":/g, '$1:') : {}}
                        },
                        hadolint: {
                            checkPasses: ${results.hadolint ? results.hadolint.checkPasses : null}
                            metadata: ${JSON.stringify(results.hadolint.metadata, null, 4).replace(/"([^"]+)":/g, '$1:')}
                        }
                        trivyRepoVulnerability: {
                            checkPasses: ${results.trivy_repo_vulnerability ? results.trivy_repo_vulnerability.checkPasses : null}

                            metadata: ${results.trivy_repo_vulnerability && results.trivy_repo_vulnerability.metadata !== undefined ?
                                JSON.stringify(results.trivy_repo_vulnerability.metadata, null, 4).replace(/"([^"]+)":/g, '$1:') :
                                null
                            }
                        }                       
                    }
                )
            }`;
            console.log('*************************\n',mutation,'\n*************************\n')
    
            // New GraphQL client - TODO: remove hard-coded URL
            try {
                const graphqlClient = new GraphQLClient(GRAPHQL_URL);

                // Write mutation to GraphQL API
                const mutationResponse = await graphqlClient.request(mutation);
                console.log('Scan results saved to database.')

            } catch (error) {
                console.error("An error occurred - unable to save to the database.", error);
            }
            
            // Remove temp repository
            await removeClonedRepository(repoPath)
        }
    })();

await nc.closed();

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/ruok-service-autochecker\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/acm-core\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/it33-filtering\"}"

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/phac-bots\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/pelias-canada\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/safe-inputs\"}"
// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/data-catalog\"}"


// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/cpho-phase2\"}"

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/phac-bots\"}"

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/phac-dns\"}" 

// nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/django-phac_aspc-helpers\"}" 

