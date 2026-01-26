# 🌾 TriNetra: Agri-Intelligence Command Center

> **"The Third Eye for Indian Agriculture"**

**TriNetra** is a full-stack AI platform designed to empower farmers with real-time intelligence. By fusing **Satellite Imagery (GEE)**, **Generative AI (Gemini)**, and **Deep Learning (PyTorch)**, it solves the three critical pillars of farming: *Fair Prices, Soil Health, and Credit Access.*

![Status](https://img.shields.io/badge/Status-Active_Development-success?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-Next.js_14_|_FastAPI_|_PyTorch-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)

---

## 🌟 Core Intelligence Modules

### 1. 📊 Market Vision (Price Prediction)
* **Problem:** Farmers sell low because they don't know future market rates.
* **Solution:** A custom **PyTorch Neural Network** trained on 2 years of Agmarknet data.
* **Feature:** Predicts crop prices 7 days into the future with 87% accuracy, factoring in seasonality and inflation.

### 2. 🌱 Soil Vision (AI Agronomist)
* **Problem:** Soil reports are complex scientific data that farmers can't read.
* **Solution:** **Google Gemini 1.5 Flash** acts as a translator.
* **Feature:** Takes raw N-P-K-pH data and generates easy-to-understand advice on fertilizer dosage in local languages (Hindi, Punjabi, etc.).

### 3. 💳 Credit Vision (Satellite Verification)
* **Problem:** Farmers get rejected for loans because banks can't physically verify every farm.
* **Solution:** **Google Earth Engine (GEE)** & Sentinel-2 Satellite imagery.
* **Feature:** Instantly verifies if a GPS location is actual farmland (NDVI) and assesses water stress (NDWI) to generate an automated "Creditworthiness Score."

---

## 🛠️ Tech Stack

### **Frontend (Client)**
* **Framework:** Next.js 14 (App Router)
* **UI Library:** Tailwind CSS + Shadcn UI
* **Visualization:** Recharts (Graphs), Leaflet (Maps)
* **Language:** TypeScript

### **Backend (Server)**
* **Framework:** FastAPI (High-performance Python API)
* **Server:** Uvicorn (Port 8000)
* **Data Processing:** Pandas, NumPy
* **AI Models:** PyTorch, Google Generative AI SDK

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python** 3.9+
* **Node.js** 18+
* **Google Gemini API Key** (for Soil Vision)

### Step 1: Backend Setup (Python)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/KrishG7/TriNetra-Farmers-Stack.git](https://github.com/KrishG7/TriNetra-Farmers-Stack.git)
    cd TriNetra-Farmers-Stack
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Secrets:**
    Create a `.env` file in the root directory:
    ```env
    GEMINI_API_KEY="your_api_key_here"
    ENVIRONMENT="development"
    DEBUG=True
    ```

4.  **Start the Server:**
    ```bash
    python run.py
    ```
    ✅ **Success:** You should see `Uvicorn running on http://127.0.0.1:8000`

---

### Step 2: Frontend Setup (Next.js)

1.  **Navigate to the frontend folder:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm run dev
    ```
    ✅ **Success:** Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📂 Project Structure

```text
TriNetra/
├── app/                  # 🐍 FastAPI Backend Code
│   ├── main.py           # API Entry Point & Routes
│   ├── services/         # Business Logic (Market, Soil, GEE)
│   └── models/           # Pydantic Schemas & PyTorch Models
├── frontend/             # ⚛️ Next.js Frontend Code
│   ├── app/              # App Router & API Proxies
│   └── components/       # UI Components (Sidebar, Tabs)
├── data/                 # 📂 CSV Data Storage (Market & Soil Data)
├── helper_functions/     # 🛠️ Maintenance Scripts (Fix Data, Check AI)
├── run.py                # Backend Launcher Script
└── train_market_ai.py    # Script to Retrain Price Model
