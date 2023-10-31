// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec} from 'nats'


import { initializeChecker } from './src/initialize-checker.js'
import { cloneRepository, removeClonedRepository } from './src/clone-repo-functions.js'
import { parseYamlFile } from './src/yaml-parser.js';
import { Database } from "arangojs";
import { GraphQLClient } from 'graphql-request'
import 'dotenv-safe/config.js'

const { 
    DB_NAME,
    DB_URL,
    DB_USER, 
    DB_PASS,
    NATS_URL,
    API_URL,
  } = process.env;
  
const NATS_SUB_STREAM="GitHubEvent"
const NATS_PUB_STREAM="WebEvent"

// API connection 
const graphQLClient = new GraphQLClient(API_URL);

// Database connection 
const db = new Database({
  url: DB_URL,
  databaseName: DB_NAME,
  auth: { username: DB_USER, password: DB_PASS },
});

// NATs connection 
const nc = await connect({ servers: NATS_URL,})
const jc = JSONCodec()

async function publish(subject, payload) {
    nc.publish(subject, jc.encode(payload)) 
    console.log(`Sent to ... ${subject}: `, payload)
  }

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
    // decode payload 
        const gitHubEventPayload  = await jc.decode(message.data)
        const { sourceCodeRepository, productName, repoName, cloneUrl } = gitHubEventPayload

        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(gitHubEventPayload)}`)

    // Clone repository
        const repoPath = await cloneRepository(cloneUrl, repoName) 

    // parse .product.yaml and dispatch (publish as NATs message)
        const productYamlData = await parseYamlFile(`${repoPath}/.product.yaml`);
        publish(`${NATS_PUB_STREAM}.${productName}`, productYamlData)

    // Instantiate and do the check(s)
        const checkName = 'allChecks' 
        const check = await initializeChecker(checkName, repoName, repoPath)
        const results = await check.doRepoCheck()

        console.log(JSON.stringify(results)) // to see inside arrays
        console.log(results)

    // SAVE to ArangoDB through API
        // const upsertService = await upsertClonedGitHubScanIntoDatabase(productName, sourceCodeRepository, results, graphQLClient)
    
    // Remove temp repository
        await removeClonedRepository(repoPath) 
    }
})();

await nc.closed();