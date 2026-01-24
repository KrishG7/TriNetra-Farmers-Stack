import google.generativeai as genai

# PASTE YOUR API KEY HERE
API_KEY = "AIzaSyBXdGxrodEKE3Co6s_dXVLMsS1RD-3Qdwc"

def check_available_models():
    try:
        genai.configure(api_key=API_KEY)
        print(f"🔍 Checking models for key ending in ...{API_KEY[-4:]}\n")
        
        print("✅ AVAILABLE MODELS (Text Generation):")
        print("-" * 40)
        
        found_any = False
        for m in genai.list_models():
            # We only care about models that can generate text (chat)
            if 'generateContent' in m.supported_generation_methods:
                print(f"• {m.name}")
                found_any = True
        
        if not found_any:
            print("❌ No text generation models found. Check your API key permissions.")
            
        print("-" * 40)

    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    check_available_models()