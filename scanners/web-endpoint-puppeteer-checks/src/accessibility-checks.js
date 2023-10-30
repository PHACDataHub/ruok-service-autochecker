// https://github.com/dequelabs/axe-core-npm/blob/develop/packages/puppeteer/README.md
// https://github.com/puppeteer/puppeteer/issues/10882

// https://github.com/puppeteer/puppeteer/issues/290
// https://stackoverflow.com/questions/66214552/tmp-chromium-error-while-loading-shared-libraries-libnss3-so-cannot-open-sha

// https://github.com/dequelabs/axe-core-npm/blob/develop/packages/puppeteer/README.md 


import AxePuppeteer  from "@axe-core/puppeteer";
import puppeteer from 'puppeteer'
import fs from 'fs'

export async function evaluateAccessibility(url, page, browser) {
    await page.goto(url, { cache: 'no-store' })
    try {
      const results = await new AxePuppeteer(page)
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()

      const axeChecks = [
        ...results.inapplicable.map(item => ({
          [item.id]: {
            checkPasses: null,
            metadata: {
              description: item.description,
              // impact: item.impact, // it's null if inapplicable
              helpUrl: item.helpUrl,
            },
          }
        })),
        ...results.passes.map(item => ({
          [item.id]: {
            checkPasses: true,
            metadata: {
              description: item.description,
              // impact: item.impact, // it's null if true
              helpUrl: item.helpUrl,
              },
          }
        })),
        ...results.incomplete.map(item => ({
          [item.id]: {
            checkPasses: 'incomplete',
            metadata: {
              description: item.description,
              impact: item.impact,
              helpUrl: item.helpUrl,
              nodes: item.nodes,
            },
          }
        })),
        ...results.violations.map(item => ({
          [item.id]: {
            checkPasses: false,
            metadata: {
              description: item.description,
              impact: item.impact,
              helpUrl: item.helpUrl,
              nodes: item.nodes,
            },
          }
        })),
      ];
      return { [url]: axeChecks }
    } catch (e) {
      console.log(e)
    }
  }




