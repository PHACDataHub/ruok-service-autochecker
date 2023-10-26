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
// import fs from 'fs'

(async () => {
    const browser = await puppeteer.launch({
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
      // // Save to file to be able to look at results
      // const results = JSON.stringify(results, null, 2)
      // const outputFilePath = 'axe_results.json';  
      // fs.writeFileSync(outputFilePath, results, 'utf-8');

      const checks = [
        ...results.inapplicable.map(item => ({
          id: item.id,
          checkPasses: null,
          metadata: {
            description: item.description,
            helpUrl: item.helpUrl,
          },
        })),
        ...results.passes.map(item => ({
          id: item.id,
          checkPasses: true,
          metadata: {
            description: item.description,
            helpUrl: item.helpUrl,
          },
        })),
        ...results.incomplete.map(item => ({
          id: item.id,
          checkPasses: 'incomplete',
          metadata: {
            description: item.description,
            helpUrl: item.helpUrl,
            nodes: item.nodes,
          },
        })),
        ...results.violations.map(item => ({
          id: item.id,
          checkPasses: false,
          metadata: {
            description: item.description,
            helpUrl: item.helpUrl,
            nodes: item.nodes,
          },
        })),
      ];
      console.log('All Checks:', JSON.stringify(checks, null, 2));
      return checks 

    } catch (e) {
      console.log(e)
    }  
    await page.close()
    await browser.close()
})()


// Note can limit search to specified rules ie 
// new AxePuppeteer(page).withRules(['html-lang', 'image-alt']
