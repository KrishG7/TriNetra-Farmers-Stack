import os
import glob
import pandas as pd

DATA_DIR = "data/"

def fix_corrupted_csvs():
    print(f"🧹 Scanning {DATA_DIR} for corrupted files...")
    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    
    for file in csv_files:
        try:
            print(f"   Trying to fix: {os.path.basename(file)}...")
            
            # Method 1: Try reading as Excel (sometimes Mac saves .xlsx named as .csv)
            try:
                df = pd.read_excel(file)
                print(f"   --> Detected as Excel/Numbers! Converting to proper CSV...")
            except:
                # Method 2: Try Mac Encoding (UTF-16 Little Endian)
                try:
                    df = pd.read_csv(file, encoding='utf-16', sep='\t')
                    print(f"   --> Detected as UTF-16! Converting to UTF-8...")
                except:
                    # Method 3: Try standard CSV but with loose constraints
                    df = pd.read_csv(file, encoding_errors='ignore')
                    print(f"   --> Forced read. Cleaning up...")

            # Save it back as a STANDARD UTF-8 CSV
            df.to_csv(file, index=False, encoding='utf-8')
            print(f"   ✅ FIXED: {os.path.basename(file)}")
            
        except Exception as e:
            print(f"   ❌ FAILED to fix {file}. It might be a pure binary file. Error: {e}")

if __name__ == "__main__":
    fix_corrupted_csvs()