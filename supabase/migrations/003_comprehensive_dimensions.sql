-- Cycling Aladdin: Comprehensive Multi-Factor Rating System
-- Inspired by BlackRock Aladdin's 2000+ risk factors approach
-- Version: 3.0.0 - "Big Data" Edition

-- ============================================================================
-- DROP existing tables to rebuild with comprehensive schema
-- ============================================================================
DROP TABLE IF EXISTS rating_history CASCADE;
DROP TABLE IF EXISTS race_results CASCADE;
DROP TABLE IF EXISTS race_characteristics CASCADE;
DROP TABLE IF EXISTS races CASCADE;
DROP TABLE IF EXISTS rider_ratings CASCADE;
DROP TABLE IF EXISTS riders CASCADE;
DROP TYPE IF EXISTS race_category CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE race_category AS ENUM (
    'GT',           -- Grand Tours (TDF, Giro, Vuelta)
    'Monument',     -- 5 Monuments
    'WC',           -- World Championships
    'Olympics',     -- Olympic Games
    'WT',           -- World Tour
    'ProSeries',    -- UCI ProSeries
    'Continental',  -- Continental races
    'National',     -- National Championships
    'U23',          -- Under-23 races
    'Others'
);

CREATE TYPE race_terrain AS ENUM (
    'flat',
    'flat_technical',
    'rolling',
    'hilly',
    'mountain',
    'mountain_summit',
    'cobbles',
    'mixed',
    'time_trial_flat',
    'time_trial_hilly',
    'time_trial_mountain'
);

CREATE TYPE finish_type AS ENUM (
    'bunch_sprint',
    'reduced_sprint',
    'small_group',
    'solo',
    'summit_finish',
    'time_trial'
);

-- ============================================================================
-- RIDERS TABLE
-- ============================================================================
CREATE TABLE riders (
    id SERIAL PRIMARY KEY,
    pcs_id VARCHAR(255) UNIQUE,
    uci_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    country VARCHAR(100),
    country_code CHAR(3),
    team VARCHAR(255),
    team_code VARCHAR(10),
    birth_date DATE,
    age INTEGER,
    weight_kg DECIMAL(4,1),
    height_cm INTEGER,

    -- Career stats
    career_wins INTEGER DEFAULT 0,
    career_gt_wins INTEGER DEFAULT 0,
    career_monument_wins INTEGER DEFAULT 0,
    career_wc_wins INTEGER DEFAULT 0,
    career_stages INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    turned_pro_year INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_riders_name ON riders(name);
CREATE INDEX idx_riders_country ON riders(country_code);
CREATE INDEX idx_riders_team ON riders(team);

-- ============================================================================
-- COMPREHENSIVE RIDER RATINGS TABLE (40+ Dimensions)
-- ============================================================================
CREATE TABLE rider_ratings (
    id SERIAL PRIMARY KEY,
    rider_id INTEGER UNIQUE NOT NULL REFERENCES riders(id) ON DELETE CASCADE,

    -- ========================================================================
    -- POWER PROFILE DIMENSIONS (5-point scale mapped to ELO)
    -- Based on cycling power profiling research
    -- ========================================================================

    -- Neuromuscular Power (5-second efforts) - Pure explosive power
    power_sprint_5s INTEGER DEFAULT 1500,

    -- Anaerobic Capacity (1-minute efforts) - Short intense efforts
    power_anaerobic_1m INTEGER DEFAULT 1500,

    -- VO2max Power (5-minute efforts) - Aerobic ceiling
    power_vo2max_5m INTEGER DEFAULT 1500,

    -- Threshold Power (20-minute efforts) - Sustainable power
    power_threshold_20m INTEGER DEFAULT 1500,

    -- FTP Power (60-minute efforts) - Hour record territory
    power_ftp_60m INTEGER DEFAULT 1500,

    -- Endurance Power (2+ hour efforts) - Long-haul capability
    power_endurance_2h INTEGER DEFAULT 1500,

    -- ========================================================================
    -- TERRAIN SPECIALIZATION DIMENSIONS
    -- ========================================================================

    -- Flat terrain mastery
    terrain_flat INTEGER DEFAULT 1500,

    -- Rolling hills (undulating, no major climbs)
    terrain_rolling INTEGER DEFAULT 1500,

    -- Short steep climbs (puncheur terrain, 1-5km climbs)
    terrain_punch_climbs INTEGER DEFAULT 1500,

    -- Medium climbs (5-15km, HC category)
    terrain_medium_climbs INTEGER DEFAULT 1500,

    -- Long mountain climbs (15km+, grand tour style)
    terrain_long_climbs INTEGER DEFAULT 1500,

    -- High altitude performance (2000m+)
    terrain_altitude INTEGER DEFAULT 1500,

    -- Cobblestones/Pavé sections
    terrain_cobbles INTEGER DEFAULT 1500,

    -- Gravel/White roads (Strade Bianche style)
    terrain_gravel INTEGER DEFAULT 1500,

    -- Technical descending
    terrain_descending INTEGER DEFAULT 1500,

    -- Crosswind handling
    terrain_crosswinds INTEGER DEFAULT 1500,

    -- ========================================================================
    -- RACE TYPE SPECIALIZATION
    -- ========================================================================

    -- Sprint finish capability (bunch sprint)
    race_sprint_finish INTEGER DEFAULT 1500,

    -- Lead-out performance (setting up sprinter)
    race_leadout INTEGER DEFAULT 1500,

    -- Breakaway specialist
    race_breakaway INTEGER DEFAULT 1500,

    -- Individual time trial (flat)
    race_itt_flat INTEGER DEFAULT 1500,

    -- Individual time trial (hilly/mountain)
    race_itt_mountain INTEGER DEFAULT 1500,

    -- Team time trial
    race_ttt INTEGER DEFAULT 1500,

    -- Prologue specialist (short TT <10km)
    race_prologue INTEGER DEFAULT 1500,

    -- GC riding (overall classification)
    race_gc INTEGER DEFAULT 1500,

    -- One-day race specialist
    race_oneday INTEGER DEFAULT 1500,

    -- Stage race consistency
    race_stagerace INTEGER DEFAULT 1500,

    -- Grand Tour endurance (3-week races)
    race_grandtour INTEGER DEFAULT 1500,

    -- ========================================================================
    -- CLASSICS SPECIALIZATION
    -- ========================================================================

    -- Cobbled Classics (Flanders, Roubaix, E3, Gent-Wevelgem)
    classics_cobbled INTEGER DEFAULT 1500,

    -- Ardennes Classics (LBL, Amstel, Fleche)
    classics_ardennes INTEGER DEFAULT 1500,

    -- Italian Classics (MSR, Lombardia, Strade)
    classics_italian INTEGER DEFAULT 1500,

    -- Spring Classics overall
    classics_spring INTEGER DEFAULT 1500,

    -- Autumn Classics
    classics_autumn INTEGER DEFAULT 1500,

    -- ========================================================================
    -- TACTICAL & RACING IQ
    -- ========================================================================

    -- Race positioning (staying at front, avoiding crashes)
    tactical_positioning INTEGER DEFAULT 1500,

    -- Race IQ (reading race, timing attacks)
    tactical_race_iq INTEGER DEFAULT 1500,

    -- Attack timing and execution
    tactical_attacking INTEGER DEFAULT 1500,

    -- Defensive riding (marking, following wheels)
    tactical_defensive INTEGER DEFAULT 1500,

    -- Team leadership
    tactical_leadership INTEGER DEFAULT 1500,

    -- Domestique work (team support)
    tactical_domestique INTEGER DEFAULT 1500,

    -- ========================================================================
    -- PHYSICAL ATTRIBUTES
    -- ========================================================================

    -- Acceleration/Punch (sudden speed changes)
    physical_acceleration INTEGER DEFAULT 1500,

    -- Top-end speed
    physical_topspeed INTEGER DEFAULT 1500,

    -- Aerodynamic efficiency
    physical_aero INTEGER DEFAULT 1500,

    -- Recovery (between stages, after efforts)
    physical_recovery INTEGER DEFAULT 1500,

    -- Fatigue resistance (end of stage/race)
    physical_fatigue_resist INTEGER DEFAULT 1500,

    -- Bike handling skill
    physical_handling INTEGER DEFAULT 1500,

    -- Peloton survival (staying safe in bunch)
    physical_peloton_skills INTEGER DEFAULT 1500,

    -- ========================================================================
    -- WEATHER ADAPTABILITY
    -- ========================================================================

    -- Hot weather performance
    weather_heat INTEGER DEFAULT 1500,

    -- Cold weather performance
    weather_cold INTEGER DEFAULT 1500,

    -- Rain/wet conditions
    weather_rain INTEGER DEFAULT 1500,

    -- Wind (echelons, headwind TT)
    weather_wind INTEGER DEFAULT 1500,

    -- ========================================================================
    -- PERFORMANCE CONSISTENCY
    -- ========================================================================

    -- Day-to-day consistency
    consistency_daily INTEGER DEFAULT 1500,

    -- Season-long form management
    consistency_seasonal INTEGER DEFAULT 1500,

    -- Peak performance (big races)
    consistency_clutch INTEGER DEFAULT 1500,

    -- Reliability (finishing races)
    consistency_reliability INTEGER DEFAULT 1500,

    -- ========================================================================
    -- COMPUTED/AGGREGATE RATINGS
    -- ========================================================================

    -- Overall rating (weighted combination)
    overall INTEGER DEFAULT 1500,

    -- Sprinter score (computed)
    profile_sprinter INTEGER DEFAULT 1500,

    -- Climber score (computed)
    profile_climber INTEGER DEFAULT 1500,

    -- Puncheur score (computed)
    profile_puncheur INTEGER DEFAULT 1500,

    -- Rouleur score (computed)
    profile_rouleur INTEGER DEFAULT 1500,

    -- Time trialist score (computed)
    profile_timetrialist INTEGER DEFAULT 1500,

    -- GC contender score (computed)
    profile_gc INTEGER DEFAULT 1500,

    -- Classics specialist score (computed)
    profile_classics INTEGER DEFAULT 1500,

    -- All-rounder score (computed)
    profile_allrounder INTEGER DEFAULT 1500,

    -- ========================================================================
    -- STATISTICS
    -- ========================================================================
    races_count INTEGER DEFAULT 0,
    wins_count INTEGER DEFAULT 0,
    podiums_count INTEGER DEFAULT 0,
    top10_count INTEGER DEFAULT 0,
    dnf_count INTEGER DEFAULT 0,

    -- Season-specific
    season_races INTEGER DEFAULT 0,
    season_wins INTEGER DEFAULT 0,
    season_points INTEGER DEFAULT 0,

    -- Last update tracking
    last_race_date DATE,
    last_win_date DATE,
    rating_confidence DECIMAL(3,2) DEFAULT 0.5, -- How confident we are in ratings (0-1)

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rider_ratings_overall ON rider_ratings(overall DESC);
CREATE INDEX idx_rider_ratings_sprinter ON rider_ratings(profile_sprinter DESC);
CREATE INDEX idx_rider_ratings_climber ON rider_ratings(profile_climber DESC);
CREATE INDEX idx_rider_ratings_gc ON rider_ratings(profile_gc DESC);

-- ============================================================================
-- RACES TABLE
-- ============================================================================
CREATE TABLE races (
    id SERIAL PRIMARY KEY,
    pcs_id VARCHAR(255) UNIQUE,
    uci_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    name_short VARCHAR(50),
    category race_category DEFAULT 'Others',
    terrain race_terrain DEFAULT 'mixed',
    typical_finish finish_type DEFAULT 'bunch_sprint',

    -- Date and location
    date DATE NOT NULL,
    season INTEGER NOT NULL,
    country VARCHAR(100),
    country_code CHAR(3),
    start_city VARCHAR(100),
    end_city VARCHAR(100),

    -- Stage race info
    is_stage_race BOOLEAN DEFAULT FALSE,
    stage_number INTEGER,
    parent_race_id INTEGER REFERENCES races(id),
    total_stages INTEGER,

    -- Race metrics
    distance_km DECIMAL(6,1),
    elevation_gain_m INTEGER,
    elevation_loss_m INTEGER,
    max_elevation_m INTEGER,

    -- Profile scores (PCS-style)
    profile_score INTEGER DEFAULT 0,      -- Overall difficulty
    profile_score_final INTEGER DEFAULT 0, -- Final 25km difficulty

    -- Field quality
    startlist_quality INTEGER DEFAULT 0,
    finishers_count INTEGER,
    starters_count INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_races_date ON races(date DESC);
CREATE INDEX idx_races_category ON races(category);
CREATE INDEX idx_races_name ON races(name);

-- ============================================================================
-- RACE CHARACTERISTICS TABLE (Weight factors for each dimension)
-- ============================================================================
CREATE TABLE race_characteristics (
    id SERIAL PRIMARY KEY,
    race_id INTEGER UNIQUE NOT NULL REFERENCES races(id) ON DELETE CASCADE,

    -- ========================================================================
    -- POWER PROFILE WEIGHTS (0.0 to 1.0)
    -- How much each power duration matters for this race
    -- ========================================================================
    w_power_sprint_5s DECIMAL(3,2) DEFAULT 0,
    w_power_anaerobic_1m DECIMAL(3,2) DEFAULT 0,
    w_power_vo2max_5m DECIMAL(3,2) DEFAULT 0,
    w_power_threshold_20m DECIMAL(3,2) DEFAULT 0,
    w_power_ftp_60m DECIMAL(3,2) DEFAULT 0,
    w_power_endurance_2h DECIMAL(3,2) DEFAULT 0,

    -- ========================================================================
    -- TERRAIN WEIGHTS
    -- ========================================================================
    w_terrain_flat DECIMAL(3,2) DEFAULT 0,
    w_terrain_rolling DECIMAL(3,2) DEFAULT 0,
    w_terrain_punch_climbs DECIMAL(3,2) DEFAULT 0,
    w_terrain_medium_climbs DECIMAL(3,2) DEFAULT 0,
    w_terrain_long_climbs DECIMAL(3,2) DEFAULT 0,
    w_terrain_altitude DECIMAL(3,2) DEFAULT 0,
    w_terrain_cobbles DECIMAL(3,2) DEFAULT 0,
    w_terrain_gravel DECIMAL(3,2) DEFAULT 0,
    w_terrain_descending DECIMAL(3,2) DEFAULT 0,
    w_terrain_crosswinds DECIMAL(3,2) DEFAULT 0,

    -- ========================================================================
    -- RACE TYPE WEIGHTS
    -- ========================================================================
    w_race_sprint_finish DECIMAL(3,2) DEFAULT 0,
    w_race_breakaway DECIMAL(3,2) DEFAULT 0,
    w_race_itt_flat DECIMAL(3,2) DEFAULT 0,
    w_race_itt_mountain DECIMAL(3,2) DEFAULT 0,
    w_race_gc DECIMAL(3,2) DEFAULT 0,
    w_race_oneday DECIMAL(3,2) DEFAULT 0,
    w_race_stagerace DECIMAL(3,2) DEFAULT 0,

    -- ========================================================================
    -- TACTICAL WEIGHTS
    -- ========================================================================
    w_tactical_positioning DECIMAL(3,2) DEFAULT 0,
    w_tactical_race_iq DECIMAL(3,2) DEFAULT 0,
    w_tactical_attacking DECIMAL(3,2) DEFAULT 0,

    -- ========================================================================
    -- PHYSICAL WEIGHTS
    -- ========================================================================
    w_physical_acceleration DECIMAL(3,2) DEFAULT 0,
    w_physical_topspeed DECIMAL(3,2) DEFAULT 0,
    w_physical_aero DECIMAL(3,2) DEFAULT 0,
    w_physical_recovery DECIMAL(3,2) DEFAULT 0,
    w_physical_handling DECIMAL(3,2) DEFAULT 0,

    -- ========================================================================
    -- WEATHER CONDITIONS (actual conditions for this race)
    -- ========================================================================
    temperature_c INTEGER,
    precipitation_mm DECIMAL(4,1),
    wind_speed_kmh INTEGER,
    weather_condition VARCHAR(50), -- 'sunny', 'rain', 'cold', 'hot', 'windy'

    w_weather_heat DECIMAL(3,2) DEFAULT 0,
    w_weather_cold DECIMAL(3,2) DEFAULT 0,
    w_weather_rain DECIMAL(3,2) DEFAULT 0,
    w_weather_wind DECIMAL(3,2) DEFAULT 0,

    -- ========================================================================
    -- COURSE DETAILS
    -- ========================================================================
    cobbles_km DECIMAL(5,2) DEFAULT 0,
    cobbles_sectors INTEGER DEFAULT 0,
    gravel_km DECIMAL(5,2) DEFAULT 0,
    climbs_count INTEGER DEFAULT 0,
    climbs_hc_count INTEGER DEFAULT 0,
    climbs_cat1_count INTEGER DEFAULT 0,
    climbs_cat2_count INTEGER DEFAULT 0,
    climbs_cat3_count INTEGER DEFAULT 0,
    climbs_cat4_count INTEGER DEFAULT 0,

    avg_gradient DECIMAL(4,2),
    max_gradient DECIMAL(4,2),
    km_above_2000m DECIMAL(5,2) DEFAULT 0,

    -- Finish details
    finish_elevation_m INTEGER,
    finish_gradient DECIMAL(4,2),
    finish_type finish_type,

    -- Importance multiplier (affects rating changes)
    importance_multiplier DECIMAL(3,2) DEFAULT 1.0
);

-- ============================================================================
-- RACE RESULTS TABLE
-- ============================================================================
CREATE TABLE race_results (
    id SERIAL PRIMARY KEY,
    race_id INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    rider_id INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,
    time_seconds INTEGER,
    time_behind_seconds INTEGER,
    gap_to_winner VARCHAR(20),

    -- Points earned
    uci_points INTEGER DEFAULT 0,
    pcs_points INTEGER DEFAULT 0,
    gc_points INTEGER DEFAULT 0,
    kom_points INTEGER DEFAULT 0,
    sprint_points INTEGER DEFAULT 0,
    youth_points INTEGER DEFAULT 0,

    -- Status flags
    did_not_finish BOOLEAN DEFAULT FALSE,
    did_not_start BOOLEAN DEFAULT FALSE,
    disqualified BOOLEAN DEFAULT FALSE,
    relegated BOOLEAN DEFAULT FALSE,

    -- Performance metrics (if available)
    avg_power_watts INTEGER,
    normalized_power INTEGER,
    avg_speed_kmh DECIMAL(4,1),

    -- Rating change (computed after update)
    rating_change_overall INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(race_id, rider_id)
);

CREATE INDEX idx_race_results_race ON race_results(race_id);
CREATE INDEX idx_race_results_rider ON race_results(rider_id);
CREATE INDEX idx_race_results_position ON race_results(position);

-- ============================================================================
-- RATING HISTORY TABLE
-- ============================================================================
CREATE TABLE rating_history (
    id SERIAL PRIMARY KEY,
    rider_id INTEGER NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    race_id INTEGER REFERENCES races(id) ON DELETE SET NULL,
    date TIMESTAMPTZ NOT NULL,

    -- Store all dimension ratings as JSONB for flexibility
    ratings JSONB NOT NULL,

    -- Key ratings for quick queries
    overall_before INTEGER,
    overall_after INTEGER,
    overall_change INTEGER,

    change_reason VARCHAR(500)
);

CREATE INDEX idx_rating_history_rider ON rating_history(rider_id);
CREATE INDEX idx_rating_history_date ON rating_history(date DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_riders_updated_at
    BEFORE UPDATE ON riders FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rider_ratings_updated_at
    BEFORE UPDATE ON rider_ratings FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at
    BEFORE UPDATE ON races FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_history ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_riders" ON riders FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_ratings" ON rider_ratings FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_races" ON races FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_characteristics" ON race_characteristics FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_results" ON race_results FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_history" ON rating_history FOR SELECT TO anon USING (true);

-- Public write access (for demo)
CREATE POLICY "public_write_riders" ON riders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_riders" ON riders FOR UPDATE TO anon USING (true);
CREATE POLICY "public_write_ratings" ON rider_ratings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_ratings" ON rider_ratings FOR UPDATE TO anon USING (true);
CREATE POLICY "public_write_races" ON races FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_races" ON races FOR UPDATE TO anon USING (true);
CREATE POLICY "public_write_characteristics" ON race_characteristics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_characteristics" ON race_characteristics FOR UPDATE TO anon USING (true);
CREATE POLICY "public_write_results" ON race_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_results" ON race_results FOR UPDATE TO anon USING (true);
CREATE POLICY "public_write_history" ON rating_history FOR INSERT TO anon WITH CHECK (true);
