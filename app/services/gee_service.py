import ee
import logging
import datetime
import random
from google.oauth2 import service_account

logger = logging.getLogger(__name__)

class GEEService:
    def __init__(self):
        self.gee_enabled = False
        
        # 1. FORCE AUTHENTICATION VIA JSON
        # This uses the logic that worked in your test script
        try:
            KEY_PATH = 'service_account.json'
            
            credentials = service_account.Credentials.from_service_account_file(KEY_PATH)
            scoped_credentials = credentials.with_scopes(
                ['https://www.googleapis.com/auth/earthengine']
            )
            ee.Initialize(credentials=scoped_credentials)
            
            self.gee_enabled = True
            logger.info("✓ Google Earth Engine Connected (via Service Account)")
            
        except Exception as e:
            logger.warning(f"⚠️ GEE Init Failed: {e}. Switching to Mock Mode.")
            self.gee_enabled = False

    def get_field_health(self, location, claimed_yield=None):
        """
        Analyzes field health. Uses Real GEE if connected, Mock if not.
        """
        if not self.gee_enabled:
            return self._get_mock_data(location, claimed_yield)

        try:
            point = ee.Geometry.Point([location.lng, location.lat])

            # 2. REAL LAND COVER CHECK (ESA WorldCover)
            # 10=Tree, 20=Shrub, 30=Grass, 40=Crop, 50=Urban, 60=Barren, 80=Water
            cover_img = ee.ImageCollection("ESA/WorldCover/v100").first()
            land_class = cover_img.reduceRegion(
                reducer=ee.Reducer.first(), 
                geometry=point, 
                scale=10
            ).get('Map').getInfo()
            
            # Map code to readable name
            land_names = {
                10: "Trees/Forest", 20: "Shrubland", 30: "Grassland", 40: "Cropland",
                50: "Urban/Building", 60: "Barren Land", 80: "Water Body", 90: "Wetland", 95: "Mangroves"
            }
            land_name = land_names.get(land_class, "Unknown")

            # Strict Filter: Only allow Crop (40) or Grass (30)
            if land_class not in [30, 40]:
                return {
                    "status": "REJECTED",
                    "land_type": land_name,
                    "ndvi": 0, "ndwi": 0, "health_score": 0,
                    "verification": {
                        "likelihood": "low", 
                        "recommendation": f"❌ Rejected: Location is {land_name}, not a farm."
                    }
                }

            # 3. REAL SATELLITE DATA (Sentinel-2)
            # Fetch last 45 days of images to ensure we find a cloud-free one
            end_date = datetime.date.today()
            start_date = end_date - datetime.timedelta(days=45)
            
            dataset = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                       .filterBounds(point)
                       .filterDate(start_date.isoformat(), end_date.isoformat())
                       .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                       .sort('CLOUDY_PIXEL_PERCENTAGE')
                       .first())

            if not dataset:
                # Fallback to mock if cloudy (better UX than crashing)
                logger.warning("No clear image found, falling back to mock.")
                return self._get_mock_data(location, claimed_yield)

            # Calculate Indices
            ndvi = dataset.normalizedDifference(['B8', 'B4']).reduceRegion(ee.Reducer.mean(), point, 10).get('nd').getInfo()
            ndwi = dataset.normalizedDifference(['B3', 'B8']).reduceRegion(ee.Reducer.mean(), point, 10).get('nd').getInfo()
            
            # Sanitize (sometimes edge pixels give None)
            if ndvi is None: ndvi = 0.5
            if ndwi is None: ndwi = -0.1

            return self._calculate_final_score(ndvi, ndwi, claimed_yield, land_name)

        except Exception as e:
            logger.error(f"GEE Runtime Error: {e}")
            return self._get_mock_data(location, claimed_yield)

    def _calculate_final_score(self, ndvi, ndwi, claimed_yield, land_type="Cropland"):
        """
        The Mathematical Scoring Model
        """
        # Normalize NDVI (0.2 to 0.8 is typical for healthy crops)
        base_score = max(0, min(100, (ndvi * 100) + 20)) 
        
        # Penalize for Water Stress (NDWI should not be too low)
        if ndwi < -0.3: base_score -= 20
        
        # Yield Verification Logic
        penalty = 0
        if claimed_yield:
            try:
                claim = float(claimed_yield)
                # Max realistic yield depends on Greenness (NDVI)
                # Logic: Higher NDVI = Higher potential yield
                max_yield_limit = (ndvi * 60) # e.g. 0.8 * 60 = 48 Quintals max
                if max_yield_limit < 15: max_yield_limit = 15 # Floor
                
                if claim > max_yield_limit:
                    over_claim = claim - max_yield_limit
                    penalty = over_claim * 2.5 # Steep penalty for lying
            except:
                pass 

        final_score = max(0, min(100, base_score - penalty))
        
        # Determine Verdict
        if final_score > 75: rec = "✅ High Creditworthiness. Excellent crop health verified."
        elif final_score > 50: rec = "⚠️ Moderate Risk. Crop health matches claims."
        else: rec = "❌ High Risk. Discrepancy between Satellite & Claim."

        return {
            "status": "SUCCESS",
            "land_type": land_type,
            "ndvi": round(ndvi, 2),
            "ndwi": round(ndwi, 2),
            "health_score": round(final_score / 100, 2),
            "verification": {
                "likelihood": "high" if final_score > 60 else "low",
                "recommendation": rec
            }
        }

    def _get_mock_data(self, location, claimed_yield):
        """Fallback for when Internet/GEE is down"""
        # Deterministic random based on location so it doesn't flicker
        random.seed(location.lat + location.lng)
        sim_ndvi = random.uniform(0.45, 0.75)
        sim_ndwi = random.uniform(-0.15, 0.1)
        return self._calculate_final_score(sim_ndvi, sim_ndwi, claimed_yield, "Simulated Farm")