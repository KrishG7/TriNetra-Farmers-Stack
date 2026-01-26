# 🌾 TriNetra: Agri-Intelligence Command Center

TriNetra is an AI-powered platform designed to empower Indian farmers with real-time intelligence. It combines Satellite Imagery, Machine Learning, and Generative AI to solve three critical agricultural challenges:

1.  **Market Vision:** Predicting crop prices using historical Agmarknet data (PyTorch).
2.  **Soil Vision:** AI Agronomist for crop recommendations (Gemini AI).
3.  **Credit Vision:** Satellite-based farm verification for loans (Google Earth Engine).

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Python)

**Prerequisites:** Python 3.9+

```bash
# 1. Create a virtual environment (Optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install Dependencies
pip install -r requirements.txt

# 3. Setup Environment Variables
# Create a .env file in the root directory and add:
# GEMINI_API_KEY="your_google_ai_key_here"

# 4. Check Data
# Ensure your CSV files (Wheat.csv, etc.) are inside the /data folder.

# 5. Start the Server
python run.py