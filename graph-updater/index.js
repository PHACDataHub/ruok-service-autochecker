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

// NATs jetStream manager
const jsm = await nc.jetstreamManager();
const cfg = {
  name: "EVENTS",
  subjects: ["EventsUpdate"],
};

await jsm.streams.add(cfg)
console.log("created the stream")

// JetStream Client
const js = nc.jetstream();

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server - listening on ...', sub.subject, "channel...");

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
  ; (async () => {

    for await (const message of sub) {
      const endpointEventPayload = await jc.decode(message.data)

      console.log('\n**************************************************************')
      console.log(`Recieved from ... ${message.subject}:\n ${JSON.stringify(endpointEventPayload)}`)

      // Every endpoint handler knows how to get its own graph metadata
      // from its endpoint.
      const endpointKind = getEndpointKind(endpointEventPayload.endpoint)[0];
      // Each kind of endpoint knows how to get its own metadata (i.e. what endpoints are
      // related to this endpoint?); polymorphic method getGraphMetadata knows how to
      // parse the endpointEventPayload object to extract metadata about related endpoints.
      console.log('endpointKind', endpointKind)

      const endpointHandler = getEndpoint(endpointKind);
      const newEndpoints = await endpointHandler.getGraphMetaData(endpointEventPayload)

      console.log('newEndpoints', newEndpoints)

      // Create string serialized array of endpoints associated with this endpoint
      const newEndpointsString = `["${Array.from(newEndpoints).join('", "')}"]`;

      // Mutation to add a graph for the new endpoints
      const mutation = gql`
      mutation {
        endpoints(urls: ${newEndpointsString}) 
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
        githubEndpoint: [],
        webEndpoint: [],
        containerEndpoint: [],
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
