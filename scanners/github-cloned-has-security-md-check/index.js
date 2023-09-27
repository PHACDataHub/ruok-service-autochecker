// github-cloned-has-security-md-check/index.js

import { connect, JSONCodec} from 'nats'
import { hasSecurityMd } from './src/has-security-md.js'
import 'dotenv-safe/config.js'

const { 
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "gitHub.cloned.>",
  NATS_PUB_STREAM = "gitHub.checked.hasSecurityMd" 
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
        const clonedRepoPath = `../../temp-cloned-repo/${repoName}` // TODO - there's got to be a cleaner way to do this and still be able to test
        const securityMdFound = await hasSecurityMd(clonedRepoPath)
        
        console.log("hasSecurityMd:", securityMdFound)

        await publish(`${NATS_PUB_STREAM}.${serviceName}`, {"hasSecurityMd": securityMdFound}) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${serviceName} ` )
    }
})();

await nc.closed();
