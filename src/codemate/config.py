# src/codemate/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Tokens
    github_token: str | None = None
    gitlab_token: str | None = None
    bitbucket_token: str | None = None

    # Webhook
    webhook_secret: str | None = None

    # LLM / AI Feedback
    llm_api_key: str | None = None
    llm_model: str = "gpt-4"  # default model

    # Other options
    ci_mode: bool = False
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Singleton instance
settings = Settings()
