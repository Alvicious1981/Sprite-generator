from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 8000
    storage_endpoint: str = "https://s3.amazonaws.com"
    storage_bucket: str = "sprite-generator"
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_region: str = "us-east-1"
    api_base_url: str = "http://localhost:3001"
    api_internal_secret: str = "change-me"


settings = Settings()
