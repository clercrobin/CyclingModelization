export type RaceCategory = 'GT' | 'Monument' | 'WC' | 'WT' | 'ProSeries' | 'Others'

export interface Rider {
  id: number
  pcs_id: string | null
  name: string
  first_name: string | null
  last_name: string | null
  country: string | null
  country_code: string | null
  team: string | null
  birth_date: string | null
  weight_kg: number | null
  height_cm: number | null
  created_at: string
  updated_at: string
}

export interface RiderRating {
  id: number
  rider_id: number
  // Power Profile (6)
  power_sprint_5s: number
  power_anaerobic_1m: number
  power_vo2max_5m: number
  power_threshold_20m: number
  power_ftp_60m: number
  power_endurance_2h: number
  // Terrain (10)
  terrain_flat: number
  terrain_rolling: number
  terrain_punch_climbs: number
  terrain_medium_climbs: number
  terrain_long_climbs: number
  terrain_altitude: number
  terrain_cobbles: number
  terrain_gravel: number
  terrain_descending: number
  terrain_crosswinds: number
  // Race Type (11)
  race_sprint_finish: number
  race_leadout: number
  race_breakaway: number
  race_itt_flat: number
  race_itt_mountain: number
  race_ttt: number
  race_prologue: number
  race_gc: number
  race_oneday: number
  race_stagerace: number
  race_grandtour: number
  // Classics (5)
  classics_cobbled: number
  classics_ardennes: number
  classics_italian: number
  classics_spring: number
  classics_autumn: number
  // Tactical (6)
  tactical_positioning: number
  tactical_race_iq: number
  tactical_attacking: number
  tactical_defensive: number
  tactical_leadership: number
  tactical_domestique: number
  // Physical (7)
  physical_acceleration: number
  physical_topspeed: number
  physical_aero: number
  physical_recovery: number
  physical_fatigue_resist: number
  physical_handling: number
  physical_peloton_skills: number
  // Weather (4)
  weather_heat: number
  weather_cold: number
  weather_rain: number
  weather_wind: number
  // Consistency (4)
  consistency_daily: number
  consistency_seasonal: number
  consistency_clutch: number
  consistency_reliability: number
  // Profile Scores (8)
  profile_sprinter: number
  profile_climber: number
  profile_puncheur: number
  profile_rouleur: number
  profile_timetrialist: number
  profile_gc: number
  profile_classics: number
  profile_allrounder: number
  // Aggregate
  overall: number
  // Stats
  races_count: number
  wins_count: number
  podiums_count: number
  top10_count: number
  dnf_count: number
  season_races: number
  season_wins: number
  season_points: number
  last_race_date: string | null
  last_win_date: string | null
  rating_confidence: number
  updated_at: string
}

export interface Race {
  id: number
  pcs_id: string | null
  name: string
  category: RaceCategory
  date: string
  season: number
  country: string | null
  is_stage_race: boolean
  stage_number: number | null
  parent_race_id: number | null
  created_at: string
  updated_at: string
}

export interface RaceCharacteristics {
  id: number
  race_id: number
  // Race profile weights (same dimensions as rider ratings)
  power_sprint_5s_weight: number
  power_anaerobic_1m_weight: number
  power_vo2max_5m_weight: number
  power_threshold_20m_weight: number
  power_ftp_60m_weight: number
  power_endurance_2h_weight: number
  terrain_flat_weight: number
  terrain_rolling_weight: number
  terrain_punch_climbs_weight: number
  terrain_medium_climbs_weight: number
  terrain_long_climbs_weight: number
  terrain_altitude_weight: number
  terrain_cobbles_weight: number
  terrain_gravel_weight: number
  terrain_descending_weight: number
  terrain_crosswinds_weight: number
  race_sprint_finish_weight: number
  race_breakaway_weight: number
  tactical_positioning_weight: number
  tactical_race_iq_weight: number
  physical_recovery_weight: number
  physical_fatigue_resist_weight: number
  weather_heat_weight: number
  weather_cold_weight: number
  weather_rain_weight: number
  weather_wind_weight: number
  // Race metadata
  distance_km: number | null
  elevation_gain_m: number | null
  avg_gradient: number | null
  max_gradient: number | null
  num_climbs: number | null
  cobbles_km: number | null
  expected_time_hours: number | null
  race_terrain: string | null
  finish_type: string | null
}

export interface RaceResult {
  id: number
  race_id: number
  rider_id: number
  position: number
  time_seconds: number | null
  time_behind_seconds: number | null
  points: number
  did_not_finish: boolean
  did_not_start: boolean
  created_at: string
}

export interface RatingHistory {
  id: number
  rider_id: number
  race_id: number | null
  date: string
  ratings: Record<string, number>
  change_reason: string | null
}

// Combined types for queries
export interface RiderWithRating extends Rider {
  rider_ratings: RiderRating | null
}

export interface RaceWithDetails extends Race {
  race_characteristics: RaceCharacteristics | null
  race_results: RaceResult[]
}

// Rating dimension categories for UI
export const RATING_CATEGORIES = {
  profile: {
    label: 'Profile Scores',
    dimensions: [
      { key: 'profile_sprinter', label: 'Sprinter' },
      { key: 'profile_climber', label: 'Climber' },
      { key: 'profile_puncheur', label: 'Puncheur' },
      { key: 'profile_rouleur', label: 'Rouleur' },
      { key: 'profile_timetrialist', label: 'Time Trialist' },
      { key: 'profile_gc', label: 'GC' },
      { key: 'profile_classics', label: 'Classics' },
      { key: 'profile_allrounder', label: 'All-Rounder' }
    ]
  },
  power: {
    label: 'Power Profile',
    dimensions: [
      { key: 'power_sprint_5s', label: '5s Sprint' },
      { key: 'power_anaerobic_1m', label: '1min Anaerobic' },
      { key: 'power_vo2max_5m', label: '5min VO2max' },
      { key: 'power_threshold_20m', label: '20min Threshold' },
      { key: 'power_ftp_60m', label: '60min FTP' },
      { key: 'power_endurance_2h', label: '2h Endurance' }
    ]
  },
  terrain: {
    label: 'Terrain',
    dimensions: [
      { key: 'terrain_flat', label: 'Flat' },
      { key: 'terrain_rolling', label: 'Rolling' },
      { key: 'terrain_punch_climbs', label: 'Punch Climbs' },
      { key: 'terrain_medium_climbs', label: 'Medium Climbs' },
      { key: 'terrain_long_climbs', label: 'Long Climbs' },
      { key: 'terrain_altitude', label: 'Altitude' },
      { key: 'terrain_cobbles', label: 'Cobbles' },
      { key: 'terrain_gravel', label: 'Gravel' },
      { key: 'terrain_descending', label: 'Descending' },
      { key: 'terrain_crosswinds', label: 'Crosswinds' }
    ]
  },
  raceType: {
    label: 'Race Type',
    dimensions: [
      { key: 'race_sprint_finish', label: 'Sprint Finish' },
      { key: 'race_leadout', label: 'Leadout' },
      { key: 'race_breakaway', label: 'Breakaway' },
      { key: 'race_itt_flat', label: 'ITT Flat' },
      { key: 'race_itt_mountain', label: 'ITT Mountain' },
      { key: 'race_ttt', label: 'TTT' },
      { key: 'race_prologue', label: 'Prologue' },
      { key: 'race_gc', label: 'GC' },
      { key: 'race_oneday', label: 'One Day' },
      { key: 'race_stagerace', label: 'Stage Race' },
      { key: 'race_grandtour', label: 'Grand Tour' }
    ]
  },
  classics: {
    label: 'Classics',
    dimensions: [
      { key: 'classics_cobbled', label: 'Cobbled Classics' },
      { key: 'classics_ardennes', label: 'Ardennes' },
      { key: 'classics_italian', label: 'Italian' },
      { key: 'classics_spring', label: 'Spring' },
      { key: 'classics_autumn', label: 'Autumn' }
    ]
  },
  tactical: {
    label: 'Tactical',
    dimensions: [
      { key: 'tactical_positioning', label: 'Positioning' },
      { key: 'tactical_race_iq', label: 'Race IQ' },
      { key: 'tactical_attacking', label: 'Attacking' },
      { key: 'tactical_defensive', label: 'Defensive' },
      { key: 'tactical_leadership', label: 'Leadership' },
      { key: 'tactical_domestique', label: 'Domestique' }
    ]
  },
  physical: {
    label: 'Physical',
    dimensions: [
      { key: 'physical_acceleration', label: 'Acceleration' },
      { key: 'physical_topspeed', label: 'Top Speed' },
      { key: 'physical_aero', label: 'Aero' },
      { key: 'physical_recovery', label: 'Recovery' },
      { key: 'physical_fatigue_resist', label: 'Fatigue Resistance' },
      { key: 'physical_handling', label: 'Handling' },
      { key: 'physical_peloton_skills', label: 'Peloton Skills' }
    ]
  },
  weather: {
    label: 'Weather',
    dimensions: [
      { key: 'weather_heat', label: 'Heat' },
      { key: 'weather_cold', label: 'Cold' },
      { key: 'weather_rain', label: 'Rain' },
      { key: 'weather_wind', label: 'Wind' }
    ]
  },
  consistency: {
    label: 'Consistency',
    dimensions: [
      { key: 'consistency_daily', label: 'Daily' },
      { key: 'consistency_seasonal', label: 'Seasonal' },
      { key: 'consistency_clutch', label: 'Clutch' },
      { key: 'consistency_reliability', label: 'Reliability' }
    ]
  }
} as const

// Flat list of all rating dimensions for rankings
export const ALL_RATING_DIMENSIONS = [
  { key: 'overall', label: 'Overall' },
  ...RATING_CATEGORIES.profile.dimensions,
  ...RATING_CATEGORIES.power.dimensions,
  ...RATING_CATEGORIES.terrain.dimensions,
  ...RATING_CATEGORIES.raceType.dimensions,
  ...RATING_CATEGORIES.classics.dimensions,
  ...RATING_CATEGORIES.tactical.dimensions,
  ...RATING_CATEGORIES.physical.dimensions,
  ...RATING_CATEGORIES.weather.dimensions,
  ...RATING_CATEGORIES.consistency.dimensions
] as const

export type RatingDimensionKey = typeof ALL_RATING_DIMENSIONS[number]['key']
