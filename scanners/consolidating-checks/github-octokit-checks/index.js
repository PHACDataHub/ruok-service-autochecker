// Note - this will change once we convert this to a workflow orchestrator, and each of these are 
//  specifically called rather than listening in on a general channel - just combining for now
import { getLicenseDetails } from './src/licence-check.js'
import { getMainLanguage } from './src/main-language-check.js'
import { connect, JSONCodec } from 'nats';
import 'dotenv-safe/config.js';

const { NATS_URL } = process.env;

const NATS_SUB_STREAM = 'gitHub.octokit.repoDetails.>'
const NATS_PUB_STREAM = 'gitHub.checked'

// NATs connection
const nc = await connect({
  servers: NATS_URL,
});
const jc = JSONCodec()

async function publish(subject, payload) {
    nc.publish(subject, jc.encode(payload)) 
  }

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, 'channel...')

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
  for await (const message of sub) {
    console.log('\n**************************************************************');
    console.log(`Received from ... ${message.subject} \n`);
    
    const repoDetails  = await jc.decode(message.data)
    const serviceName = message.subject.split(".").reverse()[0]
    let checkName
    
    // licence check 
    const licenseDetails = await getLicenseDetails(repoDetails)
    checkName = 'license'
    // payload.has_license = Boolean(repoDetails.license); 
    // payload.repo_license_name = repoDetails.license ? repoDetails.license.name : undefined; 

    await publish(`${NATS_PUB_STREAM}.${serviceName}`, licenseDetails)
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, licenseDetails)
    
    // languages check 
    const mainLanguage = await getMainLanguage(repoDetails)
    checkName = 'language'
    await publish(`${NATS_PUB_STREAM}.${serviceName}`, mainLanguage) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, mainLanguage)

    // repoName 
    const repoName =repoDetails.name;
    checkName = 'repoName'
    await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'repoName': repoName}) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'repoName': repoName})

    // and Description
    const repoDescription =repoDetails.description;
    checkName = 'description'
    await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'description': repoDescription}) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'description': repoDescription})

    // private vs public repo
    checkName = 'visibility'
    const repoVisibility = repoDetails.visibility;
    await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'visibility': repoVisibility } ) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'visibility': repoVisibility} )
   
    // last updated 
    checkName = 'lastUpdated'
    const repoLastUpdatedAt = repoDetails.updated_at //TODO - there's also pushed at, but think this is for push to main - time since updated - re followups, tech debt, security
    await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'lastUpdatedAt': repoLastUpdatedAt} ) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'lastUpdatedAt': repoLastUpdatedAt}  )
    
    // last pushed 
    checkName = 'lastPushed'
    const repoLastPushedAt = repoDetails.pushed_at // Days since active?

    await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'lastPushedAt': repoLastPushedAt} ) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'lastPushedAt': repoLastPushedAt})

    // default branch 
    checkName = 'defaultBranch'
    const repoDefaultBranch = repoDetails.default_branch; // TODO - use in branch protection checks...
    await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'defaultBranch': repoDefaultBranch} ) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'defaultBranch': repoDefaultBranch})

    // hasGitHubPages
    checkName = 'hasGitHubPages'
    const hasGitHubPages = repoDetails.has_pages;
    await publish(`${NATS_PUB_STREAM}.${serviceName}`, {'hasGitHubPages': hasGitHubPages} ) 
    console.log(`Sent to ... ${NATS_PUB_STREAM}.${checkName}.${serviceName}: `, {'hasGitHubPages': hasGitHubPages})
  }
})();


await nc.closed();
