// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec} from 'nats'
// import { initializeChecker } from './src/initialize-checker.js'
// import { cloneRepository, removeClonedRepository, formCloneUrl} from './src/clone-repo-functions.js'
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
  
const NATS_SUB_STREAM="ClonedRepoEvent"

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

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
    // decode payload 
        const clonedRepoEventPayload  = await jc.decode(message.data)
        // const { sourceCodeRepository, productName, repoName, cloneUrl } = clonedRepoEventPayload 

        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(clonedRepoEventPayload)}`)


    // SAVE to ArangoDB through API
        // const upsertService = await upsertClonedGitHubScanIntoDatabase(productName, sourceCodeRepository, results, graphQLClient)
    
    }
})();

await nc.closed();