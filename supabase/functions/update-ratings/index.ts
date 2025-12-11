// Cycling Aladdin: Multi-Dimensional ELO Rating Engine
// Inspired by BlackRock Aladdin's multi-factor risk model
// Processes race results to update 65+ rider dimensions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// =============================================================================
// RATING SYSTEM CONSTANTS
// =============================================================================

const K_BASE = 32  // Base K-factor for ELO updates
const INITIAL_RATING = 1500
const MIN_RATING = 1000
const MAX_RATING = 2800

// Race category importance multipliers
const RACE_IMPORTANCE: Record<string, number> = {
  'GT': 2.5,           // Grand Tours (TDF, Giro, Vuelta)
  'Monument': 2.2,     // 5 Monuments
  'WC': 2.0,           // World Championships
  'Olympics': 2.0,     // Olympic Games
  'WT': 1.5,           // World Tour
  'ProSeries': 1.0,    // UCI ProSeries
  'Continental': 0.7,  // Continental races
  'National': 0.8,     // National Championships
  'U23': 0.5,          // Under-23 races
  'Others': 0.5
}

// Position-based actual score (what you "scored" in the race)
// Using a sigmoid-like curve that rewards top positions heavily
function getActualScore(position: number, totalRiders: number): number {
  if (position === 1) return 1.0
  if (position === 2) return 0.85
  if (position === 3) return 0.75

  // Normalized position (0 = winner, 1 = last)
  const normalizedPos = (position - 1) / (totalRiders - 1)

  // Top 10
  if (position <= 10) {
    return 0.70 - (position - 3) * 0.05  // 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35
  }

  // Top 20
  if (position <= 20) {
    return 0.35 - (position - 10) * 0.02  // down to 0.15
  }

  // Top 50%
  if (normalizedPos <= 0.5) {
    return 0.15 - normalizedPos * 0.1
  }

  // Bottom 50%
  return Math.max(0.01, 0.10 - normalizedPos * 0.1)
}

// ELO expected score calculation
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

// =============================================================================
// ALL 65+ DIMENSION DEFINITIONS
// =============================================================================

// Power dimensions with their weight column names in race_characteristics
const POWER_DIMENSIONS = [
  { key: 'power_sprint_5s', weight: 'w_power_sprint_5s' },
  { key: 'power_anaerobic_1m', weight: 'w_power_anaerobic_1m' },
  { key: 'power_vo2max_5m', weight: 'w_power_vo2max_5m' },
  { key: 'power_threshold_20m', weight: 'w_power_threshold_20m' },
  { key: 'power_ftp_60m', weight: 'w_power_ftp_60m' },
  { key: 'power_endurance_2h', weight: 'w_power_endurance_2h' },
]

const TERRAIN_DIMENSIONS = [
  { key: 'terrain_flat', weight: 'w_terrain_flat' },
  { key: 'terrain_rolling', weight: 'w_terrain_rolling' },
  { key: 'terrain_punch_climbs', weight: 'w_terrain_punch_climbs' },
  { key: 'terrain_medium_climbs', weight: 'w_terrain_medium_climbs' },
  { key: 'terrain_long_climbs', weight: 'w_terrain_long_climbs' },
  { key: 'terrain_altitude', weight: 'w_terrain_altitude' },
  { key: 'terrain_cobbles', weight: 'w_terrain_cobbles' },
  { key: 'terrain_gravel', weight: 'w_terrain_gravel' },
  { key: 'terrain_descending', weight: 'w_terrain_descending' },
  { key: 'terrain_crosswinds', weight: 'w_terrain_crosswinds' },
]

const RACE_TYPE_DIMENSIONS = [
  { key: 'race_sprint_finish', weight: 'w_race_sprint_finish' },
  { key: 'race_breakaway', weight: 'w_race_breakaway' },
  { key: 'race_itt_flat', weight: 'w_race_itt_flat' },
  { key: 'race_itt_mountain', weight: 'w_race_itt_mountain' },
  { key: 'race_gc', weight: 'w_race_gc' },
  { key: 'race_oneday', weight: 'w_race_oneday' },
  { key: 'race_stagerace', weight: 'w_race_stagerace' },
]

const TACTICAL_DIMENSIONS = [
  { key: 'tactical_positioning', weight: 'w_tactical_positioning' },
  { key: 'tactical_race_iq', weight: 'w_tactical_race_iq' },
  { key: 'tactical_attacking', weight: 'w_tactical_attacking' },
]

const PHYSICAL_DIMENSIONS = [
  { key: 'physical_acceleration', weight: 'w_physical_acceleration' },
  { key: 'physical_topspeed', weight: 'w_physical_topspeed' },
  { key: 'physical_aero', weight: 'w_physical_aero' },
  { key: 'physical_recovery', weight: 'w_physical_recovery' },
  { key: 'physical_handling', weight: 'w_physical_handling' },
]

const WEATHER_DIMENSIONS = [
  { key: 'weather_heat', weight: 'w_weather_heat' },
  { key: 'weather_cold', weight: 'w_weather_cold' },
  { key: 'weather_rain', weight: 'w_weather_rain' },
  { key: 'weather_wind', weight: 'w_weather_wind' },
]

// All dimensions combined
const ALL_DIMENSIONS = [
  ...POWER_DIMENSIONS,
  ...TERRAIN_DIMENSIONS,
  ...RACE_TYPE_DIMENSIONS,
  ...TACTICAL_DIMENSIONS,
  ...PHYSICAL_DIMENSIONS,
  ...WEATHER_DIMENSIONS,
]

// Dimensions that don't have race weights but are inferred
const INFERRED_DIMENSIONS = [
  'race_leadout', 'race_ttt', 'race_prologue', 'race_grandtour',
  'classics_cobbled', 'classics_ardennes', 'classics_italian', 'classics_spring', 'classics_autumn',
  'tactical_defensive', 'tactical_leadership', 'tactical_domestique',
  'physical_fatigue_resist', 'physical_peloton_skills',
  'consistency_daily', 'consistency_seasonal', 'consistency_clutch', 'consistency_reliability',
]

// =============================================================================
// PROFILE SCORE CALCULATIONS
// These aggregate dimension scores into rider archetype profiles
// =============================================================================

interface RiderRatings {
  [key: string]: number
}

function calculateProfileScores(ratings: RiderRatings): Record<string, number> {
  // Sprinter profile: sprint power + flat terrain + sprint finish
  const profile_sprinter = Math.round(
    (ratings.power_sprint_5s || 1500) * 0.35 +
    (ratings.terrain_flat || 1500) * 0.20 +
    (ratings.race_sprint_finish || 1500) * 0.25 +
    (ratings.physical_topspeed || 1500) * 0.10 +
    (ratings.physical_acceleration || 1500) * 0.10
  )

  // Climber profile: long climbs + altitude + VO2max + endurance
  const profile_climber = Math.round(
    (ratings.terrain_long_climbs || 1500) * 0.30 +
    (ratings.terrain_altitude || 1500) * 0.15 +
    (ratings.power_vo2max_5m || 1500) * 0.20 +
    (ratings.power_threshold_20m || 1500) * 0.15 +
    (ratings.terrain_medium_climbs || 1500) * 0.20
  )

  // Puncheur profile: punch climbs + anaerobic + attacking
  const profile_puncheur = Math.round(
    (ratings.terrain_punch_climbs || 1500) * 0.30 +
    (ratings.power_anaerobic_1m || 1500) * 0.25 +
    (ratings.tactical_attacking || 1500) * 0.20 +
    (ratings.physical_acceleration || 1500) * 0.15 +
    (ratings.terrain_rolling || 1500) * 0.10
  )

  // Rouleur profile: flat + rolling + threshold power
  const profile_rouleur = Math.round(
    (ratings.terrain_flat || 1500) * 0.25 +
    (ratings.terrain_rolling || 1500) * 0.25 +
    (ratings.power_threshold_20m || 1500) * 0.20 +
    (ratings.power_endurance_2h || 1500) * 0.15 +
    (ratings.terrain_crosswinds || 1500) * 0.15
  )

  // Time trialist profile: TT races + FTP + aero
  const profile_timetrialist = Math.round(
    (ratings.race_itt_flat || 1500) * 0.30 +
    (ratings.race_itt_mountain || 1500) * 0.15 +
    (ratings.power_ftp_60m || 1500) * 0.25 +
    (ratings.power_threshold_20m || 1500) * 0.15 +
    (ratings.physical_aero || 1500) * 0.15
  )

  // GC profile: climbing + TT + consistency + race IQ
  const profile_gc = Math.round(
    (ratings.terrain_long_climbs || 1500) * 0.25 +
    (ratings.race_itt_flat || 1500) * 0.15 +
    (ratings.race_gc || 1500) * 0.20 +
    (ratings.race_grandtour || 1500) * 0.15 +
    (ratings.tactical_race_iq || 1500) * 0.10 +
    (ratings.consistency_daily || 1500) * 0.15
  )

  // Classics profile: cobbles + punch + race IQ + handling
  const profile_classics = Math.round(
    (ratings.terrain_cobbles || 1500) * 0.20 +
    (ratings.terrain_punch_climbs || 1500) * 0.15 +
    (ratings.classics_cobbled || 1500) * 0.15 +
    (ratings.classics_ardennes || 1500) * 0.15 +
    (ratings.tactical_positioning || 1500) * 0.15 +
    (ratings.physical_handling || 1500) * 0.10 +
    (ratings.race_oneday || 1500) * 0.10
  )

  // All-rounder profile: average of multiple capabilities
  const profile_allrounder = Math.round(
    (profile_sprinter + profile_climber + profile_puncheur +
     profile_rouleur + profile_timetrialist + profile_gc + profile_classics) / 7
  )

  return {
    profile_sprinter,
    profile_climber,
    profile_puncheur,
    profile_rouleur,
    profile_timetrialist,
    profile_gc,
    profile_classics,
    profile_allrounder,
  }
}

// Calculate overall rating as weighted average of key dimensions
function calculateOverallRating(ratings: RiderRatings): number {
  const weights: Record<string, number> = {
    // Power dimensions (25%)
    power_sprint_5s: 0.03,
    power_anaerobic_1m: 0.03,
    power_vo2max_5m: 0.05,
    power_threshold_20m: 0.07,
    power_ftp_60m: 0.04,
    power_endurance_2h: 0.03,
    // Terrain dimensions (30%)
    terrain_flat: 0.04,
    terrain_rolling: 0.03,
    terrain_punch_climbs: 0.04,
    terrain_medium_climbs: 0.04,
    terrain_long_climbs: 0.06,
    terrain_altitude: 0.03,
    terrain_cobbles: 0.03,
    terrain_descending: 0.02,
    terrain_crosswinds: 0.01,
    // Race type dimensions (25%)
    race_sprint_finish: 0.04,
    race_breakaway: 0.02,
    race_itt_flat: 0.05,
    race_gc: 0.06,
    race_oneday: 0.04,
    race_stagerace: 0.04,
    // Tactical dimensions (10%)
    tactical_positioning: 0.04,
    tactical_race_iq: 0.04,
    tactical_attacking: 0.02,
    // Consistency (10%)
    consistency_daily: 0.03,
    consistency_seasonal: 0.03,
    consistency_clutch: 0.04,
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const [dim, weight] of Object.entries(weights)) {
    const rating = ratings[dim] || INITIAL_RATING
    weightedSum += rating * weight
    totalWeight += weight
  }

  return Math.round(weightedSum / totalWeight)
}

// =============================================================================
// HEAD-TO-HEAD ELO CALCULATION
// True ELO: compare each rider against all others in the race
// =============================================================================

interface RaceResult {
  rider_id: number
  position: number
  did_not_finish: boolean
  did_not_start: boolean
}

interface RiderRatingRow {
  rider_id: number
  [key: string]: number | null
}

function calculateHeadToHeadUpdates(
  results: RaceResult[],
  ratingsMap: Map<number, RiderRatingRow>,
  characteristics: Record<string, number | null>,
  raceImportance: number
): Map<number, Record<string, number>> {
  const updates = new Map<number, Record<string, number>>()

  // Initialize updates for all riders
  for (const result of results) {
    const currentRatings = ratingsMap.get(result.rider_id)
    const initialRatings: Record<string, number> = {}

    for (const dim of ALL_DIMENSIONS) {
      initialRatings[dim.key] = currentRatings?.[dim.key] ?? INITIAL_RATING
    }
    for (const dim of INFERRED_DIMENSIONS) {
      initialRatings[dim] = currentRatings?.[dim] ?? INITIAL_RATING
    }

    updates.set(result.rider_id, initialRatings)
  }

  // For each dimension, calculate head-to-head ELO changes
  for (const dim of ALL_DIMENSIONS) {
    const weight = characteristics[dim.weight] ?? 0
    if (weight === 0) continue  // Skip dimensions not relevant to this race

    // Compare each pair of riders
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const riderA = results[i]
        const riderB = results[j]

        const ratingsA = ratingsMap.get(riderA.rider_id)
        const ratingsB = ratingsMap.get(riderB.rider_id)

        const ratingA = ratingsA?.[dim.key] ?? INITIAL_RATING
        const ratingB = ratingsB?.[dim.key] ?? INITIAL_RATING

        // Calculate expected scores
        const expectedA = expectedScore(ratingA, ratingB)
        const expectedB = 1 - expectedA

        // Actual scores: higher position (lower number) wins
        const actualA = riderA.position < riderB.position ? 1 : 0
        const actualB = 1 - actualA

        // K-factor adjusted for race importance and dimension weight
        // Reduce K for large fields to prevent massive swings
        const fieldSizeFactor = Math.max(0.3, 1 - results.length / 200)
        const adjustedK = K_BASE * raceImportance * weight * fieldSizeFactor

        // Calculate changes
        const changeA = adjustedK * (actualA - expectedA)
        const changeB = adjustedK * (actualB - expectedB)

        // Apply changes
        const updatesA = updates.get(riderA.rider_id)!
        const updatesB = updates.get(riderB.rider_id)!

        updatesA[dim.key] = Math.max(MIN_RATING, Math.min(MAX_RATING,
          (updatesA[dim.key] || ratingA) + changeA))
        updatesB[dim.key] = Math.max(MIN_RATING, Math.min(MAX_RATING,
          (updatesB[dim.key] || ratingB) + changeB))
      }
    }
  }

  return updates
}

// =============================================================================
// SIMPLIFIED BATCH UPDATE (for large fields)
// When field is > 50 riders, use simplified comparison to average
// =============================================================================

function calculateBatchUpdates(
  results: RaceResult[],
  ratingsMap: Map<number, RiderRatingRow>,
  characteristics: Record<string, number | null>,
  raceImportance: number
): Map<number, Record<string, number>> {
  const updates = new Map<number, Record<string, number>>()
  const totalRiders = results.length

  // Calculate average ratings for each dimension
  const avgRatings: Record<string, number> = {}
  for (const dim of ALL_DIMENSIONS) {
    let sum = 0
    for (const result of results) {
      const ratings = ratingsMap.get(result.rider_id)
      sum += ratings?.[dim.key] ?? INITIAL_RATING
    }
    avgRatings[dim.key] = sum / totalRiders
  }

  // Update each rider based on performance vs expected
  for (const result of results) {
    const currentRatings = ratingsMap.get(result.rider_id)
    const newRatings: Record<string, number> = {}

    for (const dim of ALL_DIMENSIONS) {
      const weight = characteristics[dim.weight] ?? 0
      const currentRating = currentRatings?.[dim.key] ?? INITIAL_RATING

      if (weight > 0) {
        const expected = expectedScore(currentRating, avgRatings[dim.key])
        const actual = getActualScore(result.position, totalRiders)
        const change = Math.round(K_BASE * raceImportance * weight * (actual - expected))
        newRatings[dim.key] = Math.max(MIN_RATING, Math.min(MAX_RATING, currentRating + change))
      } else {
        newRatings[dim.key] = currentRating
      }
    }

    // Copy inferred dimensions (they'll be updated separately)
    for (const dim of INFERRED_DIMENSIONS) {
      newRatings[dim] = currentRatings?.[dim] ?? INITIAL_RATING
    }

    updates.set(result.rider_id, newRatings)
  }

  return updates
}

// =============================================================================
// INFER RACE CHARACTERISTICS FROM RACE METADATA
// When characteristics aren't manually set, infer them from race properties
// =============================================================================

interface Race {
  id: number
  name: string
  category: string
  terrain?: string
  typical_finish?: string
  distance_km?: number
  elevation_gain_m?: number
  is_stage_race?: boolean
}

function inferCharacteristics(race: Race, existingChars: Record<string, number | null> | null): Record<string, number | null> {
  const chars: Record<string, number | null> = existingChars || {}

  // Set defaults if not already set
  const setDefault = (key: string, value: number) => {
    if (chars[key] === null || chars[key] === undefined || chars[key] === 0) {
      chars[key] = value
    }
  }

  // Infer from terrain type
  const terrain = race.terrain?.toLowerCase() || ''
  if (terrain.includes('flat')) {
    setDefault('w_terrain_flat', 0.8)
    setDefault('w_power_endurance_2h', 0.6)
  }
  if (terrain.includes('mountain') || terrain.includes('summit')) {
    setDefault('w_terrain_long_climbs', 0.9)
    setDefault('w_terrain_altitude', 0.7)
    setDefault('w_power_vo2max_5m', 0.8)
    setDefault('w_power_threshold_20m', 0.7)
  }
  if (terrain.includes('hilly') || terrain.includes('rolling')) {
    setDefault('w_terrain_rolling', 0.7)
    setDefault('w_terrain_punch_climbs', 0.6)
    setDefault('w_power_anaerobic_1m', 0.5)
  }
  if (terrain.includes('cobbles')) {
    setDefault('w_terrain_cobbles', 0.9)
    setDefault('w_physical_handling', 0.7)
    setDefault('w_physical_acceleration', 0.6)
  }
  if (terrain.includes('time_trial') || terrain.includes('tt')) {
    setDefault('w_race_itt_flat', 0.9)
    setDefault('w_power_ftp_60m', 0.9)
    setDefault('w_power_threshold_20m', 0.8)
    setDefault('w_physical_aero', 0.8)
  }

  // Infer from finish type
  const finish = race.typical_finish?.toLowerCase() || ''
  if (finish.includes('sprint') || finish.includes('bunch')) {
    setDefault('w_race_sprint_finish', 0.9)
    setDefault('w_power_sprint_5s', 0.9)
    setDefault('w_physical_topspeed', 0.7)
    setDefault('w_tactical_positioning', 0.6)
  }
  if (finish.includes('solo')) {
    setDefault('w_race_breakaway', 0.8)
    setDefault('w_tactical_attacking', 0.7)
    setDefault('w_power_threshold_20m', 0.6)
  }
  if (finish.includes('summit')) {
    setDefault('w_terrain_long_climbs', 0.9)
    setDefault('w_power_vo2max_5m', 0.8)
    setDefault('w_race_gc', 0.5)
  }
  if (finish.includes('small_group') || finish.includes('reduced')) {
    setDefault('w_race_sprint_finish', 0.5)
    setDefault('w_tactical_race_iq', 0.7)
    setDefault('w_physical_acceleration', 0.6)
  }

  // Infer from race category
  if (race.category === 'GT') {
    setDefault('w_race_gc', 0.7)
    setDefault('w_race_stagerace', 0.8)
    setDefault('w_physical_recovery', 0.8)
    setDefault('w_tactical_race_iq', 0.6)
  }
  if (race.category === 'Monument') {
    setDefault('w_race_oneday', 0.9)
    setDefault('w_power_endurance_2h', 0.8)
    setDefault('w_tactical_positioning', 0.7)
  }

  // Infer from elevation
  const elevation = race.elevation_gain_m || 0
  if (elevation > 4000) {
    setDefault('w_terrain_long_climbs', 0.9)
    setDefault('w_terrain_medium_climbs', 0.7)
  } else if (elevation > 2000) {
    setDefault('w_terrain_medium_climbs', 0.7)
    setDefault('w_terrain_punch_climbs', 0.5)
  } else if (elevation < 500) {
    setDefault('w_terrain_flat', 0.8)
  }

  // Infer from race name (common patterns)
  const name = race.name.toLowerCase()
  if (name.includes('roubaix')) {
    setDefault('w_terrain_cobbles', 1.0)
    setDefault('w_physical_handling', 0.8)
    setDefault('w_power_endurance_2h', 0.9)
  }
  if (name.includes('flanders') || name.includes('vlaanderen')) {
    setDefault('w_terrain_cobbles', 0.8)
    setDefault('w_terrain_punch_climbs', 0.9)
    setDefault('w_tactical_positioning', 0.8)
  }
  if (name.includes('liege') || name.includes('fleche') || name.includes('amstel')) {
    setDefault('w_terrain_punch_climbs', 0.9)
    setDefault('w_power_vo2max_5m', 0.8)
    setDefault('w_tactical_attacking', 0.7)
  }
  if (name.includes('sanremo') || name.includes('milano')) {
    setDefault('w_power_endurance_2h', 0.9)
    setDefault('w_race_sprint_finish', 0.6)
    setDefault('w_terrain_punch_climbs', 0.5)
  }
  if (name.includes('lombardia')) {
    setDefault('w_terrain_medium_climbs', 0.9)
    setDefault('w_terrain_descending', 0.7)
    setDefault('w_tactical_attacking', 0.7)
  }
  if (name.includes('strade bianche')) {
    setDefault('w_terrain_gravel', 0.9)
    setDefault('w_terrain_punch_climbs', 0.7)
    setDefault('w_physical_handling', 0.7)
  }
  if (name.includes('time trial') || name.includes('chrono') || name.includes('contre')) {
    setDefault('w_race_itt_flat', 0.9)
    setDefault('w_power_ftp_60m', 0.9)
  }

  return chars
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { race_id, batch_mode = false } = await req.json()

    if (!race_id) {
      throw new Error('race_id is required')
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get race with characteristics
    const { data: race, error: raceError } = await supabase
      .from('races')
      .select(`*, race_characteristics (*)`)
      .eq('id', race_id)
      .single()

    if (raceError || !race) {
      throw new Error(`Race not found: ${raceError?.message}`)
    }

    // Get or infer characteristics
    let characteristics = race.race_characteristics as Record<string, number | null> | null
    characteristics = inferCharacteristics(race, characteristics)

    // Get race results
    const { data: results, error: resultsError } = await supabase
      .from('race_results')
      .select('*')
      .eq('race_id', race_id)
      .eq('did_not_finish', false)
      .eq('did_not_start', false)
      .order('position')

    if (resultsError || !results || results.length === 0) {
      return new Response(
        JSON.stringify({ updated: 0, message: 'No results to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const totalRiders = results.length
    const raceImportance = (RACE_IMPORTANCE[race.category] || 1.0) *
      (characteristics?.importance_multiplier ?? 1.0)

    // Get all rider ratings
    const riderIds = results.map(r => r.rider_id)
    const { data: existingRatings } = await supabase
      .from('rider_ratings')
      .select('*')
      .in('rider_id', riderIds)

    const ratingsMap = new Map<number, RiderRatingRow>(
      existingRatings?.map(r => [r.rider_id, r as RiderRatingRow]) || []
    )

    // Calculate updates using appropriate method
    // Head-to-head for small fields (< 50), batch for larger
    const useHeadToHead = totalRiders < 50 && !batch_mode

    console.log(`Processing ${totalRiders} riders for ${race.name} using ${useHeadToHead ? 'head-to-head' : 'batch'} method`)

    const newRatings = useHeadToHead
      ? calculateHeadToHeadUpdates(results, ratingsMap, characteristics, raceImportance)
      : calculateBatchUpdates(results, ratingsMap, characteristics, raceImportance)

    // Apply updates to database
    const updatePromises = []
    const updateLog = []

    for (const result of results) {
      const riderId = result.rider_id
      const ratings = newRatings.get(riderId)!
      const oldRatings = ratingsMap.get(riderId)

      // Calculate profile scores
      const profiles = calculateProfileScores(ratings)

      // Calculate overall
      const overall = calculateOverallRating({ ...ratings, ...profiles })

      // Calculate statistics
      const racesCount = (oldRatings?.races_count ?? 0) + 1
      const winsCount = (oldRatings?.wins_count ?? 0) + (result.position === 1 ? 1 : 0)
      const podiumsCount = (oldRatings?.podiums_count ?? 0) + (result.position <= 3 ? 1 : 0)
      const top10Count = (oldRatings?.top10_count ?? 0) + (result.position <= 10 ? 1 : 0)

      // Prepare full update object
      const updateData = {
        rider_id: riderId,
        ...ratings,
        ...profiles,
        overall,
        races_count: racesCount,
        wins_count: winsCount,
        podiums_count: podiumsCount,
        top10_count: top10Count,
        last_race_date: race.date,
        last_win_date: result.position === 1 ? race.date : oldRatings?.last_win_date,
        rating_confidence: Math.min(1.0, (oldRatings?.rating_confidence ?? 0.5) + 0.02),
      }

      // Upsert rating
      updatePromises.push(
        supabase
          .from('rider_ratings')
          .upsert(updateData, { onConflict: 'rider_id' })
          .then(({ error }) => {
            if (error) console.error(`Error updating rider ${riderId}:`, error)
          })
      )

      // Insert history entry
      updatePromises.push(
        supabase
          .from('rating_history')
          .insert({
            rider_id: riderId,
            race_id: race_id,
            date: race.date,
            ratings: { ...ratings, ...profiles, overall },
            overall_before: oldRatings?.overall ?? INITIAL_RATING,
            overall_after: overall,
            overall_change: overall - (oldRatings?.overall ?? INITIAL_RATING),
            change_reason: `Race: ${race.name} (P${result.position}/${totalRiders})`
          })
      )

      // Update race_results with rating change
      updatePromises.push(
        supabase
          .from('race_results')
          .update({
            rating_change_overall: overall - (oldRatings?.overall ?? INITIAL_RATING)
          })
          .eq('race_id', race_id)
          .eq('rider_id', riderId)
      )

      updateLog.push({
        rider_id: riderId,
        position: result.position,
        overall_before: oldRatings?.overall ?? INITIAL_RATING,
        overall_after: overall,
        change: overall - (oldRatings?.overall ?? INITIAL_RATING),
      })
    }

    // Wait for all updates
    await Promise.all(updatePromises)

    return new Response(
      JSON.stringify({
        success: true,
        race: race.name,
        riders_updated: totalRiders,
        method: useHeadToHead ? 'head-to-head' : 'batch',
        importance: raceImportance,
        updates: updateLog.slice(0, 20),  // Return top 20 for response size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing ratings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
