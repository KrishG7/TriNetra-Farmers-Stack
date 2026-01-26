import uvicorn
from app.core.config import settings


if __name__ == "__main__":
    # Ensure data directory exists
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if required data files exist
    required_files = [
        settings.SOIL_DATA_PATH,
        settings.MARKET_DATA_PATH,
        settings.FARMERS_DATA_PATH,
    ]
    
    missing_files = [f for f in required_files if not f.exists()]
    
    if missing_files:
        print("⚠️  WARNING: Missing required data files:")
        for f in missing_files:
            print(f"  - {f.name}")
        print("\nPlease add these files to the 'data' folder before running.")
    
    print("🚀 Starting TriNetra Backend...")
    print(f"📍 Environment: {settings.ENVIRONMENT}")
    print(f"🔧 Debug Mode: {settings.DEBUG}")
    
    # Determine host based on environment
    host = "127.0.0.1" if settings.ENVIRONMENT == "development" else "0.0.0.0"
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )