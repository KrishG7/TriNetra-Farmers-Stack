import os
import glob

DATA_DIR = "data/"

def nuclear_fix():
    print(f"☢️  Running Nuclear Fix on {DATA_DIR}...")
    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    
    if not csv_files:
        print("❌ No CSV files found!")
        return

    for file in csv_files:
        try:
            filename = os.path.basename(file)
            
            # Read all lines (handling potential encoding errors)
            with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            start_index = -1
            
            # Find the REAL header row
            for i, line in enumerate(lines):
                # We look for the columns that MUST exist
                if "State" in line and "District" in line and "Market" in line:
                    start_index = i
                    break
            
            if start_index == 0:
                print(f"   ✅ {filename} is already perfect.")
            elif start_index > 0:
                print(f"   ✂️  Cutting {start_index} garbage lines from {filename}...")
                
                # Keep only the header and data
                clean_content = lines[start_index:]
                
                # Overwrite the file
                with open(file, 'w', encoding='utf-8') as f:
                    f.writelines(clean_content)
                print(f"      -> Fixed!")
            else:
                print(f"   ⚠️ Could not find header in {filename}. Is it empty?")

        except Exception as e:
            print(f"   ❌ Failed to fix {filename}: {e}")

if __name__ == "__main__":
    nuclear_fix()