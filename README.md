# TriNetra Backend API

## Development Mode (CSV Storage)

Current setup uses **CSV files** for data storage. This allows development without database setup.

### Quick Start

```bash
# 1. Install dependencies
pip install fastapi uvicorn pydantic python-dotenv

# 2. Make sure CSV files are in data/ directory
ls data/

# 3. Run the server
./run.sh
