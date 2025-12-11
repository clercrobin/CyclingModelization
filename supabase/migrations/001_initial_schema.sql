-- Cycling Rating System Database Schema
-- Version: 2.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for race categories
CREATE TYPE race_category AS ENUM ('GT', 'Monument', 'WC', 'WT', 'ProSeries', 'Others');

-- Riders table
CREATE TABLE riders (
    id SERIAL PRIMARY KEY,
    pcs_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    team VARCHAR(255),
    birth_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_riders_name ON riders(name);
CREATE INDEX idx_riders_pcs_id ON riders(pcs_id);

-- Rider ratings table
CREATE TABLE rider_ratings (
    id SERIAL PRIMARY KEY,
    rider_id INTEGER UNIQUE NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    flat INTEGER DEFAULT 1500,
    cobbles INTEGER DEFAULT 1500,
    mountain INTEGER DEFAULT 1500,
    time_trial INTEGER DEFAULT 1500,
    sprint INTEGER DEFAULT 1500,
    gc INTEGER DEFAULT 1500,
    one_day INTEGER DEFAULT 1500,
    endurance INTEGER DEFAULT 1500,
    overall INTEGER DEFAULT 1500,
    races_count INTEGER DEFAULT 0,
    wins_count INTEGER DEFAULT 0,
    podiums_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rider_ratings_rider_id ON rider_ratings(rider_id);
CREATE INDEX idx_rider_ratings_overall ON rider_ratings(overall DESC);

-- Races table
CREATE TABLE races (
    id SERIAL PRIMARY KEY,
    pcs_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category race_category DEFAULT 'Others',
    date DATE NOT NULL,
    season INTEGER NOT NULL,
    country VARCHAR(100),
    is_stage_race BOOLEAN DEFAULT FALSE,
    stage_number INTEGER,
    parent_race_id INTEGER REFERENCES races(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_races_name ON races(name);
CREATE INDEX idx_races_date ON races(date DESC);
CREATE INDEX idx_races_season ON races(season);

-- Race characteristics table
CREATE TABLE race_characteristics (
    id SERIAL PRIMARY KEY,
    race_id INTEGER UNIQUE NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    flat_weight DECIMAL(3,2) DEFAULT 0,
    cobbles_weight DECIMAL(3,2) DEFAULT 0,
    mountain_weight DECIMAL(3,2) DEFAULT 0,
    time_trial_weight DECIMAL(3,2) DEFAULT 0,
    sprint_weight DECIMAL(3,2) DEFAULT 0,
    gc_weight DECIMAL(3,2) DEFAULT 0,
    one_day_weight DECIMAL(3,2) DEFAULT 0,
    endurance_weight DECIMAL(3,2) DEFAULT 0,
    distance_km DECIMAL(10,2),
    elevation_gain_m DECIMAL(10,2),
    avg_gradient DECIMAL(5,2)
);

CREATE INDEX idx_race_characteristics_race_id ON race_characteristics(race_id);

-- Race results table
CREATE TABLE race_results (
    id SERIAL PRIMARY KEY,
    race_id INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    rider_id INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    time_seconds INTEGER,
    time_behind_seconds INTEGER,
    points INTEGER DEFAULT 0,
    did_not_finish BOOLEAN DEFAULT FALSE,
    did_not_start BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(race_id, rider_id)
);

CREATE INDEX idx_race_results_race_id ON race_results(race_id);
CREATE INDEX idx_race_results_rider_id ON race_results(rider_id);

-- Rating history table
CREATE TABLE rating_history (
    id SERIAL PRIMARY KEY,
    rider_id INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    race_id INTEGER REFERENCES races(id) ON DELETE SET NULL,
    date TIMESTAMPTZ NOT NULL,
    ratings JSONB NOT NULL,
    change_reason VARCHAR(500)
);

CREATE INDEX idx_rating_history_rider_id ON rating_history(rider_id);
CREATE INDEX idx_rating_history_date ON rating_history(date DESC);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_riders_updated_at
    BEFORE UPDATE ON riders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rider_ratings_updated_at
    BEFORE UPDATE ON rider_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at
    BEFORE UPDATE ON races
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_history ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read-only for public)
CREATE POLICY "Allow public read access to riders"
    ON riders FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow public read access to rider_ratings"
    ON rider_ratings FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow public read access to races"
    ON races FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow public read access to race_characteristics"
    ON race_characteristics FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow public read access to race_results"
    ON race_results FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow public read access to rating_history"
    ON rating_history FOR SELECT
    TO anon
    USING (true);

-- Create policies for authenticated users (full access)
CREATE POLICY "Allow authenticated full access to riders"
    ON riders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to rider_ratings"
    ON rider_ratings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to races"
    ON races FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to race_characteristics"
    ON race_characteristics FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to race_results"
    ON race_results FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to rating_history"
    ON rating_history FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also allow anonymous users to insert/update for now (demo purposes)
-- In production, you'd want to require authentication
CREATE POLICY "Allow anon insert to riders"
    ON riders FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon update to riders"
    ON riders FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon insert to rider_ratings"
    ON rider_ratings FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon update to rider_ratings"
    ON rider_ratings FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon insert to races"
    ON races FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon update to races"
    ON races FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon insert to race_characteristics"
    ON race_characteristics FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon update to race_characteristics"
    ON race_characteristics FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon insert to race_results"
    ON race_results FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon update to race_results"
    ON race_results FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon insert to rating_history"
    ON rating_history FOR INSERT
    TO anon
    WITH CHECK (true);
