import ee
import sys
import os

# --- PATH FIX: Allow looking "up" one level to find 'app' ---
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now the imports will work:
from app.services.market_service import MarketService # etc...

def check_gee():
    try:
        # Option A: Automatic (Works if you did 'earthengine authenticate')
        print("🔄 Attempting automatic authentication...")
        ee.Initialize()
        print("✅ GEE Connected! (Using Default Credentials)")
        
    except Exception as e:
        print(f"❌ Default Auth Failed: {e}")
        
        # Option B: Manual Service Account (If you prefer the JSON file)
        try:
            print("\n🔄 Attempting Service Account authentication...")
            from google.oauth2 import service_account
            
            # Make sure this path is correct!
            KEY_PATH = 'service_account.json'
            
            credentials = service_account.Credentials.from_service_account_file(KEY_PATH)
            scoped_credentials = credentials.with_scopes(
                ['https://www.googleapis.com/auth/earthengine']
            )
            ee.Initialize(credentials=scoped_credentials)
            print("✅ GEE Connected! (Using service_account.json)")
            
        except Exception as e2:
            print(f"❌ Service Account Auth Failed: {e2}")
            return

    # TEST: If connected, ask GEE for the elevation of Mt. Everest
    try:
        print("\n🌍 Running Test Query (Elevation of Mt. Everest)...")
        dem = ee.Image('USGS/SRTMGL1_003')
        xy = ee.Geometry.Point([86.9250, 27.9881])
        elev = dem.sample(xy, 30).first().get('elevation').getInfo()
        print(f"🎉 SUCCESS! Real Data Received: Mt. Everest is {elev}m tall.")
    except Exception as e3:
        print(f"❌ Connection worked, but query failed: {e3}")

if __name__ == "__main__":
    check_gee()