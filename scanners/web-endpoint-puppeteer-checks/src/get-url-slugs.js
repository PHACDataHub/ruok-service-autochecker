import puppeteer from 'puppeteer';

async function getSlugs(url, page, browser) {
  // const browser = await puppeteer.launch({
  //   args: ['--no-sandbox', '--disable-setuid-sandbox'], 
  //   headless:'new'
  // });
  // const page = await browser.newPage();

  try {
    await page.goto(url);

    const slugs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map(link => link.getAttribute('href'))
        .filter(href => href && href.startsWith('/'))
        .map(href => {
          const pathSegments = href.split('/').filter(segment => segment !== '');
          return pathSegments.join('/');
        });
    });
    // console.log('Slugs: ', slugs)
    return slugs;
  } catch (error) {
    console.error('Error:', error.message);
  // } finally {
  //   await browser.close();
  }
}

export async function getPages(url, page, browser) {
  let pages = [url]
  // const slugs = await getSlugs(url)
  const slugs = await getSlugs(url, page, browser)
  for (const slug of slugs) {
    if (slug !== "" && slug !== "/"){
      pages.push(`${url}/${slug}`)
    }
  }
  console.log('Pages', pages)
  return pages 
}
// // // const websiteUrl = 'https://google.com';
// // // const websiteUrl = 'https://safeinputs.phac.alpha.canada.ca/'
// const url = 'https://hopic-sdpac.k8s.phac-aspc.alpha.canada.ca'
// // const slugs = await getSlugs(url)
// // console.log(slugs)
// console.log(await getPages(url))