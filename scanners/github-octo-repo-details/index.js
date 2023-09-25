// github-octokit-repo-details/index.js

import { connect, JSONCodec} from 'nats'
import { Octokit, App,  RequestError } from "octokit";
import 'dotenv-safe/config.js'

const { 
  OWNER = 'PHACDataHub',
  GITHUB_TOKEN,
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "gitHub.initiate.>",
  NATS_PUB_STREAM = "gitHub.octokit.repoDetails" 
} = process.env;

// Authenicate with GitHub 
const octokit = new Octokit({ 
    auth: GITHUB_TOKEN,
});

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

async function getRepoDetails(owner, repo, octokit) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}', {
        owner: owner,
        repo: repo,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
        });
        // console.log(response.data);
        return (response.data)
    
    } catch (error) {
        console.error("An error occurred while fetching repository details:", error.message);
    }
  }

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject} \n`)
        
        const payloadFromGitHubInitiate  = await jc.decode(message.data)
        console.log(payloadFromGitHubInitiate)
        const serviceName = message.subject.split(".").reverse()[0]
        const { sourceCodeRepository } = payloadFromGitHubInitiate
        const repo = sourceCodeRepository.split('/').pop();

        const repoDetails = await getRepoDetails(OWNER, repo, octokit)
        repoDetails.serviceName = serviceName

        await publish(`${NATS_PUB_STREAM}.${serviceName}`, repoDetails) //To clone repo and octokit details 
        console.log(`Octokit Repo Details sent to ... ${NATS_PUB_STREAM}.${serviceName}: `)
    }
})();

await nc.closed();
