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

Failed accessibility:
```
FOR doc in endpointNodes
    FILTER doc.kind == 'Web' 
LET failedChecks = (
    FOR check IN doc.accessibility
      FILTER check.check_passes == false
      RETURN check
  )
  FILTER LENGTH(failedChecks) > 0
  RETURN {
    url: doc.url,
    failedChecks: failedChecks
  }
  ```


FOR doc IN endpointNodes
  FILTER doc.kind == 'Web'
  RETURN {
    url: doc.url,
    check_passes: doc.accessibility[0].check_passes 
  }


  FOR doc IN endpointNodes
    FILTER doc.kind == 'Web'
//    RETURN {
//        url: doc.url,
//        pages: (
          FOR page IN doc.accessibility
//            FOR pageKey, page IN OBJECT_VALUES(doc.accessibility)
//                RETURN {
//                    page: page.url,
                    
//                    checks: (
 //                       FOR check IN page 
                            RETURN {
                              //check_passes: check.check_passes,
                              url
                              }
//                    )
//                }
//        )
//  }