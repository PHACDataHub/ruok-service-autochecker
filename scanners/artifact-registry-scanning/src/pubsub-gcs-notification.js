import { PubSub } from '@google-cloud/pubsub'

const TOPIC = 'new_vulnerability_analysis_v1'
// pubsub client
const pubsub = new PubSub();

// Subscribe to the Pub/Sub topic that receives GCS notifications
const subscription = pubsub.subscription(TOPIC);

subscription.on('message', message => {
  // Process the message received from the Pub/Sub topic
  console.log('Received message:', message.data.toString());
  // Perform actions based on the GCS change event (e.g., download file, log event, etc.)
  message.ack(); // Acknowledge the message after processing
});