# GraphQL API

This folder contains documentation for the GraphQL API component of the ruok-service-autochecker project.

## Getting Started with Local Development

Run `make` to create a local `venv` folder (`.gitignore`d) and `pip install` all of the `requirements.txt` dependencies into the `venv` folder. The default target in the `Makefile` also activates the virtual environment.

### Sample Queries
```
FOR doc in endpointNodes
    FILTER doc.kind == "Github"
    RETURN {"url": doc.url, "visibility": doc.visibility, "Kind": doc.kind}
```

```
FOR doc in endpointNodes
    RETURN doc
```

Products with api
```
FOR doc IN endpointNodes
  FILTER doc.kind == 'Github' && doc.api == true
  RETURN {"endpoint":doc.url}
```

failing checks per repo
```
FOR doc IN endpointNodes
  FILTER doc.kind == 'Github'
  RETURN {
    web_url: doc.url, 
    failing_checks: (
      FOR key IN ATTRIBUTES(doc)
        FILTER doc[key].check_passes == false
        RETURN key
    )
  }
```

vulerabilities (high/ critical)
```
FOR doc IN endpointNodes
  FILTER doc.kind == 'Github' && doc.trivy_repo_vulnerability.metadata
  LET vulnerabilities = doc.trivy_repo_vulnerability.metadata
  LET filtered_vulnerabilities = (
    FOR vuln IN vulnerabilities
      FILTER vuln.severity == 'HIGH' || vuln.severity == 'CRITICAL'
      RETURN vuln
  )
  RETURN { "endpoint": doc.url, "high_critical_vulnerabilities": filtered_vulnerabilities }
```

Failing web checks
```
FOR doc IN endpointNodes
  FILTER doc.kind == 'Web'
  RETURN {
    web_url: doc.url, 
    page: (
      FOR endpoint IN doc.accessibility
        RETURN {
          page: endpoint.url,
          failing_checks: (
            FOR key IN ATTRIBUTES(endpoint)
              FILTER endpoint[key].check_passes == "false"
              RETURN { 
                check: key, 
                check_passes: endpoint[key].check_passes 
              }
          )
        }
    )
  }
```

Passing web checks
```
FOR doc IN endpointNodes
  FILTER doc.kind == 'Web'
  RETURN {
    web_url: doc.url, 
    page: (
      FOR endpoint IN doc.accessibility
        RETURN {
          page: endpoint.url,
          passing_checks: (
            FOR key IN ATTRIBUTES(endpoint)
              FILTER endpoint[key].check_passes == "true"
              RETURN { 
                check: key, 
                check_passes: endpoint[key].check_passes 
              }
          )
        }
    )
  }
```
  