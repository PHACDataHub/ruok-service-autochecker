// github-save-to-database/index.js

import { upsertGitHubScanIntoDatabase, getGitHubRepositoryFromServicesCollection } from "./src/database-functions.js";
import { connect, JSONCodec} from 'nats'
import { Database } from "arangojs";
import { request, gql, GraphQLClient } from 'graphql-request'
import 'dotenv-safe/config.js'

const { 
  DB_NAME = "dataServices",
  // DB_URL = "http://database:8529",
  DB_URL = "http://0.0.0.0:8529",
  DB_USER = "root",
  DB_PASS = 'yourpassword',
  NATS_URL = "nats://0.0.0.0:4222",
  API_URL = "http://0.0.0.0:4000/graphql"
} = process.env;

const NATS_SUB_STREAM = "gitHub.saveToDatabase.>" 

// API connection 
const graphQLClient = new GraphQLClient(API_URL);

// Database connection 
const db = new Database({
  url: DB_URL,
  databaseName: DB_NAME,
  auth: { username: DB_USER, password: DB_PASS },
});

// NATs connection 
const nc = await connect({ 
  servers: NATS_URL,
})
const jc = JSONCodec(); // for encoding NAT's messages
const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

async function publish( subject, payload) {
  nc.publish(subject, jc.encode(payload)) 
}

// await upsertGitHubScanIntoDatabase('epicenter', 'repoName', {'five': 5}, graphQLClient)

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject} \n`)
        
        const payloadFromDoneCollector  = await jc.decode(message.data)
        console.log(payloadFromDoneCollector)

        const serviceName = message.subject.split(".").reverse()[0]

        // get gitHubRepository from services collection for that serviceName
        try{
            const gitHubRepository = await getGitHubRepositoryFromServicesCollection(serviceName, graphQLClient) // get repo url from services collection - will combine later
            const upsertService = await upsertGitHubScanIntoDatabase(serviceName, gitHubRepository, payloadFromDoneCollector, graphQLClient)
            console.log(`Saved ${serviceName} GitHub scan results to database - services collection`)
        } catch {
            console.log('Errors saving ${serviceName} GitHub Scan results to database')
        }
    }
})();

await nc.closed();

