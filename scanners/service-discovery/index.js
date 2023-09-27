// service-discovery/index.js

// ** set up to run on a periodic timeframe 

// clone dns repo, extract annotations
// TODO - get domains as well! 
// upsert into database / send off to endpoint dispatcher

// Something to consider is tracking those repos/ services not captured in dns repo

// TODO - use env file & dotenv safe, 
// TODO - tests! 

// import { tempGetProjects } from "./src/get-projects.js"
import { cloneDnsRepository, removeClonedDnsRepository} from "./src/clone-dns-repo.js"
import { upsertIntoDatabase} from "./src/database-functions.js";
import { consolidateProjectAnnotations, extractAnnotationsFromDnsRecords } from "./src/extract-project-metadata-from-dns-repo.js";
import { connect, JSONCodec} from 'nats'
import { Database } from "arangojs";
import { request, gql, GraphQLClient } from 'graphql-request'
import 'dotenv-safe/config.js'

const { 
  PORT = 3000,
  HOST = '0.0.0.0',
  DB_NAME = "dataServices",
  // DB_URL = "http://database:8529",
  DB_URL = "http://0.0.0.0:8529",
  DB_USER = "root",
  DB_PASS = 'yourpassword',
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_PUB_STREAM = 'discoveredServices',
  API_URL = "http://0.0.0.0:4000/graphql"
} = process.env;

// API connection 
const graphQLClient = new GraphQLClient(API_URL);

// Database connection 
const db = new Database({
  url: DB_URL,
  databaseName: DB_NAME,
  auth: { username: DB_USER, password: DB_PASS },
});

// NATs connection 
const nc = await connect({ 
  servers: NATS_URL,
})
const jc = JSONCodec(); // for encoding NAT's messages
console.log('🚀 Connected to NATS jetstream server...');

async function publish( subject, payload) {
  nc.publish(subject, jc.encode(payload)) 
}

// TODO - maybe compare with list from DB - find not longer used services? - also compare with last updated github etc... 

async function getProjects() {
    await cloneDnsRepository() //TODO if exisits remove and clone again?
    const dnsRecordsAnnotations = await extractAnnotationsFromDnsRecords();
    const projects = await consolidateProjectAnnotations(dnsRecordsAnnotations);

    // TODO get projects from known-services list, compare as well... concat in
    await removeClonedDnsRepository()
    return(projects)
  };

async function processProjects(projects) {
    for (const project of projects){
        // TODO Determine what to do with ones in db, but not in this scan
        const upsertService = await upsertIntoDatabase(project, graphQLClient)
        const serviceName = upsertService.upsertService._key // serviceName is the database key for services collection
        //TODO check if not undefined
        await publish(`${NATS_PUB_STREAM}.${serviceName}`, project)

        console.log(`🚀 Sending message to scanners... on ${NATS_PUB_STREAM}.${serviceName}`)
        console.log(project)
    }  
} 

const timeout = setTimeout(() => {
    process.exit(0);
}, 5000);

// TODO have this running for one message - or cloud function/ cron job once a day?
// TODO fix the hanging issue - not able to close (even when running just as function)
process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))

;(async () => {
    const projects = await getProjects().catch(error => {
      console.error('An error occurred getting projects:', error);
      process.exit(1); 
    });
  
    await processProjects(projects);
  })();

await nc.closed();
