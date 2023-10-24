// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec} from 'nats'
import { RepoChecker } from "./src/repo-check-context.js"
import { HasApiDirectory, hasDependabotYaml } from './src/has-api-directory.js'
import { HasDependabotYaml } from './src/has-dependabot-yaml.js'
import { HasTestsDirectory } from './src/has-tests-directory.js'
import { HasSecurityMd } from "./src/has-security-md.js"
import { DotDockerIgnoreDetails, DotGitIgnoreDetails } from "./src/get-dotignore-details.js"
import { AllChecks } from './src/all-checks.js'
import { cloneRepository, removeClonedRepository, extractUrlParts} from './src/clone-repo-functions.js'
import 'dotenv-safe/config.js'

const { NATS_URL } = process.env;
const NATS_SUB_STREAM="GitHubEvent"
// const NATS_PUB_STREAM = "gitHub.cloned.saveToDatabase" // Note- this will be appended with repo name when published. 

// NATs connection 
const nc = await connect({ servers: NATS_URL,})
const jc = JSONCodec()

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

// NATs publish
async function publish(subject, payload) {
    nc.publish(subject, jc.encode(payload)) 
    console.log(`Sent to ... ${subject}: `, payload)
  }

// Initialize Checkers 
const repoChecker = new RepoChecker()

// Initialize Checkers //TODO - move to src???
async function initializeChecker(checkName, repoName, repoPath) {
    switch (checkName) {
        case 'hasApiDirectory':
            return new HasApiDirectory(repoName, repoPath)
        case 'hasDependabotYaml':
            return new HasDependabotYaml(repoName, repoPath)
        case 'hasTestsDirectory':
            return new HasTestsDirectory(repoName, repoPath)
        case 'hasSecurityMd':
            return new HasSecurityMd(repoName, repoPath)
        case 'dotDockerIgnoreDetails':
            return new DotDockerIgnoreDetails(repoName, repoPath)
        case 'dotGitIgnoreDetails':
            return new DotGitIgnoreDetails(repoName, repoPath)
        case 'allChecks':
            return new AllChecks(repoName, repoPath)
        default:
            throw new Error(`Unknown checker: ${checkName}`)
    }
}

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
    for await (const message of sub) {
        const gitHubEventPayload  = await jc.decode(message.data)
        console.log('\n**************************************************************')
        console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(gitHubEventPayload)}`)
        
        //Note these will all be passed with gitHubEventPayload in the future 
        const { sourceCodeRepository } = gitHubEventPayload
        const repoName = sourceCodeRepository.split('/').pop() 
        const { cloneUrl } = await extractUrlParts(sourceCodeRepository)
        
    // Clone repository
        const repoPath = await cloneRepository(cloneUrl, repoName) // change to not need repoName
    // Select, intialize and do check  (will be input in future iterations - now just hardcoding in)
        const checkName = 'allChecks' // This actually leads to not needing checkName in interface (since we're giving it here...)
        // const checkName = 'hasDependabotYaml'
        // const checkName = 'dotGitIgnoreDetails'
        console.log('*****************', checkName, repoName, repoPath)
       
        const check = await initializeChecker(checkName, repoName, repoPath)
        console.log(check)
        const payload = await repoChecker.doRepoCheck(check) // Wow, not super clear names here....
        // const payload = await check.doRepoCheck()
        // SAVE TO DB through API
        console.log(payload)
        // const subject = `${NATS_PUB_STREAM}.${repoChecker.checkName(check)}.${repoName}` // like here - so long as they match what is going in db, can repace middle token with checkName hardcoded above. 
    
   // This removes it too so

    // Publish
        // TODO - include or append original payload here - or just the sourcecoderepository
        // await publish(subject, payload) 

    // Remove temp repository
        await removeClonedRepository(repoPath) 
    }
})();

await nc.closed();