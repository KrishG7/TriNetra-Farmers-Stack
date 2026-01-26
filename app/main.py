import logging
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import services
from app.services.gee_service import GEEService
from app.services.soil_service import SoilService
from app.services.market_service import MarketService
from app.models.schemas import Location
from app.models.schemas import SoilRequest as InternalSoilRequest

# --- LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trinetra")

# --- APP SETUP ---
app = FastAPI(title="TriNetra API", version="2.0.0")

# --- CORS (Allow Frontend to talk to Backend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SERVICES ---
gee_service = GEEService()
soil_service = SoilService()
market_service = MarketService()

# --- INPUT MODELS ---
class CreditRequest(BaseModel):
    lat: float
    lng: float
    claimed_yield: Optional[float] = None

class MarketRequest(BaseModel):
    crop_name: str
    state: str
    quantity: float
    target_date_str: str

class SoilRequest(BaseModel):
    district: str = "Unknown"
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    rainfall: float
    lang: str = "en"  # Added language support

# --- ROUTES ---

@app.get("/")
def root():
    return {"status": "TriNetra Intelligence Core Online", "port": 8000}

# ✅ 1. MARKET LOCATIONS (The Missing Link)
@app.get("/api/market/locations")
def get_market_locations():
    logger.info("📡 Frontend requested Locations...")
    return market_service.get_market_locations()

# 2. MARKET PREDICTION
@app.post("/api/analyze/market")
async def analyze_market(data: MarketRequest):
    logger.info(f"Market Analysis: {data.crop_name} in {data.state}")
    return market_service.predict_price(
        data.crop_name, data.state, data.quantity, data.target_date_str
    )

# 3. CREDIT ANALYSIS
@app.post("/api/analyze/credit")
async def analyze_credit(data: CreditRequest):
    logger.info(f"Credit Analysis: {data.lat}, {data.lng}")
    loc = Location(lat=data.lat, lng=data.lng)
    return gee_service.get_field_health(loc, claimed_yield=data.claimed_yield)

# 4. SOIL ANALYSIS
@app.post("/api/analyze/soil")
async def analyze_soil(data: SoilRequest):
    logger.info(f"Soil Analysis: N={data.nitrogen} P={data.phosphorus} K={data.potassium}")
    req = InternalSoilRequest(
        district=data.district,
        nitrogen=data.nitrogen,
        phosphorus=data.phosphorus,
        potassium=data.potassium,
        ph=data.ph,
        rainfall=data.rainfall,
        lang=data.lang
    )
    return soil_service.recommend_crop(req)