# 🌾 TriNetra Frontend

The official user interface for **TriNetra: Agri-Intelligence Command Center**. Built with Next.js 14, this dashboard provides farmers with real-time insights into market prices, soil health, and credit eligibility using a clean, accessible, and multi-language interface.

## ⚡️ Key Features

* **📊 Market Vision:** Interactive price prediction charts using Recharts. Includes dynamic State/Market selection.
* **🌱 Soil Vision:** AI Agronomist interface where farmers input N-P-K/pH values to get crop recommendations.
* **💳 Credit Vision:** Satellite-based verification tool featuring an interactive map (Leaflet) to pinpoint farm locations.
* **🗣️ Multi-Language Support:** Instant translation switching between English, Hindi, Punjabi, Gujarati, Tamil, Telugu, Bengali, and Marathi.
* **🔐 Authentication UI:** Complete Login/Register flows with OTP simulation.
* **📱 Responsive Design:** Fully mobile-optimized landing page and dashboard sidebar.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Charts:** [Recharts](https://recharts.org/)
* **Maps:** [Leaflet](https://leafletjs.com/) (Dynamic Import)
* **State Management:** React Context (Language Provider)

## 🚀 Getting Started

### Prerequisites
* Node.js 18.17 or later
* The **TriNetra Backend** running on port `8000`.

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔌 API Architecture

This frontend uses **Next.js Route Handlers** (`app/api/analyze/...`) as a proxy layer. It does not call the Python backend directly from the browser to avoid CORS issues and expose API keys.

* **Frontend Request:** `POST /api/analyze/market` (Browser)
* **Proxy Layer:** Next.js Server
* **Backend Request:** `POST http://127.0.0.1:8000/api/analyze/market` (Python)

> **Note:** If you change the Python backend port, you must update the URLs in `frontend/app/api/analyze/*/route.ts`.

## 📂 Project Structure

```text
frontend/
├── app/
│   ├── api/             # API Proxy Routes (connects to Python)
│   ├── dashboard/       # Main Dashboard Layout
│   ├── layout.tsx       # Global Layout & Font Setup
│   └── page.tsx         # Landing Page
├── components/
│   ├── dashboard/
│   │   ├── tabs/        # Feature Modules (Market, Soil, Credit)
│   │   └── sidebar.tsx  # Navigation Logic
│   ├── landing/         # Landing Page Sections
│   └── ui/              # Reusable Shadcn Components (Buttons, Inputs)
├── lib/
│   └── language-context # Global Translation Logic
└── public/              # Static Assets