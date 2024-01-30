// processAxeReport.js
import { evaluateAccessibility } from './accessibility-checks.js'

export async function processAxeReport(pageInstance, pages, browser) {
  let webEndpointAxeResults = {}  //form response

  for (const pageToEvaluate of pages) {
    console.log('Evaluating page: ', pageToEvaluate)
    const axeReport = await evaluateAccessibility(pageToEvaluate, pageInstance, browser)

    // Process report (create camelCase key for each evaluated criterion )
    for (let i = 0; i < axeReport.length; i++) {
      const camelize = s => s.replace(/-./g, x => x[1].toUpperCase())
      const criterion = axeReport[i];
      const criterionKey = Object.keys(criterion )[0];
      const criterionValue = criterion [criterionKey];
      const criterionKeyCamelCase = camelize(criterionKey);
      if (!webEndpointAxeResults[pageToEvaluate]) {
        webEndpointAxeResults[pageToEvaluate] = {}
      }
      if (typeof criterionValue.checkPasses === 'boolean') {
        criterionValue.checkPasses = criterionValue.checkPasses.toString()
      }
      webEndpointAxeResults[pageToEvaluate][criterionKeyCamelCase] = {
        checkPasses: criterionValue.checkPasses,
        metadata: criterionValue.metadata,
      }
    }

  }
  const accessibilityPages = Object.keys(webEndpointAxeResults).map(page => {
    return {
      url: page,
      ...webEndpointAxeResults[page],
    }
  })
  return accessibilityPages
}
