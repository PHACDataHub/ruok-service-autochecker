import strawberry

from typing import List

from graphql_types.input_types import EndpointInput, GithubEndpointInput, WebEndpointInput
from graphql_types.typedef import GithubEndpoint
from model import GraphDB


@strawberry.type
class Mutation:
    @strawberry.mutation
    def endpoint(self, url: str) -> str:
        """
        Insert an endpoint with no additional metadata. This mutation should only
        be used by the graph updater component to update the graph structure.
        """
        client = GraphDB()
        client.insert_endpoint(url)
        client.close()
        return url

    @strawberry.mutation
    def githubEndpoint(self, endpoint: GithubEndpointInput) -> str:
        """
        # Update/Insert Github Endpoint

        Insert a Github Endpoint with "upsert" semantics. If the endpoint doesn't already
        exist, the endpoint document will be created. If the endpoint already exists, its
        fields will be updated with the values provided in the mutation.

        # Example

        ```graphql
        mutation {
            githubEndpoint(
                endpoint: {
                url:"https://github.com/someOrg/someRepo"
                kind: "Github"
                owner: "someOrg"
                repo:"someRepo"
                license: "MIT"
                visibility:"Public"
                programmingLanguage:["Python", "JavaScript", "Bash", "Dockerfile"]
                automatedSecurityFixes: {
                    checkPasses: true
                    metadata: {}
                }
                vulnerabilityAlerts: {
                    checkPasses: false
                    metadata: {
                    key: "value"
                    }
                }
                branchProtection:{
                    checkPasses:true,
                    metadata:{
                    key:"value"
                    }
                }
                }
            )
        }
        ```
        """
        client = GraphDB()
        client.upsert_scanner_endpoint(endpoint)
        client.close()
        print(endpoint)
        return endpoint.url
    
    @strawberry.mutation
    def webEndpoint(self, endpoint: WebEndpointInput) -> str:
        """
        # Update/Insert Web Endpoint

        Insert a Web Endpoint with "upsert" semantics.

        # Example

        ```graphql
        mutation {
        webEndpoint(
            endpoint: {
            url: "https://some-webapp.canada.ca"
            kind: "Web"
            accessibility: [
                        {
                    url: "https://some-webapp.canada.ca/about",
                    areaAlt: {
                        checkPasses: null,
                        metadata: {
                            description: "Ensures <area> elements of image maps have alternate text",
                            helpUrl: "https://dequeuniversity.com/rules/axe/4.8/area-alt?application=axe-puppeteer"
                        }
                    },
                    ariaBrailleEquivalent: {
                        checkPasses: "false",
                        metadata: {
                            description: "Ensure aria-braillelabel and aria-brailleroledescription have a non-braille equivalent",
                            helpUrl: "https://dequeuniversity.com/rules/axe/4.8/aria-braille-equivalent?application=axe-puppeteer"
                        }
                    },
                    ariaCommandName: {
                        checkPasses: null,
                        metadata: {
                            description: "Ensures every ARIA button, link and menuitem has an accessible name",
                            helpUrl: "https://dequeuniversity.com/rules/axe/4.8/aria-command-name?application=axe-puppeteer"
                        }
                    },
                    ariaHiddenFocus: {
                        checkPasses: "true",
                        metadata: {
                            description: "Ensures aria-hidden elements are not focusable nor contain focusable elements",
                            helpUrl: "https://dequeuniversity.com/rules/axe/4.8/aria-hidden-focus?application=axe-puppeteer"
                        }
                    },
                    ariaMeterName: {
                        checkPasses: "incomplete",
                        metadata: {
                            description: "Ensures every ARIA meter node has an accessible name",
                            helpUrl: "https://dequeuniversity.com/rules/axe/4.8/aria-meter-name?application=axe-puppeteer"
                        }
                    }
                }
            ]
            }
        )
        }
        ```
        """
        client = GraphDB()
        client.upsert_scanner_endpoint(endpoint)
        client.close()
        return endpoint.url

    @strawberry.mutation
    def endpoints(self, urls: List[EndpointInput]) -> List[str]:
        """
        Writes a list of URLs to the graph. Each URL will be associated with
        every other URL in the list.
        """
        client = GraphDB()
        client.insert_endpoints(urls)
        client.close()
        return list(map(lambda url:strawberry.asdict(url)["url"],urls))

    @strawberry.mutation
    def product(self, product: EndpointInput, urls: List[EndpointInput]) -> str:
        """
        Attaches a product label to a list of URLs.
        """
        client = GraphDB()
        client.insert_product(product, urls)
        client.close()
        return product.url
