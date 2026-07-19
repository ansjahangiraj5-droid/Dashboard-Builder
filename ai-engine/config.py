from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    watsonx_api_key: str = ""
    watsonx_project_id: str = ""
    watsonx_url: str = "https://us-south.ml.cloud.ibm.com"
    backend_url: str = "http://backend:3001"
    secret_key: str = "dev_secret_change_in_production"
    max_upload_size_mb: int = 100

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
