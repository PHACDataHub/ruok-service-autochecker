export async function isWebEndpointType(endpoint, page) {
  try {
    const response = await page.goto(endpoint, {
      waitUntil: 'networkidle0',
    });
    if (response.status() === 200 || response.status() == 304) { // includes cached responses
      const contentType = response.headers()['content-type'];

      if (contentType.includes('text/html')) {
        console.log(`${endpoint} serves html content - web app.`);
        return true
      } else {
        console.log(`Skipping ${endpoint} - doesn't serve html content.`);
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

export function notGraphQL(url){

}