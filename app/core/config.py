import os
from pathlib import Path
from dotenv import load_dotenv

# --- 1. Smart Import (Fixes "Import could not be resolved") ---
try:
    # Try the new Pydantic V2 way
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback to the old Pydantic V1 way (which seems to work for you)
    from pydantic import BaseSettings

# --- 2. Force Load .env File ---
# This ensures variables are loaded even if Pydantic misses them
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings(BaseSettings):
    # --- Project Info ---
    PROJECT_NAME: str = "TriNetra"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # --- SECRETS ---
    # We give it a default value ("") so the app doesn't crash on startup.
    # If it's missing, you'll just get a "Gemini Init Failed" log instead of a hard crash.
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")

    # --- Paths ---
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = BASE_DIR / "data"
    
    # Keep these paths if your app still references them
    SOIL_DATA_PATH: Path = DATA_DIR / "soil_database_real.csv"
    MARKET_DATA_PATH: Path = DATA_DIR / "market_history.csv"
    FARMERS_DATA_PATH: Path = DATA_DIR / "farmers.json"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" # Prevents crashes if .env has extra variables

settings = Settings()