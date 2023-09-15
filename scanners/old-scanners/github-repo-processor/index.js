// github-repo-processor/index.js

import 'dotenv/config.js'
import { connect, JSONCodec, createInbox, AckPolicy, consumerOpts, headers, nuid, jwtAuthenticator } from 'nats';
import { insertIntoDatabase } from './src/upsert-into-database.js'
import { Database, aql } from "arangojs";
// import 'dotenv-safe/config.js'
// dotenv.config()

const { 
  PORT = 3001,
  HOST = '0.0.0.0',
  DB_NAME = "dataServices",
  // DB_URL = "http://database:8529",
  DB_URL = "http://0.0.0.0:8529",
  DB_USER = "root",
  DB_PASS = 'yourpassword',
  // NATS_URL = "nats://nats:4222",
  NATS_URL = "nats://0.0.0.0:4222", 
  NATS_SUB_STREAM = "githubRepoScan" 
} = process.env;

// ----- Database connection -----
const db = new Database({
  url: DB_URL,
  databaseName: DB_NAME,
  auth: { username: DB_USER, password: DB_PASS },
});

// ----- NATS Connection -----
const nc = await connect({ 
  servers: NATS_URL, 
  // authenticator: jwtAuthenticator(jwt), 
});

// const jsm = await nc.jetstreamManager();
// await jsm.streams.add({ name: pubStream, subjects: [`${pubStream}.>`] }); 

// // ---- Add jetstream client
// const js = nc.jetstream();

// function publish(payload, filename, h) {
//     // Publishes byte encoded payload 
//     js.publish(`${pubStream}.${filename}`, jc.encode(payload), { headers: h }) 
//   }

// ----- Create a durable consumer(for subscriptions - with memory of what it has previously consumed) //(https://github.com/nats-io/nats.deno/blob/main/jetstream.md)
// const opts = consumerOpts();
// opts.durable("gitHubScanConsumer"); 
// opts.manualAck();
// opts.ackExplicit();
// opts.deliverTo(createInbox());

// ----- Subscribe to message stream 
// const sub = await js.subscribe(stream, opts);
const jc = JSONCodec(); // for encoding NAT's messages
const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server, and listening on', sub.subject, 'channel...');

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))

;(async () => {
  // listen for messages,
  for await (const message of sub) {
    // message.ack()
    let payload  = await jc.decode(message.data) // message was byte encoded
    // console.log(JSON.stringify(payload))
    console.log(payload)
    // process message 
    // upsert into db (but just insert for now)
    await insertIntoDatabase(payload, 'dataServicesCollection', db)
  }
})();

await nc.closed();