// https://github.com/dequelabs/axe-core-npm/blob/develop/packages/puppeteer/README.md
// https://github.com/puppeteer/puppeteer/issues/10882

// https://github.com/puppeteer/puppeteer/issues/290
// https://stackoverflow.com/questions/66214552/tmp-chromium-error-while-loading-shared-libraries-libnss3-so-cannot-open-sha

// https://github.com/dequelabs/axe-core-npm/blob/develop/packages/puppeteer/README.md 
//  pass page or frame
//  may need to disable content security policy through Page#setBypassCSP before navigating to the site
//  can include css elements in scann new AxePuppeteer(page).include('.results-panel'); and/or exclude
//  options new AxePuppeteer(page).options({
  // checks: { 'valid-lang': ['orcish'] }
// });
import AxePuppeteer  from "@axe-core/puppeteer";
import puppeteer from 'puppeteer'

(async () => {
    const browser = await puppeteer.launch({
      // dumpio: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
      headless:'new'
    });
    const page = await browser.newPage()
    await page.setBypassCSP(true)
    // await page.goto('https://dequeuniversity.com/demo/mars/')
    await page.goto('https://safeinputs.phac.alpha.canada.ca')
    // await page.goto("https://www.google.com", { timeout: 0 });
    try {
      const results = await new AxePuppeteer(page)
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      console.log ('********************************************************')
      console.log(JSON.stringify(results, null, 1))
    } catch (e) {
      console.log(e)
    }
    await page.close()
    await browser.close()
})()