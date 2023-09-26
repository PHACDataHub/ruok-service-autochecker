// github-done/index.js

import { connect, JSONCodec} from 'nats'
import 'dotenv-safe/config.js'

const { 
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "gitHub.checked.>",
  NATS_PUB_STREAM = "gitHub.saveToDatabase" 
} = process.env;


// NATs connection 
const nc = await connect({ 
  servers: NATS_URL,
})
const jc = JSONCodec(); 

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

async function publish(subject, payload) {
  nc.publish(subject, jc.encode(payload)) 
}

const requiredChecks = new Set(['license','gitignore', 'hasTestsDirectory'])
const completedChecksMap = new Map();
let githubCheckResults = {}

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
    for await (const message of sub) {
        console.log('\n**************************************************************')
        console.log(`Message recieved from ... ${message.subject} \n`)
        
        const serviceName = message.subject.split(".").reverse()[0]
        const checkName = message.subject.split(".").reverse()[1]

        githubCheckResults = { ...githubCheckResults, ...jc.decode(message.data)}
        
        // Initialize the completed checks set for this service if it doesn't exist
        if (!completedChecksMap.has(serviceName)) {
          completedChecksMap.set(serviceName, new Set());
        }

        const completedChecksForService = completedChecksMap.get(serviceName);
        completedChecksForService.add(checkName);
        console.log(`Completed checks so far for ${serviceName}: `, completedChecksForService);
        // completedChecks.add(checkName);
        // console.log(`Completed checks so far for ${serviceName}: `, completedChecks)

        // Get pending checks
        const pendingChecks = [...requiredChecks].filter((check) => !completedChecksForService.has(check));
        console.log(`Pending checks: `, pendingChecks);

        // Check if all required checks are complete
        // const allChecksComplete = [...requiredChecks].every((check) => completedChecks.has(check));
        if (pendingChecks.length === 0) {
            console.log(`All GitHub checks done for ${serviceName}!`)
            // publish to savetodatabase
            await publish(`${NATS_PUB_STREAM}.${serviceName}`, githubCheckResults)
            console.log(`Message sent to ... ${NATS_PUB_STREAM}.${serviceName}: `, githubCheckResults)
            // reset checks
            completedChecksForService.clear();
        }
    }
})();

await nc.closed();
