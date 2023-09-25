// github-gitignore-check/index.js

import { connect, JSONCodec} from 'nats'
import { searchIgnoreFile } from './src/get-dotignore-details.js'
import 'dotenv-safe/config.js'

const { 
//   owner = 'PHACDataHub',
//   token,
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "gitHub.cloned.>",
  NATS_PUB_STREAM = "gitHub.checked.gitignore" 
} = process.env;


// NATs connection 
const nc = await connect({ 
  servers: NATS_URL,
})
const jc = JSONCodec(); // for encoding NAT's messages

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

async function publish(subject, payload) {
  nc.publish(subject, jc.encode(payload)) 
}

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject} \n`)
        
        const payloadFromCloneRepo  = await jc.decode(message.data)
        console.log(payloadFromCloneRepo)
        
        const serviceName = message.subject.split(".").reverse()[0]

        const { repoName } = payloadFromCloneRepo
        const gitignoreDetails = await searchIgnoreFile(repoName, '.gitignore')
        const dockerignoreDetails = await searchIgnoreFile(repoName, '.dockerignore')    
 
        console.log(gitignoreDetails, dockerignoreDetails)

        await publish(`${NATS_PUB_STREAM}.${serviceName}`, {gitignoreDetails, dockerignoreDetails}) //To clone repo and octokit details 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${serviceName}: `, )
    }
})();

await nc.closed();
