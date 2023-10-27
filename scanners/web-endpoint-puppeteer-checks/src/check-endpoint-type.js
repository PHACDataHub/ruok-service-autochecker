import puppeteer from 'puppeteer';

async function checkEndpointType(endpoint) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],  //this is to work with debian container
        headless:'new'
      });

  const page = await browser.newPage();

  try {
    const response = await page.goto(endpoint, {
      waitUntil: 'networkidle0',
    });
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];

      if (contentType.includes('text/html')) {
        console.log(`${endpoint} serves html content, likely a web app.`);
        return endpoint
      } else if (contentType.includes('application/json')) {
        console.log(`${endpoint} serves JSON content, likely an API endpoint.`);
      } else {
        console.log(`${endpoint} serves an unknown content type.`);
      }
    } else {
      console.log(`Failed to access ${endpoint}. Status code: ${response.status()}`);
    }
  } catch (error) {
    console.log(`skipping ${endpoint} as doesn't serve html content`)
  } finally {
    await browser.close();
  }
}

// const endpoints = [
//   'https://google.com',
//   'https://api.example.com/data',
// ];


// const processEndpoints = async () => {
//   for (const endpoint of endpoints) {
//     await checkEndpointType(endpoint);
//   }
// };

// processEndpoints();
