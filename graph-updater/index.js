import { connect, JSONCodec } from 'nats';

import { GraphQLClient, gql } from 'graphql-request';

import { getEndpoint, getEndpointKind } from './src/endpoint.js';

import { publishToNats } from './src/utils.js';

import 'dotenv-safe/config.js';

const { NATS_URL, GRAPHQL_URL } = process.env;

const NATS_SUB_STREAM = 'EventsUpdate'; // Note - for checks that need branch, the substream will be different (right now blanketing with 'main')

const CONTAINER_ENDPOINT_QUEUE = 'EventsScanner.containerEndpoints';
const WEB_ENDPOINT_QUEUE = 'EventsScanner.webEndpoints';
const GITHUB_ENDPOINT_QUEUE = 'EventsScanner.githubEndpoints';

// NATs connection
const nc = await connect({ servers: NATS_URL });
const jc = JSONCodec();

const sub = nc.subscribe(NATS_SUB_STREAM);
console.log(
  '🚀 Connected to NATS server - listening on ...',
  sub.subject,
  'channel...',
);

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
(async () => {
  for await (const message of sub) {
    try {
      let endpointEventPayload = await jc.decode(message.data);

      console.log(
        `\n****************************** ${new Date()} ********************************`,
      );
      console.log(
        `Recieved from ... ${message.subject}:\n ${JSON.stringify(endpointEventPayload)}`,
      );

      let githubEndpoints = new Set(),
        webEndpoints = new Set(),
        containerEndpoints = new Set();

      if (
        endpointEventPayload.endpoint.payloadType &&
        endpointEventPayload.endpoint.payloadType == 'service'
      ) {
        // Insert this Service and it's WebURL(s) & Repository URL(s) into the graphDB.
        // Also build a graph with the Service as root and the URLs as its children.
        let payload = endpointEventPayload.endpoint;

        const product = { url: '${payload.serviceName}', kind: 'Service' };

        payload.webEndpoint = payload.webEndpoint.includes('https')
          ? payload.webEndpoint
          : 'https://' + payload.webEndpoint;
        const l = payload.webEndpoint.length;
        payload.webEndpoint = payload.webEndpoint.substring(0, l - 1);
        console.log(payload.webEndpoint);

        const urls = [
          { url: payload.repoEndpoint, kind: 'Github' },
          { url: payload.webEndpoint, kind: 'Web' },
        ];

        const mutation = gql`
          mutation AddProduct(
            $product: EndpointInput!
            $urls: [EndpointInput!]!
          ) {
            product(product: $product, urls: $urls)
          }
        `;

        const addProductVariables = {
          urls: urls,
          product: product,
        };

        // New GraphQL client - TODO: remove hard-coded URL
        const graphqlClient = new GraphQLClient(GRAPHQL_URL);
        // Write mutation to GraphQL API
        const mutationResponse = await graphqlClient.request(
          mutation,
          addProductVariables,
        );
        console.log(mutationResponse);

        // Change the original endpointEventPayload to conform with the code
        // that follows this if block. Also append the web URL for the service
        // to the webEndpoints list, such that it can be scanned.
        endpointEventPayload.endpoint = payload.repoEndpoint;
        githubEndpoints.add(payload.repoEndpoint);

        // Append the web URL for the service
        // to the webEndpoints list, such that it can be scanned.
        webEndpoints.add(payload.webEndpoint);
      }

      // Every endpoint handler knows how to get its own graph metadata
      // from its endpoint.
      if (endpointEventPayload.endpoint !== 'None') {
        const endpointKind = getEndpointKind(endpointEventPayload.endpoint)[0];
        // Each kind of endpoint knows how to get its own metadata (i.e. what endpoints are
        // related to this endpoint?); polymorphic method getGraphMetadata knows how to
        // parse the endpointEventPayload object to extract metadata about related endpoints.

        // If the kind is github then add the git repo URL to the set for scanning
        if (endpointKind == 'github') {
          githubEndpoints.add(endpointEventPayload.endpoint);
        }

        const endpointHandler = getEndpoint(endpointKind);
        let newEndpointsWithKind =
          await endpointHandler.getGraphMetaData(endpointEventPayload);

        newEndpointsWithKind = Array.from(newEndpointsWithKind);

        //Extract only URLS
        const newEndpoints = Array.from(newEndpointsWithKind).map(
          (endpoint) => endpoint.url,
        );

        // Mutation to add a graph for the new endpoints
        const mutation = gql`
          mutation UpdateEndPoints($urls: [EndpointInput!]!) {
            endpoints(urls: $urls)
          }
        `;
        const updateEndpointVariables = {
          urls: newEndpointsWithKind,
        };
        console.log(mutation);
        // New GraphQL client - TODO: remove hard-coded URL
        const graphqlClient = new GraphQLClient(GRAPHQL_URL);
        // Write mutation to GraphQL API
        const mutationResponse = await graphqlClient.request(
          mutation,
          updateEndpointVariables,
        );

        console.log('graphql mutation complete');

        // Now that we've written the new graph to the database, we need to query
        // the same subgraph since there may be existing nodes in the database
        // that require a new scan.

        // Based on the current approach, the regex matcher finds matching URLs, OLD or NEW
        // This removes the need to fire a qurey to find existing URLs, beacuse the scanner is going
        // to pick up EVERYTHING. If the regex matcher does not pick up on an OLD URL, that means
        // that URL is no longer in use and should not be scanned
        const query = gql`
          query GetEndpoints($urls: [String!]!) {
            endpoints(urls: $urls) {
              url
            }
          }
        `;

        const getEndpointVariables = {
          urls: newEndpoints,
        };
        const queryResponse = await graphqlClient.request(
          query,
          getEndpointVariables,
        );

        const endpointDispatch = {
          githubEndpoint: githubEndpoints,
          webEndpoint: webEndpoints,
          containerEndpoint: containerEndpoints,
        };

        newEndpointsWithKind.forEach((ep) => {
          // const ep = JSON.parse(
          //   endpoint.replace('url', '"url"').replace('kind', '"kind"'),
          // );
          const kind = ep.kind;
          // if(kind == 'Github'){
          //   endpointDispatch['githubEndpoint'].add(ep.url);
          // }
          if (kind == 'Docker') {
            endpointDispatch['containerEndpoint'].add(ep.url);
          } else if (kind == 'Database') {
            // TODO
          } else if (kind == 'EmailService') {
            // TODO
          } else if (kind == 'MessageBroker') {
            // TODO
          } else if (kind == 'CloudStorage') {
            // TODO
          }
        });

        // // TODO :also graph relation updater needs to know how to figure out what kind of
        // // url each endpoint is (e.g. github endpoint, web endpoint, etc.)
        // for (let i = 0; i < queryResponse.endpoints.length; i++) {
        //   //const endpointKinds = getEndpointKind(queryResponse.endpoints[i]["url"]);
        //   for (let j = 0; j < endpointKinds.length; j++) {
        //     if(endpointDispatch[endpointKinds[j]]){
        //       endpointDispatch[endpointKinds[j]].push(queryResponse.endpoints[i]["url"]);
        //     }
        //   }
        // }

        console.log(endpointDispatch);

        //Queue up new endpoints to be analyzed by the appropriate scanners
        await publishToNats(
          nc,
          jc,
          CONTAINER_ENDPOINT_QUEUE,
          Array.from(endpointDispatch['containerEndpoint']),
        );
        console.log('published container endpoint events');
        await publishToNats(
          nc,
          jc,
          WEB_ENDPOINT_QUEUE,
          Array.from(endpointDispatch['webEndpoint']),
        );
        console.log('published web endpoint events');
        await publishToNats(
          nc,
          jc,
          GITHUB_ENDPOINT_QUEUE,
          Array.from(endpointDispatch['githubEndpoint']),
        );
        console.log('published github endpoint event');

        githubEndpoints.clear();

        // TODO: anything under event collectors should not include any extra metadata beyond
        // the URL itself, because any given event endpoint won't necessarily include info about
        // what kind of other endpoitns its connected to.
      }
    } catch (error) {
      console.log(error.message);
    } finally {
    }
  }
})();

await nc.closed();
