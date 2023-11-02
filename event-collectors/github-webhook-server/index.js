import express from 'express'
import { connect, JSONCodec } from 'nats'

import { verifySignature } from './src/util.js'

// Load .env file
import 'dotenv/config.js'
import { endpointKind } from './src/endpoint.js'

// Get config variables from environment
const {
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

  // Get relevant properties to attach to the endpoint event
  const httpsUrl = req.body.repository.html_url;
  const orgName = req.body.repository.owner.login;
  const eventType = req.headers['x-github-event'];
  const repoName = req.body.repository.name;
  const cloneUrl = req.body.repository.ssh_url;
  const productName = `${orgName}_${repoName}`;
  
  // Figure out what kind of endpoint(s) are contained in this webhook
  // notification
  const endpointKinds = endpointKind(httpsUrl);
  
  // For each endpoint, formulate a message and publish it to the
  // appropriate NATS queue.
  for (let i = 0; i < endpointKinds.length; i++) {
    const endpoint = endpointKinds[i];
    await nc.publish(NATS_PUB_STREAM, jc.encode({
      endpoint: httpsUrl,
      endpointKind: endpoint,
      eventType,
      // TODO: unify duplicate value - probably standardize on `endpoint`?
      sourceCodeRepository: httpsUrl,
      cloneUrl,
      repoName,
      orgName,
      productName,
    }))
  }
  
  // TODO: replace this with a proper logger
  console.log("successfully published event: ", eventType, "from", orgName, "/", repoName)
});



app.listen(WEBHOOK_SERVER_PORT_NUMBER, () => {
  console.log(`Webhook server listening on port ${WEBHOOK_SERVER_PORT_NUMBER}`)
})