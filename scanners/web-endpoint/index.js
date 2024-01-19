import { connect, JSONCodec } from 'nats'
import { GraphQLClient, gql } from 'graphql-request'
import { getPages } from './src/get-url-slugs.js'
import { isWebEndpointType } from './src/check-endpoint-type.js'
import { evaluateAccessibility } from './src/accessibility-checks.js'
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
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

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
        const pages = await getPages(endpoint, pageInstance, browser);
        const webEndpointAxeResults = {}  //form response
        for (const pageToEvaluate of pages) {
          console.log('Evaluating page: ', pageToEvaluate)
          const axeReport = await evaluateAccessibility(pageToEvaluate, pageInstance, browser)

          for (let i = 0; i < axeReport.length; i++) {
            const camelize = s => s.replace(/-./g, x => x[1].toUpperCase())
            const violation = axeReport[i];
            const violationKey = Object.keys(violation)[0];
            const violationValue = violation[violationKey];
            const violationKeyCamelCase = camelize(violationKey);
            if (!webEndpointAxeResults[pageToEvaluate]) {
              webEndpointAxeResults[pageToEvaluate] = {}
            }
            if (typeof violationValue.checkPasses === 'boolean') {
              violationValue.checkPasses = violationValue.checkPasses.toString()
            }
            webEndpointAxeResults[pageToEvaluate][violationKeyCamelCase] = {
              checkPasses: violationValue.checkPasses,
              metadata: violationValue.metadata,
            }
          }
        }
        const accessibilityPages = Object.keys(webEndpointAxeResults).map(page => {
          return {
            url: page,
            ...webEndpointAxeResults[page],
          }
        })
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
        // API connection 
        const graphQLClient = new GraphQLClient(GRAPHQL_URL);
        // Write mutation to GraphQL API
        const mutationResponse = await graphQLClient.request(mutation);
        console.info("wrote mutation to GraphQL API with response", mutationResponse);
        await pageInstance.close()
      }
    }
    await browser.close()

  })();


await nc.closed();

// nats pub "EventsScanner.webEndpoints" "{\"endpoint\":\"https://safeinputs.phac.alpha.canada.ca\"}"