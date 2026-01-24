import json
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, Any, List
from app.core.config import settings


class DataRepository:
    """
    Centralized data access layer for TriNetra.
    Handles CSV and JSON reads safely with proper error handling.
    """
    
    def __init__(self):
        self.soil_data_path: Path = settings.SOIL_DATA_PATH
        self.market_data_path: Path = settings.MARKET_DATA_PATH
        self.farmers_data_path: Path = settings.FARMERS_DATA_PATH
        
        # Validate critical files exist at initialization
        self._validate_data_files()
    
    def _validate_data_files(self) -> None:
        """Ensure all required data files exist."""
        required_files = {
            "soil": self.soil_data_path,
            "market": self.market_data_path,
            "farmers": self.farmers_data_path,
        }
        
        missing = [name for name, path in required_files.items() if not path.exists()]
        
        if missing:
            raise FileNotFoundError(
                f"Required data files missing: {', '.join(missing)}. "
                f"Check {settings.DATA_DIR}"
            )
    
    # -------------------------
    # SOIL DATA
    # -------------------------
    def load_soil_data(self) -> pd.DataFrame:
        """Load all soil data from CSV."""
        try:
            return pd.read_csv(self.soil_data_path)
        except Exception as e:
            raise RuntimeError(f"Failed to load soil data: {str(e)}")
    
    def get_soil_data_by_district(self, district_name: str) -> Optional[Dict[str, Any]]:
        """Get soil data for a specific district (case-insensitive)."""
        try:
            df = self.load_soil_data()
            # Handle multiple possible column names
            district_col = next(
                (col for col in df.columns if col.lower() == "district"),
                "District"
            )
            
            data = df[df[district_col].str.lower() == district_name.lower()]
            
            if data.empty:
                return None
            
            return data.iloc[0].to_dict()
        except Exception as e:
            raise RuntimeError(f"Error reading soil data for {district_name}: {str(e)}")
    
    # -------------------------
    # MARKET DATA
    # -------------------------
    def load_market_data(self) -> pd.DataFrame:
        """Load all market data from CSV."""
        try:
            return pd.read_csv(self.market_data_path)
        except Exception as e:
            raise RuntimeError(f"Failed to load market data: {str(e)}")
    
    def get_market_data_for_crop(
        self, crop_name: str, state: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Get market data for a crop (optionally filtered by state).
        Returns DataFrame (may be empty if no matches).
        """
        try:
            df = self.load_market_data()
            
            # Handle multiple possible column names
            crop_col = next(
                (col for col in df.columns if col.lower() == "crop"),
                "Crop"
            )
            
            filtered = df[df[crop_col].str.lower() == crop_name.lower()]
            
            if state:
                state_col = next(
                    (col for col in df.columns if col.lower() == "state"),
                    "State"
                )
                filtered = filtered[filtered[state_col].str.lower() == state.lower()]
            
            return filtered
        except Exception as e:
            raise RuntimeError(
                f"Error reading market data for {crop_name}: {str(e)}"
            )
    
    # -------------------------
    # FARMER DATA (JSON)
    # -------------------------
    def load_farmers(self) -> Dict[str, Any]:
        """Load all farmer records from JSON."""
        if not self.farmers_data_path.exists():
            return {}
        
        try:
            with open(self.farmers_data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            raise RuntimeError(f"Corrupted farmer data file: {self.farmers_data_path}")
        except Exception as e:
            raise RuntimeError(f"Error loading farmers: {str(e)}")
    
    def save_farmers(self, data: Dict[str, Any]) -> None:
        """Save farmer records to JSON (creates file if needed)."""
        try:
            self.farmers_data_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.farmers_data_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            raise RuntimeError(f"Error saving farmers: {str(e)}")
    
    def get_farmer_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """Find farmer by phone number."""
        try:
            farmers = self.load_farmers()
            return next(
                (f for f in farmers.values() if f.get("phone") == phone),
                None
            )
        except Exception as e:
            raise RuntimeError(f"Error finding farmer by phone: {str(e)}")
    
    def get_farmer_by_id(self, farmer_id: str) -> Optional[Dict[str, Any]]:
        """Get farmer by farmer ID."""
        try:
            farmers = self.load_farmers()
            return farmers.get(farmer_id)
        except Exception as e:
            raise RuntimeError(f"Error finding farmer by ID: {str(e)}")
    
    def add_farmer(self, farmer_data: Dict[str, Any]) -> None:
        """Add or update a farmer record."""
        try:
            farmers = self.load_farmers()
            farmers[farmer_data["farmer_id"]] = farmer_data
            self.save_farmers(farmers)
        except Exception as e:
            raise RuntimeError(f"Error adding farmer: {str(e)}")
    
    def get_all_farmers(self) -> List[Dict[str, Any]]:
        """Get all farmers as a list."""
        try:
            farmers = self.load_farmers()
            return list(farmers.values())
        except Exception as e:
            raise RuntimeError(f"Error retrieving all farmers: {str(e)}")