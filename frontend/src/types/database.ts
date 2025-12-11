export type RaceCategory = 'GT' | 'Monument' | 'WC' | 'WT' | 'ProSeries' | 'Others'

export interface Rider {
  id: number
  pcs_id: string | null
  name: string
  country: string | null
  team: string | null
  birth_date: string | null
  created_at: string
  updated_at: string
}

export interface RiderRating {
  id: number
  rider_id: number
  flat: number
  cobbles: number
  mountain: number
  time_trial: number
  sprint: number
  gc: number
  one_day: number
  endurance: number
  overall: number
  races_count: number
  wins_count: number
  podiums_count: number
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
  flat_weight: number
  cobbles_weight: number
  mountain_weight: number
  time_trial_weight: number
  sprint_weight: number
  gc_weight: number
  one_day_weight: number
  endurance_weight: number
  distance_km: number | null
  elevation_gain_m: number | null
  avg_gradient: number | null
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

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      riders: {
        Row: Rider
        Insert: Omit<Rider, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Rider, 'id'>>
      }
      rider_ratings: {
        Row: RiderRating
        Insert: Omit<RiderRating, 'id' | 'updated_at'>
        Update: Partial<Omit<RiderRating, 'id'>>
      }
      races: {
        Row: Race
        Insert: Omit<Race, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Race, 'id'>>
      }
      race_characteristics: {
        Row: RaceCharacteristics
        Insert: Omit<RaceCharacteristics, 'id'>
        Update: Partial<Omit<RaceCharacteristics, 'id'>>
      }
      race_results: {
        Row: RaceResult
        Insert: Omit<RaceResult, 'id' | 'created_at'>
        Update: Partial<Omit<RaceResult, 'id'>>
      }
      rating_history: {
        Row: RatingHistory
        Insert: Omit<RatingHistory, 'id'>
        Update: Partial<Omit<RatingHistory, 'id'>>
      }
    }
  }
}
