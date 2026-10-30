from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    app_name: str = "HarPA Reflect"
    debug: bool = False

    supabase_url: str = ""
    supabase_key: str = ""

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 480

    whisper_model: str = "base"

    # Initial password for newly seeded accounts; new accounts are skipped if unset.
    seed_password: str = ""

    llm_provider: str = "openai"
    llm_model: str = "gpt-4o-mini"
    llm_api_key: str = ""
    anthropic_api_key: str = ""
    openai_api_key: str = ""


settings = Settings()
