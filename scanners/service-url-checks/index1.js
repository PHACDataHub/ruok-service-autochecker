import { getPages} from './src/get-url-slugs.js'
import { evaluateAccessibility } from './src/accessability-checks.js'

// // const websiteUrl = 'https://google.com';
// // const websiteUrl = 'https://safeinputs.phac.alpha.canada.ca/'
const url = 'https://hopic-sdpac.k8s.phac-aspc.alpha.canada.ca'
const pages = await getPages(url)
console.log(pages)

// for (const page of pages) {
//     const axeReport = await evaluateAccessibility(page)
//     // console.log(axeReport)
//     console.log(page)
// }

const serviceUrls = [
    'https://safeinputs.phac.alpha.canada.ca',
    'https://safeinputs.phac.alpha.canada.ca/graphql',
    'https://hopic-sdpac.phac-aspc.alpha.canada.ca',
    'https://hopic-sdpac.k8s.phac-aspc.alpha.canada.ca'
  ]
for (const serviceUrl of serviceUrls) {
    console.log(serviceUrl)
    const pages = await getPages(serviceUrl)
    console.log(pages)

    for (const page of pages) {
      console.log('evaluating ', page, 'for accessibility')
        const axeReport = await evaluateAccessibility(page)
        // console.log(axeReport)
        console.log(page)
    }
  }