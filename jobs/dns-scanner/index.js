import { connect, JSONCodec } from 'nats'

import { cloneRepository, removeClonedRepository } from './src/clone-remove-repo.js'
import { GraphQLClient, gql } from 'graphql-request'
import 'dotenv-safe/config.js'
import { publishToNats } from './src/utils.js';
import { DirHandler } from './src/file-reader.js'

const {
    NATS_URL,
    NATS_PUB_STREAM,
    DNS_REPOSITORY
} = process.env;

// NATs connection 
const nc = await connect({ servers: NATS_URL, });
const jc = JSONCodec();

console.log('🚀 Connected to NATS server ');

// process.on('SIGTERM', () => process.exit(0))
// process.on('SIGINT', () => process.exit(0))
(async () => {
    console.log('\n**************************************************************')
    console.log(`\nScanning DNS repo from : ${DNS_REPOSITORY}`)

    // Clone the DNS repository 
    const repoPath = await cloneRepository(DNS_REPOSITORY, "phac-dns")
    console.log ('Cloned repository at path', repoPath, '\n')

    console.log("Reading github endpoint from DNS yaml entries");
    //Instantiate the DirHandler to perform file operations
    const dirHandler = new DirHandler(repoPath);
    const dirContents = await dirHandler.listDirContents('dns-records');
    console.log("Reading complete \n");


    const services = [];
    for(var file of dirContents){
        const type = dirHandler.findFileType(file);
        if(type === ".yaml"){
            const content = await dirHandler.parseFileContents(file);
            let serviceObj = {
                payloadType : "service",
                serviceName : content.metadata.name,
                repoEndpoint : content.metadata.annotations.sourceCodeRepository,
                webEndpoint : content.spec.name
            }
            services.push(serviceObj);
        }
    }

    console.log(services);

    //remove cloned repo
    console.log("Removing cloned repo directory...");
    await removeClonedRepository(repoPath);

    // Queue up new endpoints to be analyzed by the appropriate scanners
     await publishToNats(nc, jc, NATS_PUB_STREAM, services);

    console.log("published container endpoint events");

    process.exit(0)
})();

await nc.closed();
