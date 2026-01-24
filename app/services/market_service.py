import datetime
import random
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from app.repositories.data_repo import DataRepository
from app.models.schemas import (
    MarketQuery,
    MarketPriceResponse,
    MarketHistoryResponse,
    MarketHistoryItem,
)

class MarketService:
    """
    Market analytics service for TriNetra.
    Provides current prices, historical data, and price forecasting.
    Updated to support target date prediction and seasonal trends.
    """
    
    def __init__(self):
        self.repo = DataRepository()
    
    # -------------------------
    # CURRENT PRICE (Unchanged)
    # -------------------------
    def get_average_price(self, query: MarketQuery) -> MarketPriceResponse:
        try:
            df = self.repo.get_market_data_for_crop(
                crop_name=query.crop_name,
                state=query.state
            )
            
            if df.empty:
                # Fallback if CSV is empty for demo
                return MarketPriceResponse(
                    crop_name=query.crop_name,
                    state=query.state or "All States",
                    average_price=2000.0,
                    last_updated=datetime.date.today(),
                )
            
            price_col = self._find_column(df, ["price", "modal_price"])
            if not price_col:
                raise RuntimeError("Price column not found in market data")
            
            avg_price = round(df[price_col].mean(), 2)
            state = query.state or "All States"
            
            return MarketPriceResponse(
                crop_name=query.crop_name,
                state=state,
                average_price=avg_price,
                last_updated=datetime.date.today(),
            )
        
        except Exception as e:
            # Fallback for robustness
            return MarketPriceResponse(
                crop_name=query.crop_name,
                state=query.state or "All States",
                average_price=0.0,
                last_updated=datetime.date.today(),
            )

    # -------------------------
    # PRICE FORECASTING (UPDATED)
    # -------------------------
    def predict_price_trend(
        self, crop_name: str, state: str, quantity: float, target_date_str: str = None
    ) -> Optional[Dict[str, Any]]:
        """
        Predicts price based on Historical Year Growth + Seasonal Trends.
        Accepts a specific target date to predict for.
        """
        try:
            # 1. Parse the target date (Default to today if missing)
            if target_date_str:
                target_date = datetime.datetime.strptime(target_date_str, "%Y-%m-%d").date()
            else:
                target_date = datetime.date.today()

            # 2. Get Base Data (Simulating reading from Agmarknet CSV)
            # In a real app, you would query self.repo.get_market_data_for_crop(...)
            # Here we use a dictionary to ensure the demo works robustly without full CSVs
            base_prices = {
                "Wheat": {"Haryana": 2200, "Punjab": 2300, "Maharashtra": 2800},
                "Rice": {"Haryana": 3500, "Punjab": 3600, "Maharashtra": 4000},
                "Cotton": {"Haryana": 6000, "Punjab": 6200, "Maharashtra": 7000},
                "Maize": {"Haryana": 1800, "Punjab": 1850, "Maharashtra": 2100}
            }
            
            # Get base price or default to 2000
            base_price = base_prices.get(crop_name, {}).get(state, 2000)

            # 3. Calculate "Yearly Inflation" (approx 5% per year)
            current_year = datetime.date.today().year
            target_year = target_date.year
            year_diff = target_year - current_year
            
            # Formula: Base * (1 + 0.05)^years
            inflation_factor = (1.05) ** year_diff if year_diff > 0 else 1.0

            # 4. Calculate "Seasonal Seasonality" (Month-wise variation)
            month = target_date.month
            seasonality_factor = 1.0
            
            # Logic: Prices drop during harvest, rise during lean season
            if crop_name == "Wheat":
                if month in [4, 5]: # Rabi Harvest
                    seasonality_factor = 0.90 
                elif month in [12, 1]: # Lean season
                    seasonality_factor = 1.15
            elif crop_name == "Rice":
                if month in [10, 11]: # Kharif Harvest
                    seasonality_factor = 0.90
                elif month in [6, 7]: # Lean season
                    seasonality_factor = 1.15

            # 5. Final Prediction Calculation
            predicted_price = base_price * inflation_factor * seasonality_factor
            
            # Generate 7-day trend around that date
            forecast = []
            start_plot_date = target_date - datetime.timedelta(days=3) # Show a bit before and after
            
            for i in range(7):
                d = start_plot_date + datetime.timedelta(days=i)
                
                # Add random daily market noise (+/- 2%)
                noise = random.uniform(0.98, 1.02)
                
                # If date is in future compared to target, slight trend up or down based on seasonality
                day_price = predicted_price * noise
                
                forecast.append({
                    "date": d.strftime("%Y-%m-%d"),
                    "price": round(day_price, 2)
                })

            # Calculate Financials
            current_market_price = base_price # Assuming today's price is base
            total_value = round(predicted_price * quantity, 2)
            profit_diff = (predicted_price - current_market_price) * quantity
            
            # Trend Analysis
            trend = "RISING" if predicted_price > current_market_price else "FALLING"
            price_change_percent = round(((predicted_price - current_market_price) / current_market_price * 100), 1)

            # Recommendation Logic
            recommendation = ""
            if trend == "RISING":
                recommendation = f"🚀 HOLD: Prices expected to rise by {price_change_percent}%. Estimated gain: ₹{round(profit_diff)}."
            else:
                recommendation = f"⚠️ SELL NOW: Prices expected to drop by {abs(price_change_percent)}% around {target_date_str}."

            return {
                "crop": crop_name,
                "state": state,
                "target_date": target_date_str,
                "forecast_7day_price": round(predicted_price, 2), # Key for UI
                "forecast_price": round(predicted_price, 2),
                "total_value": total_value,
                "trend": trend,
                "price_change_percent": price_change_percent,
                "recommendation": recommendation,
                "forecast": forecast # Graph data
            }

        except Exception as e:
            print(f"Forecast error: {str(e)}")
            return None

    # -------------------------
    # HELPER METHODS
    # -------------------------
    def _find_column(self, df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
        df_cols_lower = {col.lower(): col for col in df.columns}
        for candidate in candidates:
            if candidate.lower() in df_cols_lower:
                return df_cols_lower[candidate.lower()]
        return None