from pydantic import Field

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    GRAPHQL_HOST: str = Field("127.0.0.1")
    GRAPHQL_HOST: str = Field("0.0.0.0")
    GRAPHQL_PORT: int = Field(4000)

    DB_HOST: str = Field("http://127.0.0.1:8529")

    DB_NAME: str = Field("ruok")
    USERNAME: str = Field("root")
    PASSWORD: str = Field("")
    GRAPH_NAME: str = Field("endpoints")
    VERTEX_COLLECTION: str = Field("endpointNodes")
    EDGE_COLLECTION: str = Field("endpointEdges")
