// github-octo-languagues-check/index.js

import { connect, JSONCodec} from 'nats'
import 'dotenv-safe/config'

const { 
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "gitHub.octokit.repoDetails.>",
  NATS_PUB_STREAM = "gitHub.checked.languagues" 
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

async function getMainLanguage(repoDetails) {
    if (repoDetails.language) {
        return({"mainLanguage": repoDetails.language})
    } else {
        return({"mainLanguage": null})
    }
}

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject} \n`)
        
        const repoDetails  = await jc.decode(message.data)
        const serviceName = message.subject.split(".").reverse()[0]
        const mainLanguage = await getMainLanguage(repoDetails)
    
        await publish(`${NATS_PUB_STREAM}.${serviceName}`, mainLanguage) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${serviceName}: `, mainLanguage)
    }
})();

await nc.closed();