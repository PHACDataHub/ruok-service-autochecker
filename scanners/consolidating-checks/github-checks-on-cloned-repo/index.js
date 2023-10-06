// github-has-dependabot-yaml-check/index.js

import { connect, JSONCodec} from 'nats'
import { hasDependabotYaml } from './src/has-dependabot-yaml.js'
import { hasSecurityMd } from './src/has-security-md.js'
import { searchTests, formTestsDirectoryPayload } from './src/has-tests-directory.js'
import { searchIgnoreFile } from './src/get-dotignore-details.js'
import { hasApiDirectory } from './src/has-api-directory.js'

import 'dotenv-safe/config.js'

const { NATS_URL } = process.env;

const NATS_SUB_STREAM = "gitHub.cloned.>"
const NATS_PUB_STREAM = "gitHub.checked" 


// NATs connection 
const nc = await connect({ 
  servers: NATS_URL,
})
const jc = JSONCodec()

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
        // console.log(payloadFromCloneRepo)
        const serviceName = message.subject.split(".").reverse()[0]
        const { repoName } = payloadFromCloneRepo
        const clonedRepoPath = `../../../temp-cloned-repo/${repoName}` // TODO - there's got to be a cleaner way to do this and still be able to test
        let checkName

    //has dependabot yaml 
        checkName = 'hasDependabotYaml'
        const dependabotYamlFound = await hasDependabotYaml(clonedRepoPath)

        await publish(`${NATS_PUB_STREAM}.${checkName}.${serviceName}`, {'hasDependabotYaml': dependabotYamlFound}) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName} {'hasDependabotYaml': ${dependabotYamlFound}}`, )

    // security md
        checkName = 'hasSecurityMd'
        const securityMdFound = await hasSecurityMd(clonedRepoPath)

        await publish(`${NATS_PUB_STREAM}.${checkName}.${serviceName}`, {checkName: securityMdFound}) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName} {${checkName}: ${securityMdFound}}`, )

    // has tests directories
        checkName = 'hasTestsDirectory'
        const testDirectories = await searchTests(clonedRepoPath)
        const formatedTestDirectory = await formTestsDirectoryPayload(testDirectories)
        // console.log(JSON.stringify(testsDirectoryDetails))

        await publish(`${NATS_PUB_STREAM}.${checkName}.${serviceName}`, formatedTestDirectory) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, formatedTestDirectory)
  
    //has api directory
        checkName = 'hasApiDirectory'
        const hasApiDir = await hasApiDirectory(clonedRepoPath);

        await publish(`${NATS_PUB_STREAM}.${checkName}.${serviceName}`, {'hasApiDirectory': hasApiDir} ) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'hasApiDirectory': hasApiDir} )

    // gitignoreDetails
        checkName = 'gitignoreDetails'
        const gitignoreDetails = await searchIgnoreFile(clonedRepoPath, ".gitignore");

        await publish(`${NATS_PUB_STREAM}.${checkName}.${serviceName}`, {'gitignoreDetails': gitignoreDetails}) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'gitignoreDetails': gitignoreDetails})
        
    // dockerignoreDetails
        checkName = 'dockerDetails'
        const dockerignoreDetails = await searchIgnoreFile(clonedRepoPath, ".dockerignore");

        await publish(`${NATS_PUB_STREAM}.${checkName}.${serviceName}`, {'dockerignoreDetails':dockerignoreDetails}) 
        console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'dockerignoreDetails':dockerignoreDetails})
        
    }
})();

await nc.closed();
