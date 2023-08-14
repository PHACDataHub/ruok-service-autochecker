// import 'dotenv-safe/config.js'
import { schema } from "./src/schema.js";
import { Server } from "./src/server.js";
import { Database, aql } from "arangojs";
import { connect, JSONCodec, jwtAuthenticator } from 'nats'

// Replace with actual values in .env, but this *should work as test
const { 
    PORT = 4000,
    HOST = '0.0.0.0',
    DB_NAME = "dataServices",
    DB_URL = "http://localhost:8529",
    DB_USER = "root",
    DB_PASS = 'yourpassword',
    // lifted from Tracker project
    NAME =  "repo-discovery",
    SUBSCRIBE_TO = "repos.*.discovery",
    PUBLISH_TO = "repos",
    QUEUE_GROUP = "repo-discovery",
    // SERVERLIST =  "nats://localhost:4222",
    // NATS_URL = "demo.nats.io:4222", 
    NATS_URL = "nats://0.0.0.0:4222"
  } = {};
  // } = process.env;

// DB connection
const dbConfig = {
    url: "http://database:8529", 
    database: "dataServices", 
    auth: { username: "root", password: "yourpassword" },
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
    // authenticator: jwtAuthenticator(jwt), // needed if connected to ngs
  });

const jc = JSONCodec(); // for encoding NAT's messages

function publish(payload) {
  ns.publish(NAME, jc.encode(payload)) 
  console.log("publishing: ", payload)
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
