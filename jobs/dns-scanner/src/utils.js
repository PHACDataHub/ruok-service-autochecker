
/**
 * TODO: tidy up the API for this helper function. 
 * @param {*} natsClient 
 * @param {*} queueName 
 * @param {*} endpointList 
 */
export async function publishToNats(natsClient, encoder, queueName, endpointList) {
  for (let i = 0; i < endpointList.length; i++) {
    //console.log(endpointList[i])
    await natsClient.publish(queueName, encoder.encode({
      endpoint: endpointList[i],
    }));
  }
}