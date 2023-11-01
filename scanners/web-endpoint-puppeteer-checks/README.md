Accessibiltiy checks - information found here - https://www.w3.org/TR/wai-aria/
Using axe-puppeteer - launches in chrome (headless/ doesn't actually pop-up) to perform checks 

nats cli command:
```
nats pub 'WebEvent.Ruok' '{"productName": "Observatory", "webEndpoints": ["https://safeinputs.phac.alpha.canada.ca", "https://hopic-sdpac.phac-aspc.alpha.canada.ca", "https://hopic-sdpac.k8s.phac-aspc.alpha.canada.ca", "https://safeinputs.phac.alpha.canada.ca/graphql", "https://api.example.com/api/fakeEndpoint"], "domains": ["entreessecurisees.aspc.alpha.canada.ca", "safeinputs.phac-aspc.alpha.canada.ca", "safeinputs.phac.alpha.canada.ca"], "containerEndpoints": "northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app"}'
```


