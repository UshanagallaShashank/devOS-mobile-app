from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    supabase_url: str
    supabase_service_key: str
    gemini_api_key: str
    serper_api_key: str
    langchain_api_key: str = ''
    langchain_project: str = 'devos'
    langchain_tracing_v2: bool = True

    database_url: str = ''
    db_password: str = ''  # Supabase DB password — Settings > Database > Database password

    @property
    def db_url(self) -> str:
        if self.database_url:
            return self.database_url
        host = self.supabase_url.replace('https://', '').replace('http://', '')
        password = self.db_password
        return f'postgresql+psycopg2://postgres:{password}@db.{host}:5432/postgres'

settings = Settings()  # type: ignore[call-arg]
