// github-clone-repo/index.js

import { connect, JSONCodec} from 'nats'
import { cloneRepository, extractUrlParts} from "./src/clone-repo-functions.js"
import 'dotenv-safe/config.js'

const { 
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "gitHub.initiate.>",
  NATS_PUB_STREAM = 'gitHub.cloned' 
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
        
        const payloadFromGitHubInitiate  = await jc.decode(message.data)
        console.log(payloadFromGitHubInitiate)

        const { sourceCodeRepository } = payloadFromGitHubInitiate
        const { repoName, cloneUrl } = await extractUrlParts(sourceCodeRepository)
        
        const serviceName = message.subject.split(".").reverse()[0]
        
        await cloneRepository(cloneUrl, repoName)

        console.log('NATS_PUB_STREAM: ', NATS_PUB_STREAM)
        console.log('service', serviceName)

        await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'repoName':repoName}) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${serviceName}: `, {'repoName':repoName})
    }
})();

await nc.closed();
