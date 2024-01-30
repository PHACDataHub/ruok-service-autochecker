import { connect, JSONCodec } from 'nats'
import { GraphQLClient, gql } from 'graphql-request'
import { getPages } from './src/get-url-slugs.js'
import { isWebEndpointType } from './src/check-endpoint-type.js'
import { evaluateAccessibility } from './src/accessibility-checks.js'
import { processAxeReport } from './src/process-axe-report.js';
import puppeteer from 'puppeteer';
import 'dotenv-safe/config.js'

const {
  NATS_URL,
  GRAPHQL_URL,
  NATS_SUB_STREAM,
} = process.env;

// NATs connection 
const nc = await connect({ servers: NATS_URL, })
const jc = JSONCodec()
const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
  ; (async () => {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: "new",
    });
    for await (const message of sub) {
      const webEventPayload = await jc.decode(message.data)
      console.log(webEventPayload)
      const { endpoint } = webEventPayload
      const pageInstance = await browser.newPage();
      await pageInstance.setBypassCSP(true);
      if (await isWebEndpointType(endpoint, pageInstance)) { //filtering for only web endpoints
        // Get pages for webendpoints (with url slugs)
        const pages = await getPages(endpoint, pageInstance, browser);
        const accessibilityPages = await processAxeReport(pageInstance, pages, browser)

        const mutation = gql`
            mutation {
              webEndpoint(
                endpoint: {
                  url: "${endpoint}"
                  kind: "Web"
                  accessibility: ${JSON.stringify(accessibilityPages, null, 4).replace(/"([^"]+)":/g, '$1:')}
                }
              )
            }
            `;
        // console.log('*****************************************************\n', mutation)

        // API connection 
        const graphQLClient = new GraphQLClient(GRAPHQL_URL);
        
        // Write mutation to GraphQL API
        const mutationResponse = await graphQLClient.request(mutation);
        
        console.info("wrote mutation to GraphQL API with response", mutationResponse);
        
        await pageInstance.close()
      } // end of if web endpoint

      console.log(`Accessibility scan of ${endpoint} complete.`)
      console.log('-----')
    }
    await browser.close()


  })();

// nats pub "EventsScanner.webEndpoints" "{\"endpoint\":\"https://safeinputs.phac.alpha.canada.ca\"}"
// nats pub "EventsScanner.webEndpoints" "{\"endpoint\":\"https://hopic-sdpac.phac-aspc.alpha.canada.ca\"}"