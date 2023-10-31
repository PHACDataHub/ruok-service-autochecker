import { connect, JSONCodec} from 'nats'
import { Database } from "arangojs";
import { GraphQLClient } from 'graphql-request'
import { getPages} from './src/get-url-slugs.js'
import { isWebEndpointType } from './src/check-endpoint-type.js'
import { evaluateAccessibility } from './src/accessibility-checks.js'
import puppeteer from 'puppeteer';
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

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
 
  for await (const message of sub) {
    const webEventPayload  = await jc.decode(message.data)
    const { webEndpoints } = webEventPayload 
    const productName = message.subject.split('.').pop()  // last NATs subject token
    
    console.log(productName, webEndpoints)   
 
    const accessibilityResults = [];

    for (const webEndpoint of webEndpoints) {
      const pageInstance = await browser.newPage();
      await pageInstance.setBypassCSP(true);

      if (await isWebEndpointType(webEndpoint, pageInstance)) { //filtering for only web endpoints
        const pages = await getPages(webEndpoint, pageInstance, browser);
        const webEndpointResults = {[webEndpoint]: {},} // form response
    
        for (const pageToEvaluate of pages) {
          console.log('Evaluating page: ', pageToEvaluate)
          const axeReport = await evaluateAccessibility(pageToEvaluate, pageInstance, browser)
          webEndpointResults[webEndpoint][pageToEvaluate] = axeReport
        }

        // SAVE to ArangoDB through API
        // const upsertService = await upsertClonedGitHubScanIntoDatabase(productName, sourceCodeRepository, results, graphQLClient)

        accessibilityResults.push(webEndpointResults)
        await pageInstance.close()
      }

    }
    console.log(accessibilityResults)
  }
  await browser.close()



})();


await nc.closed();