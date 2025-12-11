-- Sample data for Cycling Rating System
-- This creates initial riders, races, and results for demo purposes

-- Insert sample riders
INSERT INTO riders (name, team, country) VALUES
('Tadej Pogacar', 'UAE Team Emirates', 'Slovenia'),
('Jonas Vingegaard', 'Visma-Lease a Bike', 'Denmark'),
('Primoz Roglic', 'Red Bull-BORA-hansgrohe', 'Slovenia'),
('Remco Evenepoel', 'Soudal Quick-Step', 'Belgium'),
('Mathieu van der Poel', 'Alpecin-Deceuninck', 'Netherlands'),
('Wout van Aert', 'Visma-Lease a Bike', 'Belgium'),
('Tom Pidcock', 'INEOS Grenadiers', 'Great Britain'),
('Filippo Ganna', 'INEOS Grenadiers', 'Italy'),
('Jasper Philipsen', 'Alpecin-Deceuninck', 'Belgium'),
('Mads Pedersen', 'Lidl-Trek', 'Denmark'),
('Egan Bernal', 'INEOS Grenadiers', 'Colombia'),
('Richard Carapaz', 'EF Education-EasyPost', 'Ecuador'),
('Sepp Kuss', 'Visma-Lease a Bike', 'USA'),
('Juan Ayuso', 'UAE Team Emirates', 'Spain'),
('Adam Yates', 'UAE Team Emirates', 'Great Britain')
ON CONFLICT DO NOTHING;

-- Initialize ratings for all riders
INSERT INTO rider_ratings (rider_id, flat, cobbles, mountain, time_trial, sprint, gc, one_day, endurance, overall)
SELECT
    id,
    1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500
FROM riders
ON CONFLICT (rider_id) DO NOTHING;

-- Insert sample races
INSERT INTO races (name, category, date, season, country) VALUES
('Tour de France Stage 15', 'GT', '2024-07-14', 2024, 'France'),
('Paris-Roubaix', 'Monument', '2024-04-07', 2024, 'France'),
('World Championship ITT', 'WC', '2024-09-22', 2024, 'Switzerland'),
('Milano-Sanremo', 'Monument', '2024-03-16', 2024, 'Italy')
ON CONFLICT DO NOTHING;

-- Insert race characteristics
INSERT INTO race_characteristics (race_id, flat_weight, cobbles_weight, mountain_weight, time_trial_weight, sprint_weight, gc_weight, one_day_weight, endurance_weight)
SELECT id, 0.2, 0.0, 1.0, 0.0, 0.1, 0.8, 0.0, 0.9
FROM races WHERE name = 'Tour de France Stage 15'
ON CONFLICT (race_id) DO NOTHING;

INSERT INTO race_characteristics (race_id, flat_weight, cobbles_weight, mountain_weight, time_trial_weight, sprint_weight, gc_weight, one_day_weight, endurance_weight)
SELECT id, 0.6, 1.0, 0.0, 0.0, 0.3, 0.0, 1.0, 0.8
FROM races WHERE name = 'Paris-Roubaix'
ON CONFLICT (race_id) DO NOTHING;

INSERT INTO race_characteristics (race_id, flat_weight, cobbles_weight, mountain_weight, time_trial_weight, sprint_weight, gc_weight, one_day_weight, endurance_weight)
SELECT id, 0.5, 0.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.6
FROM races WHERE name = 'World Championship ITT'
ON CONFLICT (race_id) DO NOTHING;

INSERT INTO race_characteristics (race_id, flat_weight, cobbles_weight, mountain_weight, time_trial_weight, sprint_weight, gc_weight, one_day_weight, endurance_weight)
SELECT id, 0.7, 0.0, 0.2, 0.0, 0.8, 0.0, 1.0, 0.9
FROM races WHERE name = 'Milano-Sanremo'
ON CONFLICT (race_id) DO NOTHING;

-- Insert sample race results
-- Tour de France Stage 15 (Mountain)
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 1 FROM races r, riders ri WHERE r.name = 'Tour de France Stage 15' AND ri.name = 'Tadej Pogacar'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 2 FROM races r, riders ri WHERE r.name = 'Tour de France Stage 15' AND ri.name = 'Jonas Vingegaard'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 3 FROM races r, riders ri WHERE r.name = 'Tour de France Stage 15' AND ri.name = 'Primoz Roglic'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 4 FROM races r, riders ri WHERE r.name = 'Tour de France Stage 15' AND ri.name = 'Remco Evenepoel'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 5 FROM races r, riders ri WHERE r.name = 'Tour de France Stage 15' AND ri.name = 'Egan Bernal'
ON CONFLICT DO NOTHING;

-- Paris-Roubaix (Cobbles)
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 1 FROM races r, riders ri WHERE r.name = 'Paris-Roubaix' AND ri.name = 'Mathieu van der Poel'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 2 FROM races r, riders ri WHERE r.name = 'Paris-Roubaix' AND ri.name = 'Wout van Aert'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 3 FROM races r, riders ri WHERE r.name = 'Paris-Roubaix' AND ri.name = 'Tom Pidcock'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 4 FROM races r, riders ri WHERE r.name = 'Paris-Roubaix' AND ri.name = 'Mads Pedersen'
ON CONFLICT DO NOTHING;

-- World Championship ITT
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 1 FROM races r, riders ri WHERE r.name = 'World Championship ITT' AND ri.name = 'Filippo Ganna'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 2 FROM races r, riders ri WHERE r.name = 'World Championship ITT' AND ri.name = 'Remco Evenepoel'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 3 FROM races r, riders ri WHERE r.name = 'World Championship ITT' AND ri.name = 'Tadej Pogacar'
ON CONFLICT DO NOTHING;

-- Milano-Sanremo (Sprint)
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 1 FROM races r, riders ri WHERE r.name = 'Milano-Sanremo' AND ri.name = 'Jasper Philipsen'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 2 FROM races r, riders ri WHERE r.name = 'Milano-Sanremo' AND ri.name = 'Wout van Aert'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 3 FROM races r, riders ri WHERE r.name = 'Milano-Sanremo' AND ri.name = 'Mathieu van der Poel'
ON CONFLICT DO NOTHING;
INSERT INTO race_results (race_id, rider_id, position)
SELECT r.id, ri.id, 4 FROM races r, riders ri WHERE r.name = 'Milano-Sanremo' AND ri.name = 'Mads Pedersen'
ON CONFLICT DO NOTHING;
