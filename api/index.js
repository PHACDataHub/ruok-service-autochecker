// import 'dotenv-safe/config.js'
import { schema } from "./src/schema.js";
import { Server } from "./src/server.js";
import { Database, aql } from "arangojs";
import 'dotenv-safe/config.js'

const {
  PORT = 4000,
  HOST = '0.0.0.0',
  DB_NAME = "ruok",
  DB_URL = "http://localhost:8529",
  DB_USER = "root",
  DB_PASS = 'yourpassword',
} = process.env;

// DB connection
const dbConfig = {
  url: DB_URL,
  databaseName: DB_NAME,
  auth: { username: DB_USER, password: "" },
  createCollection: true,
};

const db = new Database(dbConfig);


process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
  ; (async () => {
    const server = new Server({
      schema,
      context: { db },
    })

    server.listen({ port: PORT, host: HOST }, () =>
      console.log(`🚀 API is running on http://${HOST}:${PORT}/graphql`),
    )
  })()