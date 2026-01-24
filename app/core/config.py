import os
from pathlib import Path

class Settings:
    # Points to the root folder
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    DATA_DIR = BASE_DIR / "data"
    
    SOIL_DATA_PATH = DATA_DIR / "soil_database_real.csv"
    MARKET_DATA_PATH = DATA_DIR / "market_history.csv"
    FARMERS_DATA_PATH = DATA_DIR / "farmers.json"
    
    PROJECT_NAME = "TriNetra"
    VERSION = "1.0.0"
    ENVIRONMENT = "development"
    DEBUG = True

settings = Settings()