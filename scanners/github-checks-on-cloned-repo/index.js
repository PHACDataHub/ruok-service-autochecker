// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec} from 'nats'
import { RepoChecker } from "./src/repo-check-context.js"
import { HasApiDirectory, hasDependabotYaml } from './src/has-api-directory.js'
import { HasDependabotYaml } from './src/has-dependabot-yaml.js'
import { HasTestsDirectory } from './src/has-tests-directory.js'
import { HasSecurityMd } from "./src/has-security-md.js"
import { DotDockerIgnoreDetails, DotGitIgnoreDetails } from "./src/get-dotignore-details.js"
import 'dotenv-safe/config.js'

const { NATS_URL } = process.env;
const NATS_SUB_STREAM = "gitHub.cloned.>"
const NATS_PUB_STREAM = "gitHub.checked" 

// NATs connection 
const nc = await connect({ servers: NATS_URL,})
const jc = JSONCodec()

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

// NATs publish
async function publish(subject, payload) {
  nc.publish(subject, jc.encode(payload)) 
}

// Initialize Checkers 
const repoCheck = new RepoChecker()

// Initialize Checkers 
function initializeChecker(checkName, repoName) {
    switch (checkName) {
        case 'hasApiDirectory':
            return new HasApiDirectory(repoName);
        case 'hasDependabotYaml':
            return new HasDependabotYaml(repoName);
        case 'hasTestsDirectory':
            return new HasTestsDirectory(repoName);
        case 'hasSecurityMd':
            return new HasSecurityMd(repoName);
        case 'dotDockerIgnoreDetails':
            return new DotDockerIgnoreDetails(repoName);
        case 'dotGitIgnoreDetails':
            return new DotGitIgnoreDetails(repoName);
        default:
            throw new Error(`Unknown checker: ${checkName}`);
    }
}

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject} \n`)
        
        const payloadFromCloneRepo  = await jc.decode(message.data)
        const repoName = message.subject.split(".").reverse()[0]

    // Select, intialize and do check  (will be input in future iterations - now just hardcoding in 'Do the check'
        const checkName = 'hasTestsDirectory'
        const check = initializeChecker(checkName, repoName)

        const payload = repoCheck.doRepoCheck(check)
        const subject = `${NATS_PUB_STREAM}.${repoCheck.checkName(check)}.${repoName}`
    
    // Publish
        await publish(subject, payload) 
        console.log(`Sent to ... ${subject}, payload: ${payload}`, )
    }
})();

await nc.closed();