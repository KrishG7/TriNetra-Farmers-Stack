import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Try loading .env manually
load_success = load_dotenv()
print(f"1. .env file found? {'YES' if load_success else 'NO'}")

# 2. Check for Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: GEMINI_API_KEY is missing in .env file!")
    exit()
else:
    print(f"2. Key found: {api_key[:5]}...*******")

# 3. Test Connection
try:
    print("3. Attempting to connect to Google Gemini...")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Say 'Hello Farmer'")
    print(f"✅ SUCCESS! Gemini Replied: {response.text}")
except Exception as e:
    print(f"❌ CONNECTION FAILED: {e}")