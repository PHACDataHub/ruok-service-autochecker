import strawberry

from model import GraphDB

from typing import List

from graphql_types.typedef import Edge, \
                                  Endpoint, \
                                  GithubEndpoint, \
                                  CheckPasses, \
                                  WebEndpoint, \
                                  Accessibility, \
                                  AccessibilityCheckPasses, \
                                  Service

from graphql_types.input_types import FilterCriteriaInput                                  


@strawberry.type
class Query:
    @strawberry.field
    def github_endpoint(self, url: str) -> GithubEndpoint:
        """
        # Get Properties of a Single Github Endpoint

        Given a url, retrieves the properties of a single Github Endpoint.

        # Example

        ```graphql
        query {
            githubEndpoint(url: "https://github.com/someOrg/someRepo") {
                url
                kind
                license
                visibility
                automatedSecurityFixes {
                    checkPasses
                    metadata
                }
            }
        }
        ```
        """
        client = GraphDB()
        endpoint = client.get_scanner_endpoint(url)
        client.close()
        # Remove unecessary db fields from the endpoint dict
        endpoint.pop("_id", None)
        endpoint.pop("_rev", None)
        return GithubEndpoint(
                **{
                    k: CheckPasses(**v)
                    for k, v in endpoint.items()
                    if type(v) is dict
                },
                **{
                    k: v
                    for k, v in endpoint.items()
                    if type(v) is not dict
                }
        )
        # return GithubEndpoint(**endpoint)

    @strawberry.field
    def github_endpoints(self, limit: int) -> List[GithubEndpoint]:
        """
        # Get Multiple Github Endpoints

        Retrieves a list of Github Endpoints. The number of endpoints returned is
        determined by the `limit` parameter.

        # Example

        ```graphql
        query	{
            githubEndpoints(limit: 10){
            url
            kind
            Key
            owner
        }
        }
        ```
        """
        client = GraphDB()
        endpoints = client.get_scanner_endpoints("Github", limit)
        client.close()
        # Remove unecessary db fields from the endpoint dict
        for endpoint in endpoints:
            endpoint.pop("_id", None)
            endpoint.pop("_rev", None)
        return [GithubEndpoint(
                        **{
                            k: CheckPasses(**v)
                            for k, v in endpoint.items()
                            if type(v) is dict
                        },
                        **{
                            k: v
                            for k, v in endpoint.items()
                            if type(v) is not dict
                        }
                    )    
                for endpoint in endpoints]
        # return [GithubEndpoint(**endpoint) for endpoint in endpoints]
    
    @strawberry.field
    def web_endpoint(self, url: str) -> WebEndpoint:
        """
        # Get Properties of a Single Web Endpoint

        Given a url, retrieves the properties of a single Web Endpoint.

        # Example

        ```graphql
        query {
            webEndpoint(url: "https://safeinputs.phac.alpha.canada.ca") {
                url
                accessibility {
                url
                areaAlt {
                    checkPasses
                    metadata
                }
                }
            }
        }
        ```
        """
        client = GraphDB()
        endpoint = client.get_scanner_endpoint(url)
        client.close()
        # Remove unecessary db fields from the endpoint dict
        endpoint.pop("_id", None)
        endpoint.pop("_rev", None)

        if 'accessibility' not in endpoint:
            endpoint['accessibility'] = []
        
        # Strawberry doesn't recursively resolve fields. The code below
        # is a workaround to recursively resolve the accessibility field
        # and the "check passes" fields contained within.
        return WebEndpoint(
            url=endpoint['url'],
            kind=endpoint['kind'],
            _key=endpoint['_key'],
            accessibility=[
                Accessibility(**{
                    k: AccessibilityCheckPasses(**v)
                    for k, v in ep.items()
                    if type(v) is not str
                },
                url=ep['url'])
                for ep in endpoint['accessibility']
            ]
        )
    
    @strawberry.field
    def web_endpoints(self, limit: int) -> List[WebEndpoint]:
        """
        # Get Multiple Web Endpoints

        Retrieves a list of Web Endpoints. The number of endpoints returned is
        determined by the `limit` parameter.

        # Example

        ```graphql
        query {
            webEndpoints(limit: 10) {
                url
                accessibility {
                url
                areaAlt {
                    checkPasses
                    metadata
                }
                }
            }
        }
        ```
        """
        client = GraphDB()
        endpoints = client.get_scanner_endpoints("Web", limit)
        client.close()
        # Remove unecessary db fields from the endpoint dict
        for endpoint in endpoints:
            endpoint.pop("_id", None)
            endpoint.pop("_rev", None)
        # Strawberry doesn't recursively resolve fields. The code below
        # is a workaround to recursively resolve the accessibility field
        # and the "check passes" fields contained within.
        return [
            WebEndpoint(
                url=endpoint['url'],
                kind=endpoint['kind'],
                _key=endpoint['_key'],
                accessibility=[
                    Accessibility(**{
                        k: AccessibilityCheckPasses(**v)
                        for k, v in ep.items()
                        if type(v) is not str
                    },
                    url=ep['url'])
                    for ep in endpoint['accessibility']
                ]
            )
            for endpoint in endpoints
        ]

    @strawberry.field
    def endpoints(self, urls: List[str]) -> List[Endpoint]:
        """
        # Get Multiple Endpoints

        Given a subset of URLs, retrieves all URLs assocaited with any
        URLs in the subset. Note that the purpose of this query is to get information
        on which URLs are related to eachother, not to get detailed information about
        any specific kind of endpoint.

        # Example

        ```graphql
        query {
            endpoints(urls:["https://some-webapp.canada.ca"]) {
                url
            }
        }
        ```

        """
        client = GraphDB()
        endpoints = client.get_endpoints(urls)
        client.close()
        return [Endpoint(url=vertex['url'],
                         kind=vertex['kind']) for vertex in endpoints]

    @strawberry.field
    def referenced_endpoints(self, url: str) -> List[Endpoint]:
        """
        # Get Multiple Endpoints

        Given a subset of URLs, retrieves all URLs assocaited with any
        URLs in the subset. Note that the purpose of this query is to get information
        on which URLs are related to eachother, not to get detailed information about
        any specific kind of endpoint.

        # Example

        ```graphql
        query {
            endpoints(urls:["https://some-webapp.canada.ca"]) {
                url
            }
        }
        ```

        """
        client = GraphDB()
        endpoints = client.get_referenced_endpoints(url)
        client.close()
        return [Endpoint(url=vertex['url'],
                         kind=vertex['kind'],
                         _key=vertex['_key']) for vertex in endpoints]

    @strawberry.field
    def all_edges(self) -> List[Edge]:
        """
        # Get All Edges

        Returns all existing edges within the Arango Graph

        # Example

        ```graphql
        query {
            allEdges {
                url
            }
        }
        ```

        """
        client = GraphDB()
        edges = client.get_all_edges()
        client.close()
        return [Edge(_key=edge['_key'],
                     _id=edge['_id'],
                     from_url=Endpoint(url=edge['_from'],kind=None),
                     to_url=Endpoint(url=edge['_to'],kind=None)) for edge in edges]

    @strawberry.field
    def all_endpoints(self) -> List[Endpoint]:
        """
        # Get All Endpoints

        Returns all existing endpoints within the Arango Graph 

        # Example

        ```graphql
        query {
            allEndpoints {
                url
            }
        }
        ```

        """
        client = GraphDB()
        endpoints = client.get_all_endpoints()
        # print(endpoints)
        client.close()
        return [Endpoint(url=endpoint['url'],
                         kind=endpoint['kind']) for endpoint in endpoints]

    @strawberry.field
    def filter(self, criteria : FilterCriteriaInput) -> List[Endpoint]:
        """
        # Filter Endpoints

        Returns all existing endpoints within the Arango Graph that match the filter cirteria

        # Example

        ```graphql
        query {
            filter(criteria: {kind: "Service"}) {
                url
                kind
            }
        }
        ```

        """
        client = GraphDB()
        endpoints = client.filter_endpoints(criteria=criteria)
        client.close()
        return [Endpoint(url=endpoint['url'],
                         kind=endpoint['kind']) for endpoint in endpoints]

    @strawberry.field
    def service(self, name: str) -> Service:
        client = GraphDB()
        """
        # Fetch a Service

        Returns a Service that contains its related Github Repo and Web URL

        # Example

        ```graphql
        query{
            service(name : "observatory-alpha-phac-gc-ca"){
                url
                kind
                githubEndpoint {
                    url
                    kind
                    programmingLanguage
                    license
                    visibility
                    hasSecurityMd {
                        metadata
                        checkPasses
                    }
                    hasDependabotYaml {
                        metadata
                        checkPasses
                    }
                }
                webEndpoint {
                    url
                    kind
                    accessibility {
                        areaAlt {
                        metadata 
                        checkPasses
                        }
                    }
                }
            }
        }
        ```

        """
        result = client.get_service(name)
        client.close()
        service = result['Service']
        githubEndpoint = result['Github']
        githubEndpoint.pop("_id", None)
        githubEndpoint.pop("_rev", None)

        webEndpoint = result['Web']
        webEndpoint.pop("_id", None)
        webEndpoint.pop("_rev", None)

        if 'accessibility' not in webEndpoint:
            webEndpoint['accessibility'] = []

        return Service(url = service['url'],
                       kind = service['kind'],
                       _key = service['_key'],
                       webEndpoint =  WebEndpoint(
                                        url=webEndpoint['url'],
                                        kind=webEndpoint['kind'],
                                        _key=webEndpoint['_key'],
                                        accessibility=[
                                            Accessibility(**{
                                                k: AccessibilityCheckPasses(**v)
                                                for k, v in ep.items()
                                                if type(v) is not str
                                            },
                                            url=ep['url'])
                                            for ep in webEndpoint['accessibility']
                                        ]
                                    ),
                        githubEndpoint = GithubEndpoint(
                                        **{
                                            k: CheckPasses(**v)
                                            for k, v in githubEndpoint.items()
                                            if type(v) is dict
                                        },
                                        **{
                                            k: v
                                            for k, v in githubEndpoint.items()
                                            if type(v) is not dict
                                        }
                    ))
