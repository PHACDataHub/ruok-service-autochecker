import strawberry

from model import GraphDB

from typing import List

from graphql_types.typedef import Endpoint, GithubEndpoint, WebEndpoint, Accessibility, AccessibilityCheckPasses


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
            owner
            repo
            description
            visibility
            license
            api
            securityAndAnalysis
            programmingLanguage
            automatedSecurityFixes {
                checkPasses
                metadata
            }
            vulnerabilityAlerts {
                checkPasses
                metadata
            }
            branchProtection {
                checkPasses
                metadata
            }
            hasSecurityMd {
                checkPasses
                metadata
            }
            hasDependabotYaml {
                checkPasses
                metadata
            }
            gitleaks {
                checkPasses
                metadata
            }
            hadolint {
                checkPasses
                metadata
            }
            trivyRepoVulnerability {
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


        # Remove unnecessary db fields from the endpoint dict
        endpoint.pop("_id", None)
        endpoint.pop("_rev", None)
        return GithubEndpoint(**endpoint)


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
        return [GithubEndpoint(**endpoint) for endpoint in endpoints]
    
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
        return [Endpoint(url=vertex) for vertex in endpoints]

    @strawberry.field
    def product(self, name: str) -> str:
        # TODO: implement product
        return name
