// https://github.com/dequelabs/axe-core-npm/blob/develop/packages/puppeteer/README.md
// https://github.com/puppeteer/puppeteer/issues/10882

// import loadPage from '@axe-core/puppeteer'
// import * as puppeteer from 'puppeteer'


// https://stackoverflow.com/questions/66214552/tmp-chromium-error-while-loading-shared-libraries-libnss3-so-cannot-open-sha

import AxePuppeteer  from "@axe-core/puppeteer";
import puppeteer from 'puppeteer'


(async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
      headless:'new'
    });
    const page = await browser.newPage()
    await page.setBypassCSP(true)
    await page.goto('https://dequeuniversity.com/demo/mars/')
    const results = await new AxePuppeteer(page).analyze()
    console.log(results)
    await page.close()
    await browser.close()
})()