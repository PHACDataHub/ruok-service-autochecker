// https://cloud.google.com/artifact-registry/docs/nodejs/store-nodejs

import { connect, JSONCodec} from 'nats'
import { GraphQLClient } from 'graphql-request'
import 'dotenv-safe/config.js'

const { 
    NATS_URL,
    API_URL,
  } = process.env;
  
const NATS_SUB_STREAM="WebEvent"

// API connection 
const graphQLClient = new GraphQLClient(API_URL);

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
        const WebEventPayload  = await jc.decode(message.data)
        const { url } = WebEventPayload

        // console.log('\n**************************************************************')
        // console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(gitHubEventPayload)}`)

    // Clone repository
        // const repoPath = await cloneRepository(cloneUrl, repoName) 


        console.log(repoPath)
    // SAVE to ArangoDB through API
        
    
    // Remove temp repository
        // await removeClonedRepository(repoPath) 
    }
})();

await nc.closed();