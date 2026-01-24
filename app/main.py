import logging
import time
from typing import Optional
from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Import your existing services & config
from app.core.config import settings
from app.services.gee_service import GEEService
from app.services.soil_service import SoilService
from app.services.market_service import MarketService
from app.repositories.data_repo import DataRepository
from app.models.schemas import Location, SoilRequest

# ========================
# LOGGING CONFIGURATION
# ========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("trinetra")

# ========================
# APP SETUP
# ========================
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TriNetra – Smart Agricultural Intelligence Platform (Monolith)"
)

# CORS (Allowed for flexibility)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static & Templates
# Note: Ensure the 'app/static' folder exists, even if empty
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# Initialize Services
gee_service = GEEService()
soil_service = SoilService()
market_service = MarketService()
data_repo = DataRepository()

# Simple In-Memory OTP Store
otp_store = {} 

# ========================
# STARTUP EVENTS
# ========================
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info(f"🚀 TriNetra starting...")
    logger.info(f"📁 Data directory: {settings.DATA_DIR}")
    
    # Validate data files
    try:
        data_repo._validate_data_files()
        logger.info("✓ All data files validated")
    except Exception as e:
        logger.error(f"✗ Data validation failed: {str(e)}")
    
    logger.info("✓ TriNetra ready to serve farmers!")

# ========================
# AUTH ROUTES
# ========================
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    user_phone = request.cookies.get("user_phone")
    if not user_phone:
        # Serve the new Landing Page instead of login
        return templates.TemplateResponse("landing.html", {"request": request})
    
    user = data_repo.get_farmer_by_phone(user_phone)
    return templates.TemplateResponse("dashboard.html", {"request": request, "user": user})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_route(request: Request):
    user_phone = request.cookies.get("user_phone")
    if not user_phone:
        return RedirectResponse("/login")
    user = data_repo.get_farmer_by_phone(user_phone)
    return templates.TemplateResponse("dashboard.html", {"request": request, "user": user})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login")
    response.delete_cookie("user_phone")
    return response

@app.post("/api/auth/send-otp")
async def send_otp(phone: str = Form(...)):
    user = data_repo.get_farmer_by_phone(phone)
    # Demo Logic: We allow anyone to login, even if not in DB
    otp = "1234"
    otp_store[phone] = otp
    logger.info(f"OTP generated for {phone}: {otp}")
    return JSONResponse({"status": "success", "message": "OTP sent"})

@app.post("/api/auth/verify-otp")
async def verify_otp(phone: str = Form(...), otp: str = Form(...)):
    if otp_store.get(phone) == otp:
        # Create user if not exists
        user = data_repo.get_farmer_by_phone(phone)
        if not user:
            new_user = {
                "farmer_id": f"FARM_{phone}", 
                "name": "New Farmer", 
                "phone": phone, 
                "state": "Unknown", 
                "district": "Unknown"
            }
            data_repo.add_farmer(new_user)
        
        response = JSONResponse({"status": "success"})
        response.set_cookie(key="user_phone", value=phone)
        return response
    
    return JSONResponse({"status": "error", "message": "Invalid OTP"}, status_code=400)

# ========================
# LOGIC ROUTES
# ========================

@app.post("/api/analyze/market")
async def analyze_market(
    crop_name: str = Form(...), 
    state: str = Form(...), 
    quantity: float = Form(...),
    target_date_str: str = Form(...) # <--- NEW PARAMETER
):
    try:
        # Pass the date to the service
        result = market_service.predict_price_trend(crop_name, state, quantity, target_date_str)
        return result if result else {"error": "Insufficient data"}
    except Exception as e:
        logger.error(f"Market Error: {e}")
        return {"error": str(e)}

@app.post("/api/analyze/soil")
async def analyze_soil(
    district: str = Form(...), nitrogen: float = Form(...), phosphorus: float = Form(...),
    potassium: float = Form(...), ph: float = Form(...), rainfall: float = Form(...)
):
    try:
        req = SoilRequest(
            district=district, nitrogen=nitrogen, phosphorus=phosphorus,
            potassium=potassium, ph=ph, rainfall=rainfall
        )
        return soil_service.recommend_crop(req)
    except Exception as e:
        logger.error(f"Soil Error: {e}")
        return {"error": str(e)}

@app.post("/api/analyze/credit")
async def analyze_credit(
    lat: float = Form(...), 
    lng: float = Form(...), 
    claimed_yield: Optional[str] = Form(None) # Receive as String to handle empty inputs safely
):
    try:
        # Convert claimed_yield to float safely, or use None if empty
        yield_val = None
        if claimed_yield and claimed_yield.strip():
            try:
                yield_val = float(claimed_yield)
            except ValueError:
                pass # Ignore bad input
        
        loc = Location(lat=lat, lng=lng)
        
        # Pass the safe value to the service
        result = gee_service.get_field_health(loc, claimed_yield=yield_val)
        
        return result
        
    except Exception as e:
        logger.error(f"Credit Error: {e}")
        # Return a 'safe' error structure so frontend doesn't show NaN
        return {
            "status": "ERROR",
            "health_score": 0, 
            "verification": {
                "likelihood": "low",
                "recommendation": f"System Error: {str(e)}"
            }
        }