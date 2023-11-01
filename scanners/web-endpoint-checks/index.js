import { connect, JSONCodec} from 'nats'
import { Database } from "arangojs";
import { GraphQLClient } from 'graphql-request'
import { getPages} from './src/get-url-slugs.js'
import { isWebEndpointType } from './src/check-endpoint-type.js'
import { evaluateAccessibility } from './src/accessibility-checks.js'
import puppeteer from 'puppeteer';
import 'dotenv-safe/config.js'

const { 
    NATS_URL,
    API_URL,
  } = process.env;
  
const NATS_SUB_STREAM="WebEvent"

// API connection 
const graphQLClient = new GraphQLClient(API_URL);

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
    console.log(webEventPayload)
    const { webEndpoints } = webEventPayload 
    
    console.log(webEndpoints)   

    for (const webEndpoint of webEndpoints) {
      const pageInstance = await browser.newPage();
      await pageInstance.setBypassCSP(true);

      if (await isWebEndpointType(webEndpoint, pageInstance)) { //filtering for only web endpoints
        const pages = await getPages(webEndpoint, pageInstance, browser);
        const webEndpointAxeResults = {}  //form response
    
        for (const pageToEvaluate of pages) {
          console.log('Evaluating page: ', pageToEvaluate)
          const axeReport = await evaluateAccessibility(pageToEvaluate, pageInstance, browser)
  
          if (!webEndpointAxeResults[webEndpoint]) {
            webEndpointAxeResults[webEndpoint] = {};
          }
          webEndpointAxeResults[webEndpoint][pageToEvaluate] = axeReport;

        }
        // SAVE to ArangoDB through API
        // const upsertService = await upsertClonedGitHubScanIntoDatabase(productName, sourceCodeRepository, results, graphQLClient)

        console.log(JSON.stringify(webEndpointAxeResults, null, 2))
        // console.log(webEndpointAxeResults)
        await pageInstance.close()
      }
    }
  }
  await browser.close()

})();


await nc.closed();