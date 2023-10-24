import express from 'express'
import { connect, JSONCodec } from 'nats'

import { verifySignature } from './util.js'

// Load .env file
import 'dotenv/config'

// Get config variables from environment
const {
  WEBHOOK_SECRET,
  WEBHOOK_SERVER_PORT_NUMBER,
  NATS_SERVER,
  NATS_PUB_STREAM
} = process.env

// Create express app
const app = express()

// Connect to NATS server
const nc = await connect({ servers: [NATS_SERVER] })

// NATS Codecs
const jc = JSONCodec(); // for encoding NAT's messages

// Add middleware to parse json payloads
app.use(express.json())

// Listener for web hooks. Since NATS client is async,
// the callback function for the express route needs to
// be async as well.
app.post('/', async (req, res) => {
  // Need to check if the webhook originated with GitHub.com by verifying the
  // x-hub-signature-256 jwt that came with the request.
  if (!verifySignature(req)) {
    res.status(401).send("Unauthorized");
    console.log("Unauthorized Request");
    return;
  }
  // extract relevant information to put into queue.
  // const wholePayload = req.body.repository
  const sourceCodeRepository = req.body.repository.url
  const eventType = req.headers['x-github-event']
  // publish message to NATS
  await nc.publish(NATS_PUB_STREAM, jc.encode({
    eventType,
    sourceCodeRepository,
    // wholePayload,
  }))
  // TODO: replace this with a proper logger
  console.log("successfully published event: ", eventType)
})

app.listen(WEBHOOK_SERVER_PORT_NUMBER, () => {
  console.log(`Webhook server listening on port ${WEBHOOK_SERVER_PORT_NUMBER}`)
})