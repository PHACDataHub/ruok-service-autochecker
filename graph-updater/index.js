import { connect, JSONCodec } from 'nats'

import { GraphQLClient, gql } from 'graphql-request';

import { getEndpoint, getEndpointKind } from "./src/endpoint.js";

import { publishToNats } from './src/utils.js';

import 'dotenv-safe/config.js'

const {
  NATS_URL,
  GRAPHQL_URL,
} = process.env;

const NATS_SUB_STREAM = "EventsUpdate" // Note - for checks that need branch, the substream will be different (right now blanketing with 'main')

const CONTAINER_ENDPOINT_QUEUE = "EventsScanner.containerEndpoints"
const WEB_ENDPOINT_QUEUE = "EventsScanner.webEndpoints"
const GITHUB_ENDPOINT_QUEUE = "EventsScanner.githubEndpoints"


// NATs connection 
const nc = await connect({ servers: NATS_URL, })
const jc = JSONCodec();

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
  ; (async () => {

    for await (const message of sub) {
      let endpointEventPayload = await jc.decode(message.data)

      console.log('\n**************************************************************')
      console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(endpointEventPayload)}`)

      let githubEndpoints = [], webEndpoints = [], containerEndpoints = [];

      if(endpointEventPayload.endpoint.payloadType && 
          endpointEventPayload.endpoint.payloadType == 'service'){
        // Insert this Service and it's WebURL(s) & Repository URL(s) into the graphDB.
        // Also build a graph with the Service as root and the URLs as its children.
        let payload = endpointEventPayload.endpoint;

        const product = `{url : "${payload.serviceName}", kind : "Service"}`

        payload.webEndpoint = (payload.webEndpoint).includes("https") ? payload.webEndpoint : "https://" + payload.webEndpoint
        const l = payload.webEndpoint.length;
        payload.webEndpoint = payload.webEndpoint.substring(0, l-1)
        console.log(payload.webEndpoint)

        let urls = [];

        urls.push(`{url : "${payload.repoEndpoint}", kind : "Github"}`);

        urls.push(`{url : "${payload.webEndpoint}", kind : "Web"}`);

        urls = `[${Array.from(urls).join(',')}]`

        const mutation = gql`
         mutation {
            product(product : ${product},
                    urls : ${urls})
         }
        `

        // New GraphQL client - TODO: remove hard-coded URL
        const graphqlClient = new GraphQLClient(GRAPHQL_URL);
        // Write mutation to GraphQL API
        const mutationResponse = await graphqlClient.request(mutation);
        console.log(mutationResponse);
        
        // Change the original endpointEventPayload to conform with the code 
        // that follows this if block. Also append the web URL for the service
        // to the webEndpoints list, such that it can be scanned.
        endpointEventPayload.endpoint = payload.repoEndpoint;

        // Append the web URL for the service
        // to the webEndpoints list, such that it can be scanned.
        webEndpoints.push(payload.webEndpoint);
      }

      // Every endpoint handler knows how to get its own graph metadata
      // from its endpoint.
      const endpointKind = getEndpointKind(endpointEventPayload.endpoint)[0];
      // Each kind of endpoint knows how to get its own metadata (i.e. what endpoints are
      // related to this endpoint?); polymorphic method getGraphMetadata knows how to
      // parse the endpointEventPayload object to extract metadata about related endpoints.
      console.log('endpointKind', endpointKind)

      const endpointHandler = getEndpoint(endpointKind);
      const newEndpointsWithKind = await endpointHandler.getGraphMetaData(endpointEventPayload)
      const newEndpoints = Array.from(newEndpointsWithKind).map(endpoint=> {
                                  let jsonString = endpoint.replace('url', '"url"').replace('kind', '"kind"');
                                  const obj = JSON.parse(jsonString);
                                  return obj.url;
                              });

      // Create string serialized array of endpoints associated with this endpoint
      const newEndpointsString = `["${Array.from(newEndpoints).join('", "')}"]`;
      const newEndpointsWithKindString= `[${Array.from(newEndpointsWithKind).join(',')}]`

      console.log(newEndpointsString);
      console.log(newEndpointsWithKindString);

      // Mutation to add a graph for the new endpoints
      const mutation = gql`
      mutation {
        endpoints(urls: ${newEndpointsWithKindString}) 
      }
      `;

      // New GraphQL client - TODO: remove hard-coded URL
      const graphqlClient = new GraphQLClient(GRAPHQL_URL);
      // Write mutation to GraphQL API
      const mutationResponse = await graphqlClient.request(mutation);

      console.log('graphql mutation complete')

      // Now that we've written the new graph to the database, we need to query
      // the same subgraph since there may be existing nodes in the database
      // that require a new scan.
      const query = gql`
      query {
        endpoints(urls: ${newEndpointsString}) {
          url
        }
      }
      `;

      const queryResponse = await graphqlClient.request(query);

      const endpointDispatch = {
        githubEndpoint: githubEndpoints,
        webEndpoint: webEndpoints,
        containerEndpoint: containerEndpoints,
      }

      // TODO :also graph relation updater needs to know how to figure out what kind of
      // url each endpoint is (e.g. github endpoint, web endpoint, etc.)
      for (let i = 0; i < queryResponse.endpoints.length; i++) {
        const endpointKinds = getEndpointKind(queryResponse.endpoints[i]["url"]);
        for (let j = 0; j < endpointKinds.length; j++) {
          endpointDispatch[endpointKinds[j]].push(queryResponse.endpoints[i]["url"]);
        }
      }

      // Queue up new endpoints to be analyzed by the appropriate scanners
      await publishToNats(nc, jc, CONTAINER_ENDPOINT_QUEUE, endpointDispatch["containerEndpoint"]);
      console.log("published container endpoint events");
      await publishToNats(nc, jc, WEB_ENDPOINT_QUEUE, endpointDispatch["webEndpoint"]);
      console.log("published web endpoint events");
      await publishToNats(nc, jc, GITHUB_ENDPOINT_QUEUE, endpointDispatch["githubEndpoint"])
      console.log("published github endpoint event");

      // TODO: anything under event collectors should not include any extra metadata beyond
      // the URL itself, because any given event endpoint won't necessarily include info about
      // what kind of other endpoitns its connected to.
    }
  })();

await nc.closed();
