import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
import joblib
import random
import glob
import os
from datetime import datetime, timedelta
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

# --- CONFIG ---
DATA_DIR = "data/"  # Your CSVs must be here
MODEL_PATH = "app/models/market_net.pth"
SCALER_PATH = "app/models/scalers.pkl"
EPOCHS = 1000
LEARNING_RATE = 0.005

# --- 🧠 CROP KNOWLEDGE BASE ---
HARVEST_CALENDAR = {
    'Wheat': [4, 5],        # April/May
    'Paddy': [10, 11],      # Oct/Nov
    'Rice': [10, 11],
    'Cotton': [10, 11, 12], # Oct-Dec
    'Maize': [9, 10],       # Sept/Oct
    'Onion': [5, 11],       # May & Nov
    'Mustard': [3, 4],      # March/April
    'Soyabean': [10, 11],   # Oct/Nov
    'Soybean': [10, 11],
    'Gram': [3, 4],         # March/April
    'Chana': [3, 4],
    'Tur': [12, 1],         # Dec/Jan
    'Arhar': [12, 1],
    'Potato': [2, 3],       # Feb/March
    'Tomato': [3, 4, 11],
    'Bajra': [9, 10],
    'Barley': [4, 5]
}

def load_and_augment_agmarknet():
    print("🔄 Scanning data folder...")
    # Finds ALL csv files (Wheat.csv, Rice.csv, etc.)
    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    
    if not csv_files:
        print("⚠️ No CSVs found in data/! Please check file location.")
        return pd.DataFrame()

    all_data = []
    
    # 1. READ REAL DATA
    for file in csv_files:
        try:
            print(f"   reading {os.path.basename(file)}...")
            df = pd.read_csv(file)
            
            # Clean Headers
            df.columns = df.columns.str.lower().str.replace(r'[\(].*?[\)]', '', regex=True).str.strip().str.replace(' ', '_')
            
            # Map various Agmarknet formats to our standard
            rename_map = {
                "state_name": "state",
                "district_name": "state", # Fallback
                "market_name": "market",
                "commodity": "crop",
                "modal_price": "price",
                "price_date": "date",
                "arrival_date": "date"
            }
            df = df.rename(columns=rename_map)
            
            # Check if valid
            if 'crop' in df.columns and 'price' in df.columns:
                if 'state' not in df.columns: df['state'] = 'India' # Default
                
                # Clean Price column
                df['price'] = pd.to_numeric(df['price'], errors='coerce')
                df = df.dropna(subset=['price'])
                
                all_data.append(df[['crop', 'state', 'price']])
        except Exception as e:
            print(f"   ⚠️ Skipped {file}: {e}")

    if not all_data:
        return pd.DataFrame()

    real_df = pd.concat(all_data, ignore_index=True)
    
    # 2. EXTRACT ANCHORS (Average price per Crop/State today)
    anchors = real_df.groupby(['crop', 'state'])['price'].mean().to_dict()
    print(f"✓ Learned {len(anchors)} price anchors from real files.")

    # 3. GENERATE HISTORY (The Time Travel Logic)
    print("🚀 Generating 2 years of history with seasonality...")
    augmented_rows = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730) # 2 Years back

    for (crop, state), base_price in anchors.items():
        # Find harvest months for this crop
        harvest_months = []
        for key in HARVEST_CALENDAR:
            if key.lower() in str(crop).lower():
                harvest_months = HARVEST_CALENDAR[key]
                break
        
        # Generate daily points
        current_date = start_date
        while current_date <= end_date:
            
            season_factor = 1.0
            
            # Drop price during harvest
            if current_date.month in harvest_months:
                season_factor = 0.88
            # Rise price right before harvest
            elif harvest_months and current_date.month == (harvest_months[0] - 1):
                season_factor = 1.05
            
            # Inflation (Old prices were cheaper)
            days_ago = (end_date - current_date).days
            inflation = 1.0 - (days_ago * 0.00015)
            
            # Noise
            noise = random.uniform(-0.05, 0.05) * base_price
            
            final_price = base_price * season_factor * inflation + noise
            
            augmented_rows.append([str(crop).title(), str(state).title(), current_date.toordinal(), int(final_price)])
            current_date += timedelta(days=3) # Data every 3 days

    return pd.DataFrame(augmented_rows, columns=['Crop', 'State', 'Date', 'Price'])

# --- MAIN EXECUTION ---
df = load_and_augment_agmarknet()

if df.empty:
    print("❌ Critical Error: No data generated. Check CSV files.")
    exit()

# Encoders
le_crop = LabelEncoder()
le_state = LabelEncoder()
df['Crop'] = le_crop.fit_transform(df['Crop'].astype(str))
df['State'] = le_state.fit_transform(df['State'].astype(str))

# Scaling
scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()
X = scaler_X.fit_transform(df[['Crop', 'State', 'Date']].values)
y = scaler_y.fit_transform(df[['Price']].values)

X_tensor = torch.FloatTensor(X)
y_tensor = torch.FloatTensor(y)

# AI Model
model = nn.Sequential(
    nn.Linear(3, 128),
    nn.ReLU(),
    nn.Linear(128, 64),
    nn.ReLU(),
    nn.Linear(64, 1)
)

print(f"🧠 Training AI on {len(df)} records...")
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

for epoch in range(EPOCHS):
    optimizer.zero_grad()
    outputs = model(X_tensor)
    loss = criterion(outputs, y_tensor)
    loss.backward()
    optimizer.step()
    
    if (epoch+1) % 200 == 0:
        print(f"Epoch [{epoch+1}/{EPOCHS}], Loss: {loss.item():.6f}")

# Save
os.makedirs("app/models", exist_ok=True)
torch.save(model.state_dict(), MODEL_PATH)
joblib.dump({'le_crop': le_crop, 'le_state': le_state, 'scaler_X': scaler_X, 'scaler_y': scaler_y}, SCALER_PATH)

print("✅ SUCCESS: AI Trained & Model Saved to app/models/!")