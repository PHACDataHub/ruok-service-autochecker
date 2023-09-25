// endpoint-dispatcher/index.js
// Subscribes to outputs of service-discovery, determines which scans or processes they should be sent to, and publishes service on that channel.

import { connect, JSONCodec } from 'nats'
import { getPhacDataHubGitHubRepo, getArtifactContainerRegistries, getDockerHub, getDomains, getServiceUrls } from './src/parse-endpoints.js'
import 'dotenv-safe/config.js'

const { 
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "discoveredServices.>",
} = process.env;

// NATs connection 
const nc = await connect({ 
  servers: NATS_URL,
})
const jc = JSONCodec(); 

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server, and listening on', sub.subject, "channel...");

// ----- Subscribe to message stream 

// const sub = await js.subscribe(stream, opts);
// const jc = JSONCodec(); // for encoding NAT's messages
// const sub = nc.subscribe(NATS_SUB_STREAM)
// console.log('🚀 Connected to NATS server... listening to', sub.subject);

async function publish(payload, nats_pub_stream) {
  nc.publish(nats_pub_stream, jc.encode(payload)) 
}

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
  for await (const message of sub) {
    console.log('\n**************************************************************')
    console.log(`Recieved from ... ${message.subject} \n`)

    const payloadFromServiceDiscovery  = await jc.decode(message.data)
    console.log(payloadFromServiceDiscovery)

    // const {serviceName} = payloadFromServiceDiscovery
    const serviceName = message.subject.split(".").reverse()[0]
    console.log(serviceName)
    
    const repo = await getPhacDataHubGitHubRepo(payloadFromServiceDiscovery)
    if (repo) {
        await publish(repo, `gitHub.initiate.${serviceName}`) //To clone repo and octokit details 
        console.log(`Sent to ... gitHub.initiate.${serviceName}: `, repo)
    }
    
    const artifactRegistries = await getArtifactContainerRegistries(payloadFromServiceDiscovery)
    if (artifactRegistries) {
        for (const artifactRegistry of artifactRegistries) {
            await publish(artifactRegistry, `artifactRegistry.${serviceName}`) 
            console.log(`Sent to ... artifactRegistry.${serviceName}: `, artifactRegistry)
        }
    }

    const dockerHubs = await getDockerHub(payloadFromServiceDiscovery)
    if (dockerHubs) {
        for (const dockerHub of dockerHubs) {
            await publish(dockerHub, `dockerHub.${serviceName}`) //To clone repo and octokit details 
        }
    }

    const domains = await getDomains(payloadFromServiceDiscovery)
    if (domains) {
        for (const domain of domains) {
            await publish(domain, `domains.${serviceName}`) //To clone repo and octokit details 
        }
    }

    const serviceUrls = await getServiceUrls(payloadFromServiceDiscovery)
    if (serviceUrls) {
        for (const serviceUrl of serviceUrls) {
            await publish(serviceUrl, `serviceUrl.${serviceName}`) //To clone repo and octokit details 
            console.log(`Sent to ... serviceUrl.${serviceName}: `, serviceUrl)
        }
    }
  }

})();

await nc.closed();
