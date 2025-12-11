-- ============================================================================
-- REALISTIC PRO CYCLING DATA
-- Ratings based on actual 2024 performance and rider specializations
-- Rating scale: 1000 (amateur) -> 1500 (pro) -> 2000 (elite) -> 2500 (GOAT)
-- ============================================================================

-- ============================================================================
-- TOP 50 RIDERS (2024 Season)
-- ============================================================================

INSERT INTO riders (name, first_name, last_name, country, country_code, team, weight_kg, height_cm, birth_date, career_wins, career_gt_wins, career_monument_wins, is_active, turned_pro_year) VALUES
-- GC Contenders / All-rounders
('Tadej Pogačar', 'Tadej', 'Pogačar', 'Slovenia', 'SLO', 'UAE Team Emirates', 66, 176, '1998-09-21', 89, 3, 3, true, 2019),
('Jonas Vingegaard', 'Jonas', 'Vingegaard', 'Denmark', 'DEN', 'Visma-Lease a Bike', 60, 175, '1996-12-10', 18, 2, 0, true, 2019),
('Remco Evenepoel', 'Remco', 'Evenepoel', 'Belgium', 'BEL', 'Soudal-QuickStep', 61, 171, '2000-01-25', 56, 1, 1, true, 2019),
('Primož Roglič', 'Primož', 'Roglič', 'Slovenia', 'SLO', 'Red Bull-BORA-hansgrohe', 65, 177, '1989-10-29', 82, 3, 0, true, 2016),
('Juan Ayuso', 'Juan', 'Ayuso', 'Spain', 'ESP', 'UAE Team Emirates', 63, 180, '2002-09-16', 9, 0, 0, true, 2022),
('Egan Bernal', 'Egan', 'Bernal', 'Colombia', 'COL', 'INEOS Grenadiers', 60, 175, '1997-01-13', 18, 2, 0, true, 2018),
('Carlos Rodríguez', 'Carlos', 'Rodríguez', 'Spain', 'ESP', 'INEOS Grenadiers', 63, 176, '2001-02-02', 5, 0, 0, true, 2022),
('João Almeida', 'João', 'Almeida', 'Portugal', 'POR', 'UAE Team Emirates', 63, 172, '1998-08-05', 11, 0, 0, true, 2020),
('Enric Mas', 'Enric', 'Mas', 'Spain', 'ESP', 'Movistar Team', 62, 180, '1995-01-07', 7, 0, 0, true, 2017),
('Adam Yates', 'Adam', 'Yates', 'United Kingdom', 'GBR', 'UAE Team Emirates', 58, 173, '1992-08-07', 14, 0, 0, true, 2014),

-- Pure Climbers
('Richard Carapaz', 'Richard', 'Carapaz', 'Ecuador', 'ECU', 'EF Education-EasyPost', 62, 170, '1993-05-29', 18, 1, 0, true, 2016),
('Mikel Landa', 'Mikel', 'Landa', 'Spain', 'ESP', 'Soudal-QuickStep', 60, 174, '1989-12-13', 10, 0, 0, true, 2011),
('Simon Yates', 'Simon', 'Yates', 'United Kingdom', 'GBR', 'Jayco-AlUla', 58, 172, '1992-08-07', 27, 1, 0, true, 2014),
('Ben Healy', 'Ben', 'Healy', 'Ireland', 'IRL', 'EF Education-EasyPost', 58, 175, '2001-05-11', 6, 0, 0, true, 2022),
('Felix Gall', 'Felix', 'Gall', 'Austria', 'AUT', 'Decathlon AG2R', 62, 180, '1998-03-28', 5, 0, 0, true, 2020),
('Santiago Buitrago', 'Santiago', 'Buitrago', 'Colombia', 'COL', 'Bahrain-Victorious', 57, 170, '1999-12-26', 5, 0, 0, true, 2021),
('Giulio Ciccone', 'Giulio', 'Ciccone', 'Italy', 'ITA', 'Lidl-Trek', 56, 171, '1994-12-20', 8, 0, 0, true, 2016),

-- Classics Specialists / Puncheurs
('Mathieu van der Poel', 'Mathieu', 'van der Poel', 'Netherlands', 'NED', 'Alpecin-Deceuninck', 75, 184, '1995-01-19', 48, 0, 3, true, 2018),
('Wout van Aert', 'Wout', 'van Aert', 'Belgium', 'BEL', 'Visma-Lease a Bike', 78, 187, '1994-09-15', 56, 0, 1, true, 2019),
('Julian Alaphilippe', 'Julian', 'Alaphilippe', 'France', 'FRA', 'Soudal-QuickStep', 62, 173, '1992-06-11', 37, 0, 1, true, 2014),
('Tom Pidcock', 'Tom', 'Pidcock', 'United Kingdom', 'GBR', 'INEOS Grenadiers', 58, 170, '1999-07-30', 12, 0, 0, true, 2021),
('Kasper Asgreen', 'Kasper', 'Asgreen', 'Denmark', 'DEN', 'Soudal-QuickStep', 75, 184, '1995-02-08', 12, 0, 1, true, 2018),
('Matej Mohorič', 'Matej', 'Mohorič', 'Slovenia', 'SLO', 'Bahrain-Victorious', 71, 181, '1994-10-19', 17, 0, 1, true, 2015),
('Mads Pedersen', 'Mads', 'Pedersen', 'Denmark', 'DEN', 'Lidl-Trek', 76, 185, '1995-12-18', 26, 0, 0, true, 2017),
('Jasper Stuyven', 'Jasper', 'Stuyven', 'Belgium', 'BEL', 'Lidl-Trek', 78, 184, '1992-04-17', 9, 0, 1, true, 2014),
('Stefan Küng', 'Stefan', 'Küng', 'Switzerland', 'SUI', 'Groupama-FDJ', 83, 190, '1993-11-16', 13, 0, 0, true, 2015),
('Christophe Laporte', 'Christophe', 'Laporte', 'France', 'FRA', 'Visma-Lease a Bike', 73, 183, '1992-12-11', 15, 0, 0, true, 2016),
('Benoit Cosnefroy', 'Benoit', 'Cosnefroy', 'France', 'FRA', 'Decathlon AG2R', 64, 173, '1995-10-17', 8, 0, 0, true, 2018),
('Marc Hirschi', 'Marc', 'Hirschi', 'Switzerland', 'SUI', 'UAE Team Emirates', 61, 174, '1998-08-24', 12, 0, 0, true, 2019),
('Biniam Girmay', 'Biniam', 'Girmay', 'Eritrea', 'ERI', 'Intermarché-Wanty', 65, 175, '2000-04-02', 14, 0, 1, true, 2021),

-- Pure Sprinters
('Jasper Philipsen', 'Jasper', 'Philipsen', 'Belgium', 'BEL', 'Alpecin-Deceuninck', 75, 178, '1998-03-02', 36, 0, 0, true, 2019),
('Jonathan Milan', 'Jonathan', 'Milan', 'Italy', 'ITA', 'Lidl-Trek', 89, 195, '2000-10-01', 17, 0, 0, true, 2022),
('Tim Merlier', 'Tim', 'Merlier', 'Belgium', 'BEL', 'Soudal-QuickStep', 76, 183, '1992-10-30', 23, 0, 0, true, 2017),
('Fabio Jakobsen', 'Fabio', 'Jakobsen', 'Netherlands', 'NED', 'dsm-firmenich PostNL', 78, 182, '1996-08-31', 27, 0, 0, true, 2018),
('Arnaud De Lie', 'Arnaud', 'De Lie', 'Belgium', 'BEL', 'Lotto-Dstny', 75, 180, '2002-03-16', 15, 0, 0, true, 2022),
('Dylan Groenewegen', 'Dylan', 'Groenewegen', 'Netherlands', 'NED', 'Jayco-AlUla', 70, 177, '1993-06-21', 27, 0, 0, true, 2015),
('Phil Bauhaus', 'Phil', 'Bauhaus', 'Germany', 'GER', 'Bahrain-Victorious', 75, 181, '1994-07-08', 17, 0, 0, true, 2016),
('Olav Kooij', 'Olav', 'Kooij', 'Netherlands', 'NED', 'Visma-Lease a Bike', 70, 178, '2001-10-17', 16, 0, 0, true, 2022),
('Sam Bennett', 'Sam', 'Bennett', 'Ireland', 'IRL', 'Decathlon AG2R', 73, 175, '1990-10-16', 30, 0, 0, true, 2013),
('Mark Cavendish', 'Mark', 'Cavendish', 'United Kingdom', 'GBR', 'Astana Qazaqstan', 70, 175, '1985-05-21', 165, 0, 1, true, 2007),

-- Time Trial Specialists
('Filippo Ganna', 'Filippo', 'Ganna', 'Italy', 'ITA', 'INEOS Grenadiers', 82, 193, '1996-07-25', 24, 0, 0, true, 2019),
('Josh Tarling', 'Josh', 'Tarling', 'United Kingdom', 'GBR', 'INEOS Grenadiers', 78, 190, '2004-08-20', 6, 0, 0, true, 2023),
('Søren Wærenskjold', 'Søren', 'Wærenskjold', 'Norway', 'NOR', 'Uno-X Mobility', 79, 188, '2001-01-26', 2, 0, 0, true, 2023),
('Brandon McNulty', 'Brandon', 'McNulty', 'United States', 'USA', 'UAE Team Emirates', 68, 180, '1998-04-02', 6, 0, 0, true, 2019),
('Mattia Cattaneo', 'Mattia', 'Cattaneo', 'Italy', 'ITA', 'Soudal-QuickStep', 67, 180, '1990-10-25', 0, 0, 0, true, 2013),

-- Rouleurs / Breakaway Specialists
('Neilson Powless', 'Neilson', 'Powless', 'United States', 'USA', 'EF Education-EasyPost', 68, 185, '1996-09-03', 3, 0, 0, true, 2019),
('Alberto Bettiol', 'Alberto', 'Bettiol', 'Italy', 'ITA', 'EF Education-EasyPost', 69, 182, '1993-10-29', 3, 0, 1, true, 2015),
('Matteo Jorgenson', 'Matteo', 'Jorgenson', 'United States', 'USA', 'Visma-Lease a Bike', 70, 187, '1999-07-01', 7, 0, 0, true, 2021),
('Victor Campenaerts', 'Victor', 'Campenaerts', 'Belgium', 'BEL', 'Lotto-Dstny', 78, 184, '1991-10-28', 6, 0, 0, true, 2014),
('Tiesj Benoot', 'Tiesj', 'Benoot', 'Belgium', 'BEL', 'Visma-Lease a Bike', 73, 187, '1994-03-11', 4, 0, 0, true, 2015)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- REALISTIC RATINGS
-- Based on 2024 performances, rider specializations, and career achievements
-- ============================================================================

-- Helper: Get rider_id by name and insert ratings
-- Ratings logic:
-- 1200-1400: Average pro
-- 1400-1600: Good pro
-- 1600-1800: Top tier
-- 1800-2000: World class
-- 2000-2200: Best in world
-- 2200-2400: Historic/GOAT level

INSERT INTO rider_ratings (
    rider_id,
    -- Power Profile
    power_sprint_5s, power_anaerobic_1m, power_vo2max_5m, power_threshold_20m, power_ftp_60m, power_endurance_2h,
    -- Terrain
    terrain_flat, terrain_rolling, terrain_punch_climbs, terrain_medium_climbs, terrain_long_climbs, terrain_altitude, terrain_cobbles, terrain_gravel, terrain_descending, terrain_crosswinds,
    -- Race Type
    race_sprint_finish, race_leadout, race_breakaway, race_itt_flat, race_itt_mountain, race_ttt, race_prologue, race_gc, race_oneday, race_stagerace, race_grandtour,
    -- Classics
    classics_cobbled, classics_ardennes, classics_italian, classics_spring, classics_autumn,
    -- Tactical
    tactical_positioning, tactical_race_iq, tactical_attacking, tactical_defensive, tactical_leadership, tactical_domestique,
    -- Physical
    physical_acceleration, physical_topspeed, physical_aero, physical_recovery, physical_fatigue_resist, physical_handling, physical_peloton_skills,
    -- Weather
    weather_heat, weather_cold, weather_rain, weather_wind,
    -- Consistency
    consistency_daily, consistency_seasonal, consistency_clutch, consistency_reliability,
    -- Profiles
    overall, profile_sprinter, profile_climber, profile_puncheur, profile_rouleur, profile_timetrialist, profile_gc, profile_classics, profile_allrounder,
    -- Stats
    races_count, wins_count, podiums_count, rating_confidence
)
SELECT
    r.id,
    -- Tadej Pogačar - The Ultimate All-Rounder / Current GOAT
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 1950 WHEN 'Jonas Vingegaard' THEN 1750 WHEN 'Remco Evenepoel' THEN 1900 WHEN 'Mathieu van der Poel' THEN 2200 WHEN 'Wout van Aert' THEN 2100 WHEN 'Jasper Philipsen' THEN 2250 WHEN 'Jonathan Milan' THEN 2200 WHEN 'Filippo Ganna' THEN 2000 ELSE 1500 END, -- power_sprint_5s
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Jonas Vingegaard' THEN 2000 WHEN 'Remco Evenepoel' THEN 2050 WHEN 'Mathieu van der Poel' THEN 2150 WHEN 'Wout van Aert' THEN 2100 WHEN 'Julian Alaphilippe' THEN 2000 WHEN 'Tom Pidcock' THEN 2000 ELSE 1550 END, -- power_anaerobic_1m
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2300 WHEN 'Jonas Vingegaard' THEN 2250 WHEN 'Remco Evenepoel' THEN 2150 WHEN 'Primož Roglič' THEN 2050 WHEN 'Mathieu van der Poel' THEN 1950 WHEN 'Wout van Aert' THEN 1900 WHEN 'Julian Alaphilippe' THEN 2000 WHEN 'Richard Carapaz' THEN 2050 WHEN 'Mikel Landa' THEN 2000 WHEN 'Simon Yates' THEN 2000 ELSE 1600 END, -- power_vo2max_5m
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2250 WHEN 'Jonas Vingegaard' THEN 2300 WHEN 'Remco Evenepoel' THEN 2200 WHEN 'Primož Roglič' THEN 2100 WHEN 'Filippo Ganna' THEN 2200 WHEN 'Juan Ayuso' THEN 2000 WHEN 'João Almeida' THEN 2000 WHEN 'Richard Carapaz' THEN 2050 ELSE 1650 END, -- power_threshold_20m
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Jonas Vingegaard' THEN 2250 WHEN 'Remco Evenepoel' THEN 2150 WHEN 'Filippo Ganna' THEN 2300 WHEN 'Josh Tarling' THEN 2050 WHEN 'Stefan Küng' THEN 2050 ELSE 1600 END, -- power_ftp_60m
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Jonas Vingegaard' THEN 2200 WHEN 'Primož Roglič' THEN 2100 WHEN 'Richard Carapaz' THEN 2050 WHEN 'Egan Bernal' THEN 2000 WHEN 'Wout van Aert' THEN 1900 WHEN 'Mathieu van der Poel' THEN 1850 ELSE 1600 END, -- power_endurance_2h

    -- Terrain ratings
    CASE r.name
        WHEN 'Jasper Philipsen' THEN 2200 WHEN 'Jonathan Milan' THEN 2200 WHEN 'Tim Merlier' THEN 2100 WHEN 'Wout van Aert' THEN 2000 WHEN 'Filippo Ganna' THEN 2100 WHEN 'Mathieu van der Poel' THEN 1950 WHEN 'Mads Pedersen' THEN 2000 ELSE 1550 END, -- terrain_flat
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2150 WHEN 'Mathieu van der Poel' THEN 2200 WHEN 'Wout van Aert' THEN 2150 WHEN 'Julian Alaphilippe' THEN 2050 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Mads Pedersen' THEN 1950 ELSE 1600 END, -- terrain_rolling
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2300 WHEN 'Julian Alaphilippe' THEN 2150 WHEN 'Mathieu van der Poel' THEN 2100 WHEN 'Tom Pidcock' THEN 2050 WHEN 'Wout van Aert' THEN 2000 WHEN 'Remco Evenepoel' THEN 2050 WHEN 'Marc Hirschi' THEN 1950 ELSE 1600 END, -- terrain_punch_climbs
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2300 WHEN 'Jonas Vingegaard' THEN 2250 WHEN 'Primož Roglič' THEN 2100 WHEN 'Richard Carapaz' THEN 2100 WHEN 'Remco Evenepoel' THEN 2050 WHEN 'Mikel Landa' THEN 2000 WHEN 'Simon Yates' THEN 2000 ELSE 1550 END, -- terrain_medium_climbs
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2350 WHEN 'Jonas Vingegaard' THEN 2300 WHEN 'Richard Carapaz' THEN 2100 WHEN 'Primož Roglič' THEN 2050 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Mikel Landa' THEN 2050 WHEN 'Egan Bernal' THEN 2000 ELSE 1500 END, -- terrain_long_climbs
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Jonas Vingegaard' THEN 2200 WHEN 'Richard Carapaz' THEN 2100 WHEN 'Primož Roglič' THEN 2000 WHEN 'Egan Bernal' THEN 2050 WHEN 'Santiago Buitrago' THEN 1950 ELSE 1500 END, -- terrain_altitude
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2350 WHEN 'Wout van Aert' THEN 2250 WHEN 'Kasper Asgreen' THEN 2050 WHEN 'Mads Pedersen' THEN 2000 WHEN 'Jasper Stuyven' THEN 2000 WHEN 'Tim Merlier' THEN 1900 WHEN 'Stefan Küng' THEN 1950 ELSE 1400 END, -- terrain_cobbles
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2200 WHEN 'Tom Pidcock' THEN 2100 WHEN 'Wout van Aert' THEN 2050 WHEN 'Tadej Pogačar' THEN 2000 WHEN 'Julian Alaphilippe' THEN 1900 ELSE 1500 END, -- terrain_gravel
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2150 WHEN 'Primož Roglič' THEN 2100 WHEN 'Mathieu van der Poel' THEN 2100 WHEN 'Tom Pidcock' THEN 2050 WHEN 'Matej Mohorič' THEN 2150 WHEN 'Remco Evenepoel' THEN 1900 WHEN 'Jonas Vingegaard' THEN 2000 ELSE 1600 END, -- terrain_descending
    CASE r.name
        WHEN 'Wout van Aert' THEN 2100 WHEN 'Mathieu van der Poel' THEN 2050 WHEN 'Jasper Philipsen' THEN 1900 WHEN 'Filippo Ganna' THEN 2000 WHEN 'Stefan Küng' THEN 2000 ELSE 1550 END, -- terrain_crosswinds

    -- Race Type ratings
    CASE r.name
        WHEN 'Jasper Philipsen' THEN 2300 WHEN 'Jonathan Milan' THEN 2250 WHEN 'Tim Merlier' THEN 2150 WHEN 'Fabio Jakobsen' THEN 2100 WHEN 'Dylan Groenewegen' THEN 2050 WHEN 'Mark Cavendish' THEN 2000 WHEN 'Arnaud De Lie' THEN 2000 WHEN 'Olav Kooij' THEN 2000 WHEN 'Biniam Girmay' THEN 2050 WHEN 'Wout van Aert' THEN 1900 WHEN 'Mathieu van der Poel' THEN 1850 ELSE 1400 END, -- race_sprint_finish
    CASE r.name
        WHEN 'Jasper Philipsen' THEN 1800 WHEN 'Wout van Aert' THEN 2050 WHEN 'Mathieu van der Poel' THEN 1950 WHEN 'Christophe Laporte' THEN 2000 ELSE 1500 END, -- race_leadout
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2200 WHEN 'Wout van Aert' THEN 2100 WHEN 'Tadej Pogačar' THEN 2150 WHEN 'Julian Alaphilippe' THEN 2100 WHEN 'Matej Mohorič' THEN 2050 WHEN 'Victor Campenaerts' THEN 2000 WHEN 'Neilson Powless' THEN 1900 WHEN 'Alberto Bettiol' THEN 1950 ELSE 1550 END, -- race_breakaway
    CASE r.name
        WHEN 'Filippo Ganna' THEN 2400 WHEN 'Remco Evenepoel' THEN 2250 WHEN 'Josh Tarling' THEN 2150 WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Stefan Küng' THEN 2150 WHEN 'Wout van Aert' THEN 2050 WHEN 'Brandon McNulty' THEN 2000 WHEN 'Jonas Vingegaard' THEN 2000 WHEN 'Primož Roglič' THEN 1950 ELSE 1500 END, -- race_itt_flat
    CASE r.name
        WHEN 'Remco Evenepoel' THEN 2200 WHEN 'Tadej Pogačar' THEN 2150 WHEN 'Primož Roglič' THEN 2100 WHEN 'Jonas Vingegaard' THEN 2050 WHEN 'João Almeida' THEN 1950 ELSE 1500 END, -- race_itt_mountain
    CASE r.name
        WHEN 'Filippo Ganna' THEN 2200 WHEN 'Stefan Küng' THEN 2050 WHEN 'Josh Tarling' THEN 2000 ELSE 1600 END, -- race_ttt
    CASE r.name
        WHEN 'Filippo Ganna' THEN 2200 WHEN 'Remco Evenepoel' THEN 2150 WHEN 'Tadej Pogačar' THEN 2050 ELSE 1550 END, -- race_prologue
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2350 WHEN 'Jonas Vingegaard' THEN 2300 WHEN 'Primož Roglič' THEN 2150 WHEN 'Remco Evenepoel' THEN 2100 WHEN 'Juan Ayuso' THEN 2000 WHEN 'João Almeida' THEN 1950 WHEN 'Egan Bernal' THEN 1950 WHEN 'Richard Carapaz' THEN 1950 WHEN 'Adam Yates' THEN 1900 WHEN 'Carlos Rodríguez' THEN 1900 WHEN 'Enric Mas' THEN 1850 WHEN 'Mikel Landa' THEN 1850 WHEN 'Simon Yates' THEN 1900 ELSE 1400 END, -- race_gc
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2300 WHEN 'Tadej Pogačar' THEN 2250 WHEN 'Wout van Aert' THEN 2200 WHEN 'Julian Alaphilippe' THEN 2050 WHEN 'Tom Pidcock' THEN 2000 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Kasper Asgreen' THEN 1950 WHEN 'Mads Pedersen' THEN 1950 WHEN 'Biniam Girmay' THEN 1900 ELSE 1550 END, -- race_oneday
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2250 WHEN 'Jonas Vingegaard' THEN 2200 WHEN 'Primož Roglič' THEN 2150 WHEN 'Remco Evenepoel' THEN 2100 WHEN 'Juan Ayuso' THEN 1950 WHEN 'Wout van Aert' THEN 1900 WHEN 'Mathieu van der Poel' THEN 1800 ELSE 1550 END, -- race_stagerace
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2300 WHEN 'Jonas Vingegaard' THEN 2250 WHEN 'Primož Roglič' THEN 2100 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Richard Carapaz' THEN 2000 WHEN 'Egan Bernal' THEN 1950 WHEN 'João Almeida' THEN 1900 WHEN 'Juan Ayuso' THEN 1900 WHEN 'Adam Yates' THEN 1900 ELSE 1450 END, -- race_grandtour

    -- Classics ratings
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2400 WHEN 'Wout van Aert' THEN 2200 WHEN 'Kasper Asgreen' THEN 2050 WHEN 'Mads Pedersen' THEN 2000 WHEN 'Jasper Stuyven' THEN 1950 WHEN 'Tim Merlier' THEN 1850 WHEN 'Stefan Küng' THEN 1900 WHEN 'Tadej Pogačar' THEN 1950 ELSE 1400 END, -- classics_cobbled
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2300 WHEN 'Julian Alaphilippe' THEN 2100 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Tom Pidcock' THEN 2000 WHEN 'Wout van Aert' THEN 1950 WHEN 'Mathieu van der Poel' THEN 1950 WHEN 'Benoit Cosnefroy' THEN 1900 WHEN 'Marc Hirschi' THEN 1900 ELSE 1450 END, -- classics_ardennes
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2350 WHEN 'Mathieu van der Poel' THEN 2100 WHEN 'Primož Roglič' THEN 1950 WHEN 'Matej Mohorič' THEN 2000 WHEN 'Alberto Bettiol' THEN 1950 WHEN 'Wout van Aert' THEN 1900 ELSE 1500 END, -- classics_italian
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2350 WHEN 'Wout van Aert' THEN 2200 WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Kasper Asgreen' THEN 2000 WHEN 'Mads Pedersen' THEN 1950 WHEN 'Julian Alaphilippe' THEN 2000 WHEN 'Tom Pidcock' THEN 1950 ELSE 1450 END, -- classics_spring
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2250 WHEN 'Mathieu van der Poel' THEN 2050 WHEN 'Primož Roglič' THEN 1950 ELSE 1500 END, -- classics_autumn

    -- Tactical ratings
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Mathieu van der Poel' THEN 2150 WHEN 'Wout van Aert' THEN 2100 WHEN 'Jonas Vingegaard' THEN 2000 WHEN 'Mark Cavendish' THEN 2050 ELSE 1600 END, -- tactical_positioning
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Mathieu van der Poel' THEN 2150 WHEN 'Julian Alaphilippe' THEN 2000 WHEN 'Primož Roglič' THEN 2050 WHEN 'Remco Evenepoel' THEN 1950 WHEN 'Mark Cavendish' THEN 2050 ELSE 1600 END, -- tactical_race_iq
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2300 WHEN 'Mathieu van der Poel' THEN 2200 WHEN 'Julian Alaphilippe' THEN 2150 WHEN 'Wout van Aert' THEN 2050 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Tom Pidcock' THEN 2000 ELSE 1550 END, -- tactical_attacking
    CASE r.name
        WHEN 'Jonas Vingegaard' THEN 2200 WHEN 'Tadej Pogačar' THEN 2050 WHEN 'Primož Roglič' THEN 2050 ELSE 1600 END, -- tactical_defensive
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Jonas Vingegaard' THEN 2050 WHEN 'Primož Roglič' THEN 2000 WHEN 'Mark Cavendish' THEN 1950 ELSE 1550 END, -- tactical_leadership
    CASE r.name
        WHEN 'Tiesj Benoot' THEN 2000 WHEN 'Matteo Jorgenson' THEN 1950 WHEN 'Brandon McNulty' THEN 1900 ELSE 1600 END, -- tactical_domestique

    -- Physical ratings
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2300 WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Wout van Aert' THEN 2150 WHEN 'Julian Alaphilippe' THEN 2100 WHEN 'Jasper Philipsen' THEN 2100 WHEN 'Jonathan Milan' THEN 2050 ELSE 1600 END, -- physical_acceleration
    CASE r.name
        WHEN 'Jasper Philipsen' THEN 2250 WHEN 'Jonathan Milan' THEN 2300 WHEN 'Tim Merlier' THEN 2150 WHEN 'Fabio Jakobsen' THEN 2100 WHEN 'Filippo Ganna' THEN 2150 WHEN 'Wout van Aert' THEN 2000 ELSE 1550 END, -- physical_topspeed
    CASE r.name
        WHEN 'Filippo Ganna' THEN 2350 WHEN 'Josh Tarling' THEN 2150 WHEN 'Remco Evenepoel' THEN 2100 WHEN 'Stefan Küng' THEN 2100 WHEN 'Wout van Aert' THEN 2000 WHEN 'Tadej Pogačar' THEN 1950 ELSE 1550 END, -- physical_aero
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Jonas Vingegaard' THEN 2150 WHEN 'Primož Roglič' THEN 2050 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Mathieu van der Poel' THEN 2050 WHEN 'Wout van Aert' THEN 2050 ELSE 1600 END, -- physical_recovery
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2250 WHEN 'Jonas Vingegaard' THEN 2200 WHEN 'Primož Roglič' THEN 2050 WHEN 'Richard Carapaz' THEN 2050 WHEN 'Mathieu van der Poel' THEN 2000 ELSE 1600 END, -- physical_fatigue_resist
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2300 WHEN 'Tom Pidcock' THEN 2200 WHEN 'Wout van Aert' THEN 2150 WHEN 'Tadej Pogačar' THEN 2050 WHEN 'Primož Roglič' THEN 2000 ELSE 1650 END, -- physical_handling
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Mathieu van der Poel' THEN 2150 WHEN 'Wout van Aert' THEN 2100 WHEN 'Mark Cavendish' THEN 2050 WHEN 'Jonas Vingegaard' THEN 2000 ELSE 1650 END, -- physical_peloton_skills

    -- Weather ratings
    CASE r.name
        WHEN 'Richard Carapaz' THEN 2050 WHEN 'Tadej Pogačar' THEN 2000 WHEN 'Santiago Buitrago' THEN 2000 ELSE 1600 END, -- weather_heat
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2100 WHEN 'Wout van Aert' THEN 2050 WHEN 'Tadej Pogačar' THEN 1950 ELSE 1600 END, -- weather_cold
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2150 WHEN 'Wout van Aert' THEN 2100 WHEN 'Tom Pidcock' THEN 2050 WHEN 'Primož Roglič' THEN 2000 WHEN 'Matej Mohorič' THEN 2000 ELSE 1600 END, -- weather_rain
    CASE r.name
        WHEN 'Wout van Aert' THEN 2100 WHEN 'Mathieu van der Poel' THEN 2050 WHEN 'Filippo Ganna' THEN 2050 WHEN 'Stefan Küng' THEN 2000 ELSE 1550 END, -- weather_wind

    -- Consistency ratings
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Jonas Vingegaard' THEN 2100 WHEN 'Primož Roglič' THEN 2000 WHEN 'Mathieu van der Poel' THEN 2050 WHEN 'Wout van Aert' THEN 2000 WHEN 'Jasper Philipsen' THEN 2000 ELSE 1650 END, -- consistency_daily
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2250 WHEN 'Mathieu van der Poel' THEN 2100 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Primož Roglič' THEN 1950 ELSE 1650 END, -- consistency_seasonal
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2350 WHEN 'Mathieu van der Poel' THEN 2250 WHEN 'Jonas Vingegaard' THEN 2150 WHEN 'Remco Evenepoel' THEN 2050 WHEN 'Wout van Aert' THEN 2000 WHEN 'Mark Cavendish' THEN 2050 ELSE 1600 END, -- consistency_clutch
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Richard Carapaz' THEN 2000 WHEN 'João Almeida' THEN 2000 WHEN 'Mathieu van der Poel' THEN 1950 WHEN 'Primož Roglič' THEN 1800 ELSE 1700 END, -- consistency_reliability

    -- Profile scores (computed aggregates)
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2300 WHEN 'Jonas Vingegaard' THEN 2150 WHEN 'Mathieu van der Poel' THEN 2200 WHEN 'Remco Evenepoel' THEN 2100 WHEN 'Wout van Aert' THEN 2050 WHEN 'Primož Roglič' THEN 2000 WHEN 'Jasper Philipsen' THEN 1950 WHEN 'Filippo Ganna' THEN 1950 WHEN 'Julian Alaphilippe' THEN 1950 WHEN 'Tom Pidcock' THEN 1900 WHEN 'Richard Carapaz' THEN 1900 WHEN 'Jonathan Milan' THEN 1900 WHEN 'Tim Merlier' THEN 1850 WHEN 'Juan Ayuso' THEN 1850 WHEN 'João Almeida' THEN 1850 WHEN 'Kasper Asgreen' THEN 1800 WHEN 'Mads Pedersen' THEN 1800 WHEN 'Egan Bernal' THEN 1800 WHEN 'Mikel Landa' THEN 1750 WHEN 'Simon Yates' THEN 1800 WHEN 'Adam Yates' THEN 1750 WHEN 'Carlos Rodríguez' THEN 1750 WHEN 'Enric Mas' THEN 1700 WHEN 'Ben Healy' THEN 1700 WHEN 'Felix Gall' THEN 1700 WHEN 'Josh Tarling' THEN 1750 WHEN 'Stefan Küng' THEN 1750 WHEN 'Matej Mohorič' THEN 1750 WHEN 'Biniam Girmay' THEN 1800 WHEN 'Marc Hirschi' THEN 1750 WHEN 'Fabio Jakobsen' THEN 1800 WHEN 'Dylan Groenewegen' THEN 1750 WHEN 'Arnaud De Lie' THEN 1750 WHEN 'Olav Kooij' THEN 1750 WHEN 'Sam Bennett' THEN 1700 WHEN 'Mark Cavendish' THEN 1850 WHEN 'Christophe Laporte' THEN 1750 WHEN 'Jasper Stuyven' THEN 1750 WHEN 'Benoit Cosnefroy' THEN 1700 WHEN 'Phil Bauhaus' THEN 1700 WHEN 'Giulio Ciccone' THEN 1700 WHEN 'Santiago Buitrago' THEN 1700 WHEN 'Neilson Powless' THEN 1700 WHEN 'Alberto Bettiol' THEN 1700 WHEN 'Matteo Jorgenson' THEN 1750 WHEN 'Victor Campenaerts' THEN 1700 WHEN 'Tiesj Benoot' THEN 1700 WHEN 'Brandon McNulty' THEN 1700 WHEN 'Søren Wærenskjold' THEN 1650 WHEN 'Mattia Cattaneo' THEN 1600 ELSE 1500 END, -- overall
    CASE r.name
        WHEN 'Jasper Philipsen' THEN 2300 WHEN 'Jonathan Milan' THEN 2250 WHEN 'Tim Merlier' THEN 2150 WHEN 'Fabio Jakobsen' THEN 2100 WHEN 'Dylan Groenewegen' THEN 2050 WHEN 'Mark Cavendish' THEN 2100 WHEN 'Arnaud De Lie' THEN 2000 WHEN 'Olav Kooij' THEN 2000 WHEN 'Biniam Girmay' THEN 2050 WHEN 'Phil Bauhaus' THEN 1950 WHEN 'Sam Bennett' THEN 1950 WHEN 'Wout van Aert' THEN 1900 WHEN 'Mads Pedersen' THEN 1900 WHEN 'Mathieu van der Poel' THEN 1850 ELSE 1400 END, -- profile_sprinter
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2350 WHEN 'Jonas Vingegaard' THEN 2300 WHEN 'Richard Carapaz' THEN 2100 WHEN 'Primož Roglič' THEN 2050 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Mikel Landa' THEN 2000 WHEN 'Simon Yates' THEN 2000 WHEN 'Egan Bernal' THEN 2000 WHEN 'Juan Ayuso' THEN 1950 WHEN 'João Almeida' THEN 1900 WHEN 'Adam Yates' THEN 1900 WHEN 'Carlos Rodríguez' THEN 1900 WHEN 'Enric Mas' THEN 1850 WHEN 'Felix Gall' THEN 1850 WHEN 'Ben Healy' THEN 1850 WHEN 'Santiago Buitrago' THEN 1850 WHEN 'Giulio Ciccone' THEN 1800 ELSE 1400 END, -- profile_climber
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2250 WHEN 'Mathieu van der Poel' THEN 2200 WHEN 'Julian Alaphilippe' THEN 2100 WHEN 'Wout van Aert' THEN 2050 WHEN 'Tom Pidcock' THEN 2050 WHEN 'Remco Evenepoel' THEN 2000 WHEN 'Marc Hirschi' THEN 1950 WHEN 'Benoit Cosnefroy' THEN 1900 WHEN 'Biniam Girmay' THEN 1900 ELSE 1500 END, -- profile_puncheur
    CASE r.name
        WHEN 'Wout van Aert' THEN 2100 WHEN 'Mathieu van der Poel' THEN 2050 WHEN 'Stefan Küng' THEN 2000 WHEN 'Filippo Ganna' THEN 2050 WHEN 'Victor Campenaerts' THEN 1950 WHEN 'Tiesj Benoot' THEN 1900 WHEN 'Matteo Jorgenson' THEN 1900 WHEN 'Christophe Laporte' THEN 1900 WHEN 'Neilson Powless' THEN 1850 WHEN 'Alberto Bettiol' THEN 1850 ELSE 1550 END, -- profile_rouleur
    CASE r.name
        WHEN 'Filippo Ganna' THEN 2400 WHEN 'Remco Evenepoel' THEN 2250 WHEN 'Josh Tarling' THEN 2150 WHEN 'Tadej Pogačar' THEN 2100 WHEN 'Stefan Küng' THEN 2100 WHEN 'Wout van Aert' THEN 2050 WHEN 'Brandon McNulty' THEN 2000 WHEN 'Jonas Vingegaard' THEN 2000 WHEN 'Primož Roglič' THEN 1950 WHEN 'Søren Wærenskjold' THEN 1900 WHEN 'Mattia Cattaneo' THEN 1850 ELSE 1500 END, -- profile_timetrialist
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2350 WHEN 'Jonas Vingegaard' THEN 2300 WHEN 'Primož Roglič' THEN 2150 WHEN 'Remco Evenepoel' THEN 2100 WHEN 'Juan Ayuso' THEN 2000 WHEN 'João Almeida' THEN 1950 WHEN 'Egan Bernal' THEN 1950 WHEN 'Richard Carapaz' THEN 1950 WHEN 'Adam Yates' THEN 1900 WHEN 'Carlos Rodríguez' THEN 1900 WHEN 'Enric Mas' THEN 1850 WHEN 'Mikel Landa' THEN 1850 WHEN 'Simon Yates' THEN 1900 ELSE 1400 END, -- profile_gc
    CASE r.name
        WHEN 'Mathieu van der Poel' THEN 2350 WHEN 'Tadej Pogačar' THEN 2200 WHEN 'Wout van Aert' THEN 2150 WHEN 'Julian Alaphilippe' THEN 2050 WHEN 'Tom Pidcock' THEN 2000 WHEN 'Kasper Asgreen' THEN 2000 WHEN 'Mads Pedersen' THEN 1950 WHEN 'Jasper Stuyven' THEN 1900 WHEN 'Matej Mohorič' THEN 1950 WHEN 'Stefan Küng' THEN 1900 WHEN 'Biniam Girmay' THEN 1900 WHEN 'Marc Hirschi' THEN 1850 WHEN 'Benoit Cosnefroy' THEN 1850 WHEN 'Alberto Bettiol' THEN 1900 ELSE 1500 END, -- profile_classics
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 2350 WHEN 'Mathieu van der Poel' THEN 2150 WHEN 'Wout van Aert' THEN 2100 WHEN 'Remco Evenepoel' THEN 2050 WHEN 'Primož Roglič' THEN 1950 WHEN 'Jonas Vingegaard' THEN 1950 WHEN 'Tom Pidcock' THEN 1950 ELSE 1550 END, -- profile_allrounder

    -- Stats (approximate 2024 season)
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 52 WHEN 'Jonas Vingegaard' THEN 28 WHEN 'Mathieu van der Poel' THEN 55 WHEN 'Wout van Aert' THEN 48 WHEN 'Remco Evenepoel' THEN 45 WHEN 'Jasper Philipsen' THEN 62 WHEN 'Jonathan Milan' THEN 58 ELSE 45 END, -- races_count
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 25 WHEN 'Jonas Vingegaard' THEN 4 WHEN 'Mathieu van der Poel' THEN 8 WHEN 'Wout van Aert' THEN 6 WHEN 'Remco Evenepoel' THEN 10 WHEN 'Jasper Philipsen' THEN 14 WHEN 'Jonathan Milan' THEN 9 WHEN 'Tim Merlier' THEN 8 WHEN 'Biniam Girmay' THEN 6 WHEN 'Mark Cavendish' THEN 5 ELSE 2 END, -- wins_count
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 38 WHEN 'Jonas Vingegaard' THEN 8 WHEN 'Mathieu van der Poel' THEN 15 WHEN 'Wout van Aert' THEN 12 WHEN 'Remco Evenepoel' THEN 18 WHEN 'Jasper Philipsen' THEN 25 WHEN 'Jonathan Milan' THEN 18 ELSE 5 END, -- podiums_count
    CASE r.name
        WHEN 'Tadej Pogačar' THEN 0.95 WHEN 'Jonas Vingegaard' THEN 0.90 WHEN 'Mathieu van der Poel' THEN 0.92 WHEN 'Wout van Aert' THEN 0.90 WHEN 'Remco Evenepoel' THEN 0.88 WHEN 'Jasper Philipsen' THEN 0.90 ELSE 0.70 END -- rating_confidence
FROM riders r
WHERE r.name IN (
    'Tadej Pogačar', 'Jonas Vingegaard', 'Remco Evenepoel', 'Primož Roglič', 'Juan Ayuso',
    'Egan Bernal', 'Carlos Rodríguez', 'João Almeida', 'Enric Mas', 'Adam Yates',
    'Richard Carapaz', 'Mikel Landa', 'Simon Yates', 'Ben Healy', 'Felix Gall',
    'Santiago Buitrago', 'Giulio Ciccone',
    'Mathieu van der Poel', 'Wout van Aert', 'Julian Alaphilippe', 'Tom Pidcock',
    'Kasper Asgreen', 'Matej Mohorič', 'Mads Pedersen', 'Jasper Stuyven', 'Stefan Küng',
    'Christophe Laporte', 'Benoit Cosnefroy', 'Marc Hirschi', 'Biniam Girmay',
    'Jasper Philipsen', 'Jonathan Milan', 'Tim Merlier', 'Fabio Jakobsen', 'Arnaud De Lie',
    'Dylan Groenewegen', 'Phil Bauhaus', 'Olav Kooij', 'Sam Bennett', 'Mark Cavendish',
    'Filippo Ganna', 'Josh Tarling', 'Søren Wærenskjold', 'Brandon McNulty', 'Mattia Cattaneo',
    'Neilson Powless', 'Alberto Bettiol', 'Matteo Jorgenson', 'Victor Campenaerts', 'Tiesj Benoot'
);

-- ============================================================================
-- SAMPLE RACES (2024 Season with realistic characteristics)
-- ============================================================================

INSERT INTO races (name, name_short, category, terrain, typical_finish, date, season, country, country_code, is_stage_race, distance_km, elevation_gain_m, profile_score, profile_score_final) VALUES
-- Monuments
('Milan-San Remo 2024', 'MSR', 'Monument', 'rolling', 'reduced_sprint', '2024-03-16', 2024, 'Italy', 'ITA', false, 293, 2100, 85, 95),
('Tour of Flanders 2024', 'RVV', 'Monument', 'hilly', 'small_group', '2024-03-31', 2024, 'Belgium', 'BEL', false, 270, 1800, 140, 120),
('Paris-Roubaix 2024', 'PR', 'Monument', 'cobbles', 'small_group', '2024-04-07', 2024, 'France', 'FRA', false, 260, 400, 50, 30),
('Liège-Bastogne-Liège 2024', 'LBL', 'Monument', 'hilly', 'small_group', '2024-04-21', 2024, 'Belgium', 'BEL', false, 259, 4500, 180, 140),
('Il Lombardia 2024', 'ILO', 'Monument', 'mountain', 'small_group', '2024-10-12', 2024, 'Italy', 'ITA', false, 252, 4100, 200, 150),

-- Other Classics
('Strade Bianche 2024', 'STB', 'WT', 'hilly', 'small_group', '2024-03-02', 2024, 'Italy', 'ITA', false, 215, 2600, 140, 130),
('E3 Saxo Classic 2024', 'E3', 'WT', 'hilly', 'small_group', '2024-03-22', 2024, 'Belgium', 'BEL', false, 207, 1200, 100, 90),
('Gent-Wevelgem 2024', 'GW', 'WT', 'flat_technical', 'bunch_sprint', '2024-03-24', 2024, 'Belgium', 'BEL', false, 262, 600, 60, 40),
('Amstel Gold Race 2024', 'AGR', 'WT', 'hilly', 'small_group', '2024-04-14', 2024, 'Netherlands', 'NED', false, 254, 3000, 140, 110),
('La Flèche Wallonne 2024', 'FW', 'WT', 'hilly', 'summit_finish', '2024-04-17', 2024, 'Belgium', 'BEL', false, 196, 2300, 150, 200),
('San Sebastian 2024', 'SS', 'WT', 'hilly', 'small_group', '2024-08-03', 2024, 'Spain', 'ESP', false, 226, 4000, 160, 100),

-- Grand Tour Stages (Sample)
('Tour de France 2024 - Stage 1', 'TDF S1', 'GT', 'flat', 'bunch_sprint', '2024-06-29', 2024, 'Italy', 'ITA', true, 206, 300, 20, 10),
('Tour de France 2024 - Stage 4', 'TDF S4', 'GT', 'mountain_summit', 'summit_finish', '2024-07-02', 2024, 'Italy', 'ITA', true, 139, 3700, 240, 180),
('Tour de France 2024 - Stage 7 ITT', 'TDF S7', 'GT', 'time_trial_flat', 'time_trial', '2024-07-05', 2024, 'France', 'FRA', true, 25, 100, 10, 10),
('Tour de France 2024 - Stage 14', 'TDF S14', 'GT', 'mountain', 'small_group', '2024-07-13', 2024, 'France', 'FRA', true, 152, 4200, 220, 100),
('Tour de France 2024 - Stage 15', 'TDF S15', 'GT', 'mountain_summit', 'summit_finish', '2024-07-14', 2024, 'France', 'FRA', true, 198, 4600, 260, 200),
('Tour de France 2024 - Stage 19', 'TDF S19', 'GT', 'mountain_summit', 'summit_finish', '2024-07-19', 2024, 'France', 'FRA', true, 144, 4500, 280, 220),
('Tour de France 2024 - Stage 21', 'TDF S21', 'GT', 'flat', 'bunch_sprint', '2024-07-21', 2024, 'France', 'FRA', true, 122, 100, 10, 5),

-- World Championships
('World Championships RR 2024', 'WC RR', 'WC', 'hilly', 'small_group', '2024-09-29', 2024, 'Switzerland', 'SUI', false, 273, 4400, 180, 140),
('World Championships ITT 2024', 'WC ITT', 'WC', 'time_trial_hilly', 'time_trial', '2024-09-22', 2024, 'Switzerland', 'SUI', false, 46, 800, 40, 40);

-- ============================================================================
-- RACE CHARACTERISTICS (Weight factors for sample races)
-- ============================================================================

INSERT INTO race_characteristics (
    race_id,
    -- Power weights
    w_power_sprint_5s, w_power_anaerobic_1m, w_power_vo2max_5m, w_power_threshold_20m, w_power_ftp_60m, w_power_endurance_2h,
    -- Terrain weights
    w_terrain_flat, w_terrain_rolling, w_terrain_punch_climbs, w_terrain_medium_climbs, w_terrain_long_climbs, w_terrain_altitude, w_terrain_cobbles, w_terrain_gravel, w_terrain_descending, w_terrain_crosswinds,
    -- Race type weights
    w_race_sprint_finish, w_race_breakaway, w_race_itt_flat, w_race_itt_mountain, w_race_gc, w_race_oneday, w_race_stagerace,
    -- Tactical weights
    w_tactical_positioning, w_tactical_race_iq, w_tactical_attacking,
    -- Physical weights
    w_physical_acceleration, w_physical_topspeed, w_physical_aero, w_physical_recovery, w_physical_handling,
    -- Weather weights
    w_weather_heat, w_weather_cold, w_weather_rain, w_weather_wind,
    -- Course details
    cobbles_km, cobbles_sectors, gravel_km, climbs_count, climbs_hc_count, climbs_cat1_count,
    importance_multiplier
)
SELECT
    r.id,
    -- Paris-Roubaix characteristics
    CASE r.name_short
        WHEN 'PR' THEN 0.6 WHEN 'MSR' THEN 0.8 WHEN 'RVV' THEN 0.7 WHEN 'LBL' THEN 0.4 WHEN 'ILO' THEN 0.5 WHEN 'STB' THEN 0.6 WHEN 'FW' THEN 0.3 WHEN 'WC RR' THEN 0.5 ELSE 0.5 END, -- w_power_sprint_5s
    CASE r.name_short
        WHEN 'PR' THEN 0.7 WHEN 'MSR' THEN 0.6 WHEN 'RVV' THEN 0.8 WHEN 'LBL' THEN 0.7 WHEN 'ILO' THEN 0.6 WHEN 'STB' THEN 0.7 WHEN 'FW' THEN 0.6 WHEN 'WC RR' THEN 0.7 ELSE 0.5 END, -- w_power_anaerobic_1m
    CASE r.name_short
        WHEN 'PR' THEN 0.4 WHEN 'MSR' THEN 0.5 WHEN 'RVV' THEN 0.7 WHEN 'LBL' THEN 0.9 WHEN 'ILO' THEN 0.9 WHEN 'STB' THEN 0.7 WHEN 'FW' THEN 0.9 WHEN 'WC RR' THEN 0.8 WHEN 'TDF S4' THEN 0.95 WHEN 'TDF S15' THEN 0.95 WHEN 'TDF S19' THEN 0.95 ELSE 0.5 END, -- w_power_vo2max_5m
    CASE r.name_short
        WHEN 'PR' THEN 0.7 WHEN 'MSR' THEN 0.7 WHEN 'RVV' THEN 0.6 WHEN 'LBL' THEN 0.8 WHEN 'ILO' THEN 0.8 WHEN 'WC ITT' THEN 0.9 WHEN 'TDF S7' THEN 0.95 ELSE 0.6 END, -- w_power_threshold_20m
    CASE r.name_short
        WHEN 'TDF S7' THEN 0.95 WHEN 'WC ITT' THEN 0.9 ELSE 0.5 END, -- w_power_ftp_60m
    CASE r.name_short
        WHEN 'PR' THEN 0.8 WHEN 'MSR' THEN 0.9 WHEN 'RVV' THEN 0.7 WHEN 'LBL' THEN 0.8 WHEN 'ILO' THEN 0.8 WHEN 'TDF S15' THEN 0.9 WHEN 'TDF S19' THEN 0.9 ELSE 0.6 END, -- w_power_endurance_2h

    -- Terrain weights
    CASE r.name_short WHEN 'TDF S1' THEN 0.9 WHEN 'TDF S21' THEN 0.95 WHEN 'GW' THEN 0.8 WHEN 'MSR' THEN 0.6 WHEN 'TDF S7' THEN 0.7 ELSE 0.3 END, -- w_terrain_flat
    CASE r.name_short WHEN 'MSR' THEN 0.7 WHEN 'AGR' THEN 0.8 WHEN 'E3' THEN 0.7 WHEN 'WC RR' THEN 0.6 ELSE 0.4 END, -- w_terrain_rolling
    CASE r.name_short WHEN 'RVV' THEN 0.9 WHEN 'LBL' THEN 0.8 WHEN 'FW' THEN 0.95 WHEN 'AGR' THEN 0.9 WHEN 'STB' THEN 0.8 WHEN 'E3' THEN 0.8 WHEN 'WC RR' THEN 0.7 ELSE 0.3 END, -- w_terrain_punch_climbs
    CASE r.name_short WHEN 'LBL' THEN 0.7 WHEN 'ILO' THEN 0.8 WHEN 'TDF S4' THEN 0.9 WHEN 'TDF S14' THEN 0.8 WHEN 'TDF S15' THEN 0.9 WHEN 'TDF S19' THEN 0.95 ELSE 0.2 END, -- w_terrain_medium_climbs
    CASE r.name_short WHEN 'TDF S4' THEN 0.9 WHEN 'TDF S15' THEN 0.95 WHEN 'TDF S19' THEN 0.95 WHEN 'ILO' THEN 0.7 ELSE 0.1 END, -- w_terrain_long_climbs
    CASE r.name_short WHEN 'TDF S15' THEN 0.7 WHEN 'TDF S19' THEN 0.8 WHEN 'TDF S4' THEN 0.6 ELSE 0.2 END, -- w_terrain_altitude
    CASE r.name_short WHEN 'PR' THEN 1.0 WHEN 'RVV' THEN 0.7 WHEN 'E3' THEN 0.6 WHEN 'GW' THEN 0.3 ELSE 0.0 END, -- w_terrain_cobbles
    CASE r.name_short WHEN 'STB' THEN 0.9 ELSE 0.0 END, -- w_terrain_gravel
    CASE r.name_short WHEN 'ILO' THEN 0.8 WHEN 'MSR' THEN 0.6 WHEN 'STB' THEN 0.7 WHEN 'TDF S4' THEN 0.5 ELSE 0.4 END, -- w_terrain_descending
    CASE r.name_short WHEN 'PR' THEN 0.6 WHEN 'GW' THEN 0.7 ELSE 0.3 END, -- w_terrain_crosswinds

    -- Race type weights
    CASE r.name_short WHEN 'TDF S1' THEN 0.95 WHEN 'TDF S21' THEN 0.95 WHEN 'GW' THEN 0.7 WHEN 'MSR' THEN 0.6 ELSE 0.2 END, -- w_race_sprint_finish
    CASE r.name_short WHEN 'PR' THEN 0.5 WHEN 'STB' THEN 0.6 WHEN 'TDF S14' THEN 0.5 ELSE 0.4 END, -- w_race_breakaway
    CASE r.name_short WHEN 'TDF S7' THEN 0.95 WHEN 'WC ITT' THEN 0.9 ELSE 0.0 END, -- w_race_itt_flat
    CASE r.name_short WHEN 'WC ITT' THEN 0.3 ELSE 0.0 END, -- w_race_itt_mountain
    CASE r.name_short WHEN 'TDF S4' THEN 0.8 WHEN 'TDF S14' THEN 0.9 WHEN 'TDF S15' THEN 0.95 WHEN 'TDF S19' THEN 0.95 ELSE 0.0 END, -- w_race_gc
    CASE r.name_short WHEN 'PR' THEN 1.0 WHEN 'MSR' THEN 1.0 WHEN 'RVV' THEN 1.0 WHEN 'LBL' THEN 1.0 WHEN 'ILO' THEN 1.0 WHEN 'STB' THEN 1.0 WHEN 'FW' THEN 1.0 WHEN 'AGR' THEN 1.0 WHEN 'WC RR' THEN 1.0 ELSE 0.0 END, -- w_race_oneday
    CASE r.name_short WHEN 'TDF S1' THEN 0.8 WHEN 'TDF S4' THEN 0.8 WHEN 'TDF S7' THEN 0.8 WHEN 'TDF S14' THEN 0.8 WHEN 'TDF S15' THEN 0.8 WHEN 'TDF S19' THEN 0.8 WHEN 'TDF S21' THEN 0.8 ELSE 0.0 END, -- w_race_stagerace

    -- Tactical weights
    CASE r.name_short WHEN 'PR' THEN 0.9 WHEN 'RVV' THEN 0.85 WHEN 'MSR' THEN 0.8 WHEN 'TDF S1' THEN 0.85 ELSE 0.7 END, -- w_tactical_positioning
    CASE r.name_short WHEN 'PR' THEN 0.8 WHEN 'RVV' THEN 0.85 WHEN 'LBL' THEN 0.8 WHEN 'WC RR' THEN 0.9 ELSE 0.7 END, -- w_tactical_race_iq
    CASE r.name_short WHEN 'LBL' THEN 0.9 WHEN 'ILO' THEN 0.85 WHEN 'FW' THEN 0.8 WHEN 'STB' THEN 0.85 WHEN 'TDF S4' THEN 0.8 WHEN 'TDF S15' THEN 0.85 WHEN 'TDF S19' THEN 0.9 ELSE 0.5 END, -- w_tactical_attacking

    -- Physical weights
    CASE r.name_short WHEN 'RVV' THEN 0.9 WHEN 'LBL' THEN 0.85 WHEN 'FW' THEN 0.95 WHEN 'MSR' THEN 0.8 ELSE 0.6 END, -- w_physical_acceleration
    CASE r.name_short WHEN 'TDF S1' THEN 0.95 WHEN 'TDF S21' THEN 0.95 WHEN 'MSR' THEN 0.85 WHEN 'GW' THEN 0.9 ELSE 0.5 END, -- w_physical_topspeed
    CASE r.name_short WHEN 'TDF S7' THEN 0.95 WHEN 'WC ITT' THEN 0.95 WHEN 'PR' THEN 0.6 ELSE 0.4 END, -- w_physical_aero
    CASE r.name_short WHEN 'TDF S15' THEN 0.8 WHEN 'TDF S19' THEN 0.85 ELSE 0.5 END, -- w_physical_recovery
    CASE r.name_short WHEN 'PR' THEN 0.95 WHEN 'STB' THEN 0.9 WHEN 'RVV' THEN 0.85 WHEN 'ILO' THEN 0.8 ELSE 0.6 END, -- w_physical_handling

    -- Weather (assume typical conditions)
    0.3, 0.3, 0.3, -- weather defaults
    CASE r.name_short WHEN 'PR' THEN 0.5 WHEN 'GW' THEN 0.6 ELSE 0.3 END, -- w_weather_wind

    -- Course details
    CASE r.name_short WHEN 'PR' THEN 54.5 WHEN 'RVV' THEN 18 WHEN 'E3' THEN 12 WHEN 'GW' THEN 8 ELSE 0 END, -- cobbles_km
    CASE r.name_short WHEN 'PR' THEN 30 WHEN 'RVV' THEN 17 WHEN 'E3' THEN 8 WHEN 'GW' THEN 5 ELSE 0 END, -- cobbles_sectors
    CASE r.name_short WHEN 'STB' THEN 63 ELSE 0 END, -- gravel_km
    CASE r.name_short WHEN 'LBL' THEN 11 WHEN 'ILO' THEN 6 WHEN 'TDF S4' THEN 4 WHEN 'TDF S15' THEN 5 WHEN 'TDF S19' THEN 5 WHEN 'RVV' THEN 18 WHEN 'AGR' THEN 35 ELSE 0 END, -- climbs_count
    CASE r.name_short WHEN 'TDF S15' THEN 2 WHEN 'TDF S19' THEN 2 WHEN 'TDF S4' THEN 1 ELSE 0 END, -- climbs_hc_count
    CASE r.name_short WHEN 'LBL' THEN 3 WHEN 'ILO' THEN 2 WHEN 'TDF S14' THEN 2 WHEN 'TDF S15' THEN 2 WHEN 'TDF S19' THEN 2 ELSE 0 END, -- climbs_cat1_count

    -- Importance multiplier
    CASE r.category
        WHEN 'GT' THEN 2.0
        WHEN 'Monument' THEN 1.8
        WHEN 'WC' THEN 1.7
        WHEN 'WT' THEN 1.3
        ELSE 1.0
    END
FROM races r;
