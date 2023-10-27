import { connect, JSONCodec} from 'nats'
import { Database } from "arangojs";
import { GraphQLClient } from 'graphql-request'
import { getPages} from './src/get-url-slugs.js'
import { evaluateAccessibility } from './src/puppeteer-checks.js'
import 'dotenv-safe/config.js'

const { 
    DB_NAME,
    DB_URL,
    DB_USER, 
    DB_PASS,
    NATS_URL,
    API_URL,
  } = process.env;
  
const NATS_SUB_STREAM="ClonedRepoEvent.>"

// API connection 
const graphQLClient = new GraphQLClient(API_URL);

// Database connection 
const db = new Database({
  url: DB_URL,
  databaseName: DB_NAME,
  auth: { username: DB_USER, password: DB_PASS },
});

// NATs connection 
const nc = await connect({ servers: NATS_URL,})
const jc = JSONCodec()

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
 
  for await (const message of sub) {
    const clonedRepoEventPayload  = await jc.decode(message.data)
    const { webEndpoints } = clonedRepoEventPayload 
    const productName = message.subject.split('.').pop()  // last NATs subject token
    
    console.log(productName, webEndpoints)   

    // console.log('\n**************************************************************')
    // console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(clonedRepoEventPayload)}`)
    const accessibilityResults = [];

    for (const webEndpoint of webEndpoints) {
      const pages = await getPages(webEndpoint);
  
      const webEndpointResults = {
        [webEndpoint]: {},
      };
  
      for (const page of pages) {
        console.log('Evaluating page: ', page)
        const axeReport = await evaluateAccessibility(page);
  
        webEndpointResults[webEndpoint][page] = axeReport;
      }
  
      accessibilityResults.push(webEndpointResults);
    }

    console.log(accessibilityResults)

  // SAVE to ArangoDB through API
      // const upsertService = await upsertClonedGitHubScanIntoDatabase(productName, sourceCodeRepository, results, graphQLClient)
  }
})();

await nc.closed();