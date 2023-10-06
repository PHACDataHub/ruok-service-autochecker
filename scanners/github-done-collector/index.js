// github-done-collector/index.js

import { connect, JSONCodec} from 'nats'
import 'dotenv-safe/config.js'

const { NATS_URL } = process.env;
  
const NATS_SUB_STREAM = "gitHub.checked.>"
const NATS_PUB_STREAM = "gitHub.saveToDatabase" 

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
        
        // pulled from the last and second last NATs message token 
        const serviceName = message.subject.split(".").reverse()[0]
        const checkName = message.subject.split(".").reverse()[1]

        // initialize completed checks set for this service if doesn't yet exist
        if (!completedChecksMap.has(serviceName)) {
          completedChecksMap.set(serviceName, new Set());
        }

        const completedChecksForService = completedChecksMap.get(serviceName);
        // add this check to the completed checks set for this service
        completedChecksForService.add(checkName);
        console.log(`Completed checks so far for ${serviceName}: `, completedChecksForService);

        // Get the GitHub check results for this service
        if (!githubCheckResults[serviceName]) {
          githubCheckResults[serviceName] = {}; // create if doesn't exist
        }
        githubCheckResults[serviceName] = { ...githubCheckResults[serviceName], ...jc.decode(message.data) };
        
        // Check if all required checks are complete
        const pendingChecks = [...requiredChecks].filter((check) => !completedChecksForService.has(check));
        console.log(`Pending checks: `, pendingChecks);

        if (pendingChecks.length === 0) {
            console.log(`All GitHub checks done for ${serviceName}!`)
            // publish to saveToDatabase
            await publish(`${NATS_PUB_STREAM}.${serviceName}`, githubCheckResults[serviceName])
            console.log(`Message sent to ... ${NATS_PUB_STREAM}.${serviceName}: `, githubCheckResults[serviceName])
            // reset checks for this service
            completedChecksForService.clear();
            delete githubCheckResults[serviceName];
        }
    }
})();

await nc.closed();
