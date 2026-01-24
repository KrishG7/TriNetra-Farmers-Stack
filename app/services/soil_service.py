import json
import logging
import google.generativeai as genai
from app.core.config import settings
from app.models.schemas import SoilRequest

logger = logging.getLogger(__name__)

class SoilService:
    def __init__(self):
        try:
            # 1. SETUP CLIENT SECURELY
            # The key is now loaded from .env -> settings.py -> here
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Initialize the model
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            logger.info("✓ Gemini AI Connected (Soil Service)")
            
        except Exception as e:
            logger.error(f"⚠️ Gemini Init Failed: {e}")
            self.model = None

    def recommend_crop(self, request: SoilRequest):
        """
        Sends soil data to Gemini 2.0 Flash and asks for a structured JSON response.
        Falls back to Mock Data on error/quota limit.
        """
        if not self.model:
            return self._get_mock_fallback(request, "Gemini API not connected")

        # 2. CONSTRUCT THE PROMPT
        prompt = f"""
        Act as a senior Agronomist. Analyze this soil sample from {request.district}, India.
        Params: Nitrogen={request.nitrogen}, Phosphorus={request.phosphorus}, Potassium={request.potassium}, pH={request.ph}, Rainfall={request.rainfall}mm.

        Task:
        1. Determine if this soil is cultivable (pH between 4.0 and 9.0).
        2. If cultivable, recommend the top 3 most profitable crops suitable for this specific soil profile.
        3. For each crop, calculate precise Fertilizer Dosage (Urea/DAP/MOP) in kg/acre required to balance the nutrients.
        4. Output STRICTLY in valid JSON format (no markdown code blocks).

        Target JSON Structure:
        {{
            "cultivable": true,
            "message": "Soil is healthy...",
            "explanation": "Nitrogen is low, but pH is optimal...",
            "crops": [
                {{
                    "crop": "Wheat",
                    "confidence": "High",
                    "urea_dose": "45",
                    "dap_dose": "25",
                    "mop_dose": "15",
                    "reason": "Requires less water..."
                }}
            ]
        }}
        """

        try:
            # 3. CALL GEMINI
            response = self.model.generate_content(prompt)
            raw_text = response.text

            # Clean up JSON (remove markdown code blocks if Gemini adds them)
            cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(cleaned_text)

            # 4. SUCCESS RESPONSE FORMATTING
            # Ensure the output matches what the frontend expects
            return {
                "cultivable": data.get("cultivable", False),
                "message": data.get("message", "Analysis Complete"),
                "explanation": data.get("explanation", ""),
                "crops": data.get("crops", [])
            }

        except Exception as e:
            logger.error(f"Gemini Analysis Error: {e}")
            logger.info("⚠️ Switching to Mock Data for resilience.")
            return self._get_mock_fallback(request, str(e))

    def _get_mock_fallback(self, request: SoilRequest, error_msg="Unknown Error"):
        """
        Generates realistic fake data if the AI fails (Rate Limit / No Internet).
        """
        return {
            "cultivable": True,
            "message": "✅ AI Offline (Simulated Mode)",
            "explanation": f"Based on historical data for {request.district}, your soil N-P-K levels ({request.nitrogen}-{request.phosphorus}-{request.potassium}) support cereal crops effectively. (System Note: {error_msg})",
            "crops": [
                {
                    "crop": "Wheat (Simulated)",
                    "confidence": "High",
                    "urea_dose": "45",
                    "dap_dose": "25",
                    "mop_dose": "10",
                    "reason": "High nitrogen levels favor Wheat growth in this Rabi season."
                },
                {
                    "crop": "Mustard",
                    "confidence": "Medium",
                    "urea_dose": "30",
                    "dap_dose": "15",
                    "mop_dose": "0",
                    "reason": "Good alternative for dry soil conditions."
                },
                {
                    "crop": "Chickpea",
                    "confidence": "Medium",
                    "urea_dose": "10",
                    "dap_dose": "20",
                    "mop_dose": "0",
                    "reason": "Legumes help fix natural nitrogen for next cycle."
                }
            ]
        }