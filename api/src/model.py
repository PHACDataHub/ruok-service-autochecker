from typing import Union

from arango import ArangoClient

import strawberry

from constants import Settings

from graphql_types.input_types import GithubEndpointInput, WebEndpointInput, FilterCriteriaInput


class GraphDB:
    def __init__(self):
        # Add Arangodb host + port
        self.client = ArangoClient(hosts=Settings().DB_HOST)
        self.db = self.client.db(
            Settings().DB_NAME,
            username=Settings().USERNAME,
            password=Settings().PASSWORD,
        )
        self.aql = self.db.aql
        self.graph = self.db.graph(Settings().GRAPH_NAME)
        self.nodes = self.graph.vertex_collection(Settings().VERTEX_COLLECTION)
        self.edges = self.graph.edge_collection(Settings().EDGE_COLLECTION)

    def __del__(self):
        self.client.close()

    def close(self) -> bool:
        self.client.close()
        return True

    def _key_safe_url(self, url: str) -> str:
        return url.replace("://", "-").replace("/", "-")

    def insert_endpoint(self, endpoint):
        endpoint_dict = strawberry.asdict(endpoint)
        url = endpoint_dict["url"]
        kind = endpoint_dict["kind"]
        if url == "":
            return url
        if not self.nodes.get(self._key_safe_url(url)):
            self.nodes.insert({"url": url, "kind": kind, "_key": self._key_safe_url(url)})
        return url

    def upsert_scanner_endpoint(
        self, scanner_endpoint: Union[GithubEndpointInput, WebEndpointInput]
    ):
        # We only want to update non-null keys in the scanner endpoint.
        non_null_endpoints = {
            k: v
            for k, v in strawberry.asdict(scanner_endpoint).items()
            if v is not None
        }
        update_dict = {
            **non_null_endpoints,
            "_key": self._key_safe_url(scanner_endpoint.url),
        }
        if not self.nodes.get(self._key_safe_url(scanner_endpoint.url)):
            self.nodes.insert(update_dict)
        else:
            self.nodes.update(update_dict)
        return scanner_endpoint

    def insert_edge(self, endpoint1, endpoint2, relation):
        endpoint1_dict = strawberry.asdict(endpoint1)
        endpoint2_dict = strawberry.asdict(endpoint2)
        endpoint1 = endpoint1_dict["url"]
        endpoint2 = endpoint2_dict["url"]
        edge_key = f"{self._key_safe_url(endpoint1)}-to-{self._key_safe_url(endpoint2)}"
        if not self.edges.get(edge_key):
            self.edges.insert(
                {
                    "_key": edge_key,
                    "_from": f"{Settings().VERTEX_COLLECTION}/{self._key_safe_url(endpoint1)}",
                    "_to": f"{Settings().VERTEX_COLLECTION}/{self._key_safe_url(endpoint2)}",
                    "relation" : relation
                }
            )

    def insert_endpoints(self, urls):
        if len(urls) == 0:
            return
        if len(urls) == 1:
            self.insert_endpoint(urls[0])
            return
        # Split the list into the first url and remaining urls
        root_url = urls[0]
        other_urls = urls[1:]
        # Insert the root url
        self.insert_endpoint(root_url)
        # For all other urls, make a bidirectional edge between the root url and themselves.
        for url in other_urls:
            self.insert_endpoint(url)
            self.insert_edge(root_url, url, "child")
            self.insert_edge(url, root_url, "parent")
        # Remove stale edges
        self.remove_stale_edges(root_url,other_urls)
        return urls

    def insert_product(self, product, urls):
        if not self.nodes.get(product.url):
            self.insert_endpoint(product)
            # self.nodes.insert({"_key": product})
        print("Inserted Product")
        for url in urls:
            self.insert_endpoint(url)
            print("inserted endpoint")
            print("inserting edge")
            self.insert_edge(product, url, "child")
            self.insert_edge(url, product, "parent")
    
    def remove_stale_edges(self,root_url,urls):
        root_url = self._key_safe_url(strawberry.asdict(root_url)['url'])
        # Fetch URLs related to the root_url currently in the DB
        print(root_url)
        query = f"""FOR v, e, p IN 0..1 OUTBOUND "endpointNodes/{root_url}" GRAPH "endpoints" OPTIONS {{ uniqueVertices: "path" }} FILTER e.relation == "child" RETURN v"""
        cursor = self.aql.execute(query)
        existing_urls = [doc['url'] for doc in cursor]

        new_urls = set(list(map(lambda el:strawberry.asdict(el)['url'], urls)))
        new_urls.add(root_url)

        print(new_urls,existing_urls)
        # Run a loop over exsting URLs and check if they are a part
        # of the new_urls. If not erase the edge between that URL and 
        # the root_url
        for url in existing_urls:
            if url not in new_urls:
                # Delete that edge
                print(url)
                self.remove_edge(root_url,url)
                self.remove_edge(url,root_url)
    
    def remove_edge(self, url1, url2):
        edge_key = f"{self._key_safe_url(url1)}-to-{self._key_safe_url(url2)}"
        self.edges.delete_match({'_key': edge_key})

    def get_scanner_endpoint(self, url):
        return self.nodes.get(self._key_safe_url(url))

    def filter_endpoints(self, criteria : FilterCriteriaInput):
        criteriaDict = strawberry.asdict(criteria)
        criteriaDict = {k: v for k, v in criteriaDict.items() if v is not None}
        print(criteriaDict)
        nodes = self.nodes.find(criteriaDict, skip=0)
        return nodes
    
    def get_scanner_endpoints(self, kind, limit):
        cursor = self.nodes.find({"kind": kind}, skip=0, limit=limit)
        return [document for document in cursor]

    def get_endpoint(self, url):
        if not self.nodes.get(self._key_safe_url(url)):
            return {
                "vertices": [],
                "paths": [],
            }
        return self.graph.traverse(
            start_vertex=f"{Settings().VERTEX_COLLECTION}/{self._key_safe_url(url)}",
            direction="outbound",
            strategy="bfs",
            vertex_uniqueness="global",
            edge_uniqueness="global",
        )

    def get_endpoints(self, urls):
        unique_urls = {}
        for url in urls:
            if url == "":
                continue
            url_vertices = self.get_endpoint(url)["vertices"]
            if url_vertices:
                for v in url_vertices:
                    key =  str({'url' : v["url"],'kind' : v["kind"]}) if "url" in v.keys() \
                            else \
                            str({'url' : v["url"],'kind' : v["kind"]})
                    unique_urls[key] = v
        return list(unique_urls.values())

    def get_referenced_endpoints(self, url):
        unique_urls = []
        if url == "":
            pass
        if not self.nodes.get(self._key_safe_url(url)):
            url = url + "/"
        query = f"""FOR v, e, p IN 0..1 OUTBOUND "endpointNodes/{self._key_safe_url(url)}" GRAPH "endpoints" OPTIONS {{ uniqueVertices: "path" }} FILTER e.relation == "child" RETURN v"""
        cursor = self.aql.execute(query)
        url_vertices = [doc for doc in cursor]
        if url_vertices:
            for v in url_vertices:
                unique_urls.append(v)
        return unique_urls

    def get_all_edges(self):
        return [edge for edge in self.edges.all()]

    def get_all_endpoints(self):
        # return [node['_key'] for node in self.nodes.all()]
        return [node for node in self.nodes.all()]

    def get_service(self, name):
        if not self.nodes.get(self._key_safe_url(name)):
            return {
                "vertices": [],
                "paths": [],
            }
        query = f"""FOR v, e, p IN 0..1 OUTBOUND "endpointNodes/{name}" GRAPH "endpoints" OPTIONS {{ uniqueVertices: "path" }}  RETURN v"""
        cursor = self.aql.execute(query)
        result = [doc for doc in cursor]
        d = {}
        for r in result:
            d[r['kind']] = r
        return d