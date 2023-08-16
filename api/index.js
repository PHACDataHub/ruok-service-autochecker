import 'dotenv-safe/config.js'
import { schema } from "./src/schema.js";
import { Server } from "./src/server.js";
import { Database, aql } from "arangojs";
import { connect, JSONCodec, jwtAuthenticator } from 'nats'

// Replace with actual values in .env, but this *should work as test
const { 
    PORT = 4000,
    HOST = '0.0.0.0',
    DB_NAME = "dataServices",
    DB_URL = "http://database:8529",
    DB_USER = "root",
    DB_PASS = 'yourpassword',
    // lifted from Tracker project
    NATS_CHANNEL =  "repo-discovery",
    SUBSCRIBE_TO = "repos.*.discovery",
    PUBLISH_TO = "repos",
    QUEUE_GROUP = "repo-discovery",
    // NATS_URL = "demo.nats.io:4222", 
    NATS_URL = "nats://nats:4222"
  } = process.env;

// DB connection
const dbConfig = {
    url: DB_URL, 
    databaseName: DB_NAME, 
    auth: { username: DB_USER, password: DB_PASS },
    createCollection: true, 
  };
  
const db = new Database(dbConfig);
  
const query = async function query(strings, ...vars) {
    return db.query(aql(strings, ...vars), {
    count: true,
    })
}

// NATS connection 
const nc = await connect({ 
    servers: NATS_URL, 
  });

const jc = JSONCodec(); // for encoding NAT's messages

function publish(payload) {
  ns.publish(NATS_CHANNEL, jc.encode(payload)) 
  // console.log("publishing: ", payload)
}
  
// const transaction = async function transaction(collections) {
// return db.beginTransaction(collections)
// }

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async ( ) => {
 
  const server = new Server({
    schema,
    context: { query, db, publish },
  })
  server.listen({ port: PORT, host: HOST }, () =>
  console.log(`🚀 API is running on http://${HOST}:${PORT}/graphql`),
  )
})()
