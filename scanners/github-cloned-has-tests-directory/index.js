// github-cloned-has-test-directory/index.js

import { connect, JSONCodec} from 'nats'
import { searchTests, formTestsDirectoryPayload } from './src/has-tests-directory.js'
import 'dotenv-safe/config.js'

const { 
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "gitHub.cloned.>",
  NATS_PUB_STREAM = "gitHub.checked.hasTestsDirectory" 
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
        const { repoName } = payloadFromCloneRepo
        const clonedRepoPath =  `../../temp-cloned-repo/${repoName}`
        const serviceName = message.subject.split(".").reverse()[0]
  
        const testDirectories = await searchTests(clonedRepoPath)
        const testsDirectoryDetails = await formTestsDirectoryPayload(testDirectories)
    
        console.log(JSON.stringify(testsDirectoryDetails))

        await publish(`${NATS_PUB_STREAM}.${serviceName}`, testsDirectoryDetails) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${serviceName}: `,)
    }
})();

await nc.closed();
