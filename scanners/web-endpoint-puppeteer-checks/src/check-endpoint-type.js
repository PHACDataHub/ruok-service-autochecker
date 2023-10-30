export async function isWebEndpointType(endpoint, page) {
// we are passing webEnpoints in, but some of these will be api endpoints 
  if (endpoint.split('/').pop() == 'graphql') {
    // graphical serves html content, so will be determined to be a webEndpoint below, so handling separately here
    console.log(`Skipping ${endpoint} - GraphQL API`);
    return false
  }
  try {
    const response = await page.goto(endpoint, {
      waitUntil: 'networkidle0',
    });
    if (response.status() === 200 || response.status() == 304) { // includes cached responses
      const contentType = response.headers()['content-type'];

      if (contentType.includes('text/html')) {
        console.log(`${endpoint} serves html content - web endpoint`);
        return true
      } else {
        console.log(`Skipping ${endpoint} - doesn't serve html content - possible API`);
        return false
      }
    } else {
      console.log(`Failed to access ${endpoint}. Status code: ${response.status()}`);
    }
  } catch (error) {
    console.log(`Skipping ${endpoint} - doesn't serve html content.`)
    return false
  }
}
