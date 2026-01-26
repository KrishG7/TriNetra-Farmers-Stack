import os
import glob

DATA_DIR = "data/"

def force_clean_csvs():
    print(f"🧹 Starting Surgical Cleaning in {DATA_DIR}...")
    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    
    for file in csv_files:
        try:
            filename = os.path.basename(file)
            
            # 1. Read the file as raw text lines (ignore weird Mac encoding errors)
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
            except UnicodeDecodeError:
                # Fallback for Mac Roman or Latin-1
                with open(file, 'r', encoding='mac_roman') as f:
                    lines = f.readlines()

            # 2. Find the "Golden Row" (The Real Header)
            start_index = -1
            clean_lines = []
            
            for i, line in enumerate(lines):
                # We look for the standard Agmarknet column names
                lower_line = line.lower()
                if "state" in lower_line and "market" in lower_line and "price" in lower_line:
                    start_index = i
                    break
            
            # 3. Decision Time
            if start_index != -1:
                print(f"   🔹 {filename}: Found real data at line {start_index + 1}. Trimming top garbage...")
                clean_lines = lines[start_index:]
                
                # Overwrite with the clean version
                with open(file, 'w', encoding='utf-8') as f:
                    f.writelines(clean_lines)
                print(f"   ✅ FIXED: {filename}")
                
            else:
                # If we didn't find the specific header, check if it's already clean
                if len(lines) > 0 and "," in lines[0]:
                    print(f"   👍 {filename} seems okay (already clean).")
                else:
                    print(f"   ⚠️ SKIPPED: {filename} (Could not find 'State/Market' header. Is this a crop file?)")

        except Exception as e:
            print(f"   ❌ ERROR processing {filename}: {e}")

if __name__ == "__main__":
    force_clean_csvs()