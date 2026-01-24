-- TriNetra Database Schema
-- Version: 1.0
-- Status: READY (not connected yet)
-- Storage: CSV files (for now)

-- ===========================================
-- FARMERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_farmers_phone ON farmers(phone);
CREATE INDEX idx_farmers_district ON farmers(district);

-- ===========================================
-- FARMS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    area_acres DECIMAL(10,2) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_farms_farmer ON farms(farmer_id);
CREATE INDEX idx_farms_location ON farms(latitude, longitude);

-- ===========================================
-- FARM CROPS TABLE (Many-to-Many)
-- ===========================================
CREATE TABLE IF NOT EXISTS farm_crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    area_acres DECIMAL(10,2),
    planting_date DATE,
    expected_harvest_date DATE,
    season VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farm_crops_farm ON farm_crops(farm_id);
CREATE INDEX idx_farm_crops_crop ON farm_crops(crop_name);

-- ===========================================
-- SATELLITE DATA CACHE
-- ===========================================
CREATE TABLE IF NOT EXISTS satellite_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    image_date DATE NOT NULL,
    ndvi_value DECIMAL(5,3) NOT NULL,
    ndvi_category VARCHAR(20),
    cloud_coverage_percent DECIMAL(5,2),
    image_url TEXT,
    source VARCHAR(50) DEFAULT 'sentinel-2',
    processing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_satellite_farm ON satellite_data(farm_id);
CREATE INDEX idx_satellite_date ON satellite_data(image_date);

-- ===========================================
-- CREDIT SCORES
-- ===========================================
CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 0 AND score <= 1000),
    calculation_date DATE NOT NULL,
    ndvi_factor DECIMAL(5,3),
    yield_consistency_factor DECIMAL(5,3),
    farm_size_factor DECIMAL(5,3),
    history_factor DECIMAL(5,3),
    loan_eligibility_amount DECIMAL(12,2),
    interest_rate DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credit_farmer ON credit_scores(farmer_id);
CREATE INDEX idx_credit_date ON credit_scores(calculation_date);

-- ===========================================
-- SOIL RECORDS
-- ===========================================
CREATE TABLE IF NOT EXISTS soil_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    n_value DECIMAL(10,2),
    p_value DECIMAL(10,2),
    k_value DECIMAL(10,2),
    ph_value DECIMAL(5,2),
    organic_carbon DECIMAL(10,2),
    electrical_conductivity DECIMAL(10,2),
    test_method VARCHAR(50),
    lab_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_soil_farm ON soil_records(farm_id);
CREATE INDEX idx_soil_date ON soil_records(test_date);

-- ===========================================
-- SOIL RECOMMENDATIONS
-- ===========================================
CREATE TABLE IF NOT EXISTS soil_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    soil_record_id UUID NOT NULL REFERENCES soil_records(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    fertilizer_type VARCHAR(50),
    quantity_per_acre DECIMAL(10,2),
    application_timing VARCHAR(100),
    estimated_cost DECIMAL(10,2),
    expected_yield_improvement DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_soil_rec_farm ON soil_recommendations(farm_id);

-- ===========================================
-- MARKET PRICES
-- ===========================================
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop VARCHAR(100) NOT NULL,
    mandi_name VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'quintal',
    price_date DATE NOT NULL,
    arrival_quantity DECIMAL(10,2),
    weather_condition VARCHAR(50),
    source VARCHAR(50) DEFAULT 'agmark',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_crop ON market_prices(crop);
CREATE INDEX idx_market_date ON market_prices(price_date);
CREATE INDEX idx_market_mandi ON market_prices(mandi_name);

-- ===========================================
-- PRICE PREDICTIONS (AI/ML Output)
-- ===========================================
CREATE TABLE IF NOT EXISTS price_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    prediction_date DATE NOT NULL,
    predicted_price DECIMAL(10,2) NOT NULL,
    confidence_score DECIMAL(5,3),
    recommendation VARCHAR(20) CHECK (recommendation IN ('HOLD', 'SELL', 'WAIT')),
    reasoning TEXT,
    weather_factor DECIMAL(5,3),
    demand_factor DECIMAL(5,3),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prediction_farm ON price_predictions(farm_id);
CREATE INDEX idx_prediction_crop ON price_predictions(crop);
CREATE INDEX idx_prediction_date ON price_predictions(prediction_date);

-- ===========================================
-- WEATHER DATA CACHE
-- ===========================================
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    weather_date DATE NOT NULL,
    temperature_max DECIMAL(5,2),
    temperature_min DECIMAL(5,2),
    rainfall_mm DECIMAL(10,2),
    humidity_percent DECIMAL(5,2),
    wind_speed_kmh DECIMAL(5,2),
    source VARCHAR(50) DEFAULT 'imd',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weather_location ON weather_data(district, weather_date);

-- ===========================================
-- NOTIFICATIONS
-- ===========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_notification_farmer ON notifications(farmer_id);
CREATE INDEX idx_notification_read ON notifications(is_read);

-- ===========================================
-- AUDIT LOG (All Changes)
-- ===========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_date ON audit_log(created_at);
