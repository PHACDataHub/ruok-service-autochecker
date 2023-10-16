// github-license-check/index.js

import { connect, JSONCodec} from 'nats'
import 'dotenv-safe/config.js'

const { NATS_URL } = process.env;
  
const NATS_SUB_STREAM = "gitHub.octokit.repoDetails.>"
const NATS_PUB_STREAM = "gitHub.checked.license" 


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

async function getLicenseDetails(repoDetails) {
    if (repoDetails.license) {
        // console.log(repoDetails.license)
        return({"hasLicense": true, "license": repoDetails.license.spdx_id})
    } else {
        return({"hasLicense": false, "license": null})
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
        const licenseDetails = await getLicenseDetails(repoDetails)
    
        await publish(`${NATS_PUB_STREAM}.${serviceName}`, licenseDetails)
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${serviceName}: `, licenseDetails)
    }
})();

await nc.closed();