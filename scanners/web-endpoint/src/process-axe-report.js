// processAxeReport.js

export function processAxeReport(axeReport, pageToEvaluate) {
    const webEndpointAxeResults = {};
  
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

    return Object.keys(webEndpointAxeResults).map(page => ({
      url: page,
      ...webEndpointAxeResults[page],
    }));
  }
  