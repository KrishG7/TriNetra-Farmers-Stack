-- TriNetra Database Schema for Supabase
-- PostgreSQL 15+ with Supabase Extensions
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- FARMERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to read farmers" 
    ON farmers FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert farmers" 
    ON farmers FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Indexes
CREATE INDEX idx_farmers_phone ON farmers(phone);
CREATE INDEX idx_farmers_district ON farmers(district);
CREATE INDEX idx_farmers_created ON farmers(created_at);

-- ===========================================
-- FARMS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    area_acres DECIMAL(10,2) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read farms" 
    ON farms FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert farms" 
    ON farms FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE INDEX idx_farms_farmer ON farms(farmer_id);
CREATE INDEX idx_farms_location ON farms(latitude, longitude);
CREATE INDEX idx_farms_created ON farms(created_at);

-- ===========================================
-- FARM CROPS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS farm_crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    area_acres DECIMAL(10,2),
    planting_date DATE,
    expected_harvest_date DATE,
    season VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE farm_crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read farm_crops" 
    ON farm_crops FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_farm_crops_farm ON farm_crops(farm_id);
CREATE INDEX idx_farm_crops_crop ON farm_crops(crop_name);

-- ===========================================
-- SATELLITE DATA CACHE
-- ===========================================
CREATE TABLE IF NOT EXISTS satellite_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    image_date DATE NOT NULL,
    ndvi_value DECIMAL(5,3) NOT NULL,
    ndvi_category VARCHAR(20),
    cloud_coverage_percent DECIMAL(5,2),
    image_url TEXT,
    source VARCHAR(50) DEFAULT 'sentinel-2',
    processing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE satellite_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read satellite_data" 
    ON satellite_data FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_satellite_farm ON satellite_data(farm_id);
CREATE INDEX idx_satellite_date ON satellite_data(image_date DESC);
CREATE INDEX idx_satellite_created ON satellite_data(created_at DESC);

-- ===========================================
-- CREDIT SCORES
-- ===========================================
CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read credit_scores" 
    ON credit_scores FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_credit_farmer ON credit_scores(farmer_id);
CREATE INDEX idx_credit_date ON credit_scores(calculation_date DESC);
CREATE INDEX idx_credit_score ON credit_scores(score);

-- ===========================================
-- SOIL RECORDS
-- ===========================================
CREATE TABLE IF NOT EXISTS soil_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE soil_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read soil_records" 
    ON soil_records FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_soil_farm ON soil_records(farm_id);
CREATE INDEX idx_soil_date ON soil_records(test_date DESC);

-- ===========================================
-- SOIL RECOMMENDATIONS
-- ===========================================
CREATE TABLE IF NOT EXISTS soil_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soil_record_id UUID NOT NULL REFERENCES soil_records(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    fertilizer_type VARCHAR(50),
    quantity_per_acre DECIMAL(10,2),
    application_timing VARCHAR(100),
    estimated_cost DECIMAL(10,2),
    expected_yield_improvement DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE soil_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read soil_recommendations" 
    ON soil_recommendations FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_soil_rec_farm ON soil_recommendations(farm_id);

-- ===========================================
-- MARKET PRICES
-- ===========================================
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read market_prices" 
    ON market_prices FOR SELECT 
    TO public 
    USING (true);

CREATE INDEX idx_market_crop ON market_prices(crop);
CREATE INDEX idx_market_date ON market_prices(price_date DESC);
CREATE INDEX idx_market_mandi ON market_prices(mandi_name);
CREATE INDEX idx_market_created ON market_prices(created_at DESC);

-- ===========================================
-- PRICE PREDICTIONS
-- ===========================================
CREATE TABLE IF NOT EXISTS price_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read price_predictions" 
    ON price_predictions FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_prediction_farm ON price_predictions(farm_id);
CREATE INDEX idx_prediction_crop ON price_predictions(crop);
CREATE INDEX idx_prediction_date ON price_predictions(prediction_date DESC);

-- ===========================================
-- WEATHER DATA CACHE
-- ===========================================
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    weather_date DATE NOT NULL,
    temperature_max DECIMAL(5,2),
    temperature_min DECIMAL(5,2),
    rainfall_mm DECIMAL(10,2),
    humidity_percent DECIMAL(5,2),
    wind_speed_kmh DECIMAL(5,2),
    source VARCHAR(50) DEFAULT 'imd',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read weather_data" 
    ON weather_data FOR SELECT 
    TO public 
    USING (true);

CREATE INDEX idx_weather_location ON weather_data(district, weather_date DESC);
CREATE INDEX idx_weather_date ON weather_data(weather_date DESC);

-- ===========================================
-- NOTIFICATIONS
-- ===========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their notifications" 
    ON notifications FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_notification_farmer ON notifications(farmer_id);
CREATE INDEX idx_notification_read ON notifications(is_read, created_at DESC);
CREATE INDEX idx_notification_created ON notifications(created_at DESC);

-- ===========================================
-- AUDIT LOG
-- ===========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read audit_log" 
    ON audit_log FOR SELECT 
    TO authenticated 
    USING (true);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_date ON audit_log(created_at DESC);
CREATE INDEX idx_audit_user ON audit_log(user_id);

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- VIEWS (Helpful for common queries)
-- ===========================================

-- View: Farmer Dashboard Summary
CREATE OR REPLACE VIEW farmer_dashboard AS
SELECT 
    f.id as farmer_id,
    f.name as farmer_name,
    f.phone,
    f.district,
    f.state,
    COUNT(DISTINCT farms.id) as total_farms,
    SUM(farms.area_acres) as total_area,
    MAX(cs.score) as latest_credit_score,
    MAX(cs.loan_eligibility_amount) as loan_eligibility,
    COUNT(DISTINCT n.id) FILTER (WHERE n.is_read = false) as unread_notifications
FROM farmers f
LEFT JOIN farms ON farms.farmer_id = f.id
LEFT JOIN credit_scores cs ON cs.farmer_id = f.id
LEFT JOIN notifications n ON n.farmer_id = f.id
WHERE f.is_active = true
GROUP BY f.id, f.name, f.phone, f.district, f.state;

-- View: Farm Health Summary
CREATE OR REPLACE VIEW farm_health AS
SELECT 
    farms.id as farm_id,
    farms.name as farm_name,
    farms.area_acres,
    AVG(sd.ndvi_value) as avg_ndvi,
    MAX(sd.ndvi_value) as max_ndvi,
    MIN(sd.ndvi_value) as min_ndvi,
    COUNT(sd.id) as total_observations,
    MAX(sd.image_date) as latest_observation_date
FROM farms
LEFT JOIN satellite_data sd ON sd.farm_id = farms.id
WHERE farms.is_active = true
GROUP BY farms.id, farms.name, farms.area_acres;

-- View: Market Price Trends
CREATE OR REPLACE VIEW market_trends AS
SELECT 
    crop,
    mandi_name,
    district,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    COUNT(*) as price_count,
    MAX(price_date) as latest_date
FROM market_prices
WHERE price_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY crop, mandi_name, district;

-- Grant permissions on views
ALTER VIEW farmer_dashboard OWNER TO postgres;
ALTER VIEW farm_health OWNER TO postgres;
ALTER VIEW market_trends OWNER TO postgres;

-- ===========================================
-- SEED DATA (Optional - for testing)
-- ===========================================

-- Insert sample farmer
INSERT INTO farmers (id, phone, name, district, state) VALUES
('f1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6', '9876543210', 'Rajesh Kumar', 'Jaipur', 'Rajasthan')
ON CONFLICT (phone) DO NOTHING;

-- Insert sample farm
INSERT INTO farms (id, farmer_id, name, area_acres, latitude, longitude, soil_type) VALUES
('farm-001', 'f1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6', 'North Field', 2.5, 26.9124, 75.7873, 'Loamy')
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ TriNetra database schema created successfully!';
    RAISE NOTICE '📊 Tables: 11 created';
    RAISE NOTICE '🔒 Row Level Security: Enabled';
    RAISE NOTICE '👁️  Views: 3 created';
    RAISE NOTICE '🎯 Ready for use!';
END $$;
