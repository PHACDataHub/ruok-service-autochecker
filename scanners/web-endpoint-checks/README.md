Accessibiltiy checks - information found here - https://www.w3.org/TR/wai-aria/
Using axe-puppeteer - launches in chrome (headless/ doesn't actually pop-up) to perform checks 

nats cli command:
```
nats pub 'WebEvent' '{"productName": "Observatory", "webEndpoints": ["https://safeinputs.phac.alpha.canada.ca", "https://hopic-sdpac.phac-aspc.alpha.canada.ca", "https://hopic-sdpac.k8s.phac-aspc.alpha.canada.ca", "https://safeinputs.phac.alpha.canada.ca/graphql", "https://api.example.com/api/fakeEndpoint"], "domains": ["entreessecurisees.aspc.alpha.canada.ca", "safeinputs.phac-aspc.alpha.canada.ca", "safeinputs.phac.alpha.canada.ca"], "containerEndpoints": "northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app"}'
```


TODO
* save to database with API
* modify index.js to only process one url, and use url rather than webEndpoints
* docs / docstrings - add to doc pages 
* have this actually crawl instead of finding/ scanning only the surface slugs 
* address credentials by creating service account/ prinicipal to single sign on with minimal permissions to scan set pages for accessibility



Examples
```
Passing check 
{
    "aria-hidden-body": {
      "checkPasses": true,
      "metadata": {
        "description": "Ensures aria-hidden=\"true\" is not present on the document body.",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.8/aria-hidden-body?application=axe-puppeteer"
      }
    }
  },
Inapplicable check 
    {
    "frame-focusable-content": {
      "checkPasses": null,
      "metadata": {
        "description": "Ensures <frame> and <iframe> elements with focusable content do not have tabindex=-1",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.8/frame-focusable-content?application=axe-puppeteer"
      }
    }
  },
Incomplete check
{
    "color-contrast": {
      "checkPasses": "incomplete",
      "metadata": {
        "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
        "impact": "serious",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.8/color-contrast?application=axe-puppeteer",
        "nodes": [
          {
            "message": [
              "Element's background color could not be determined because element contains an image node"
            ],
            "html": "<tspan x=\"0\" y=\"0\">Public Health</tspan>"
          },
          {
            "message": [
              "Element's background color could not be determined because element contains an image node"
            ],
            "html": "<tspan x=\"0\" y=\"83\">Agency of Canada</tspan>"
          },
          {
            "message": [
              "Element's background color could not be determined because it is overlapped by another element"
            ],
            "html": "<input type=\"text\" name=\"username\" maxlength=\"150\" placeholder=\"Missing **username** key\" required=\"\" class=\"textinput textInput form-control\">"
          },
          {
            "message": [
              "Element's background color could not be determined because it is overlapped by another element"
            ],
            "html": "<input type=\"password\" name=\"password\" maxlength=\"128\" placeholder=\"Missing **password** key\" required=\"\" class=\"textinput textInput form-control\">"
          }
        ]
      }
    }
  }

  violations check - simlar to incomplete. 
  ```