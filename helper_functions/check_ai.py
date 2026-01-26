import sys
import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# --- 1. SETUP PATHS ---
# Get the absolute path to the Project Root (one level up from this script)
current_dir = Path(__file__).resolve().parent
ROOT_DIR = current_dir.parent

# Add Root to Python System Path (so imports work if needed)
sys.path.append(str(ROOT_DIR))

# --- 2. LOAD SECRETS ---
# Explicitly tell dotenv where the .env file is
env_path = ROOT_DIR / ".env"
load_dotenv(dotenv_path=env_path)

def check_gemini():
    print("🤖 Checking Gemini AI Connection...")
    print(f"   📂 Looking for .env at: {env_path}")
    
    # --- 3. GET KEY SECURELY ---
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY not found!")
        print("   Please check your .env file in the root folder.")
        return

    # Mask the key for printing (Security Best Practice)
    masked_key = api_key[:4] + "*" * 10 + api_key[-4:]
    print(f"   🔑 Found Key: {masked_key}")

    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash") # or "gemini-pro"
        
        # Test Generation
        print("   📡 Sending test prompt to Google...")
        response = model.generate_content("Say 'TriNetra System Online' if you can hear me.")
        
        print("\n✅ SUCCESS! AI Responded:")
        print(f"   👉 {response.text.strip()}\n")
        
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED: {e}")
        print("   - Double check that your API Key is active.")
        print("   - Ensure you have internet access.")

if __name__ == "__main__":
    check_gemini()