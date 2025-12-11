// Cycling Aladdin: Batch Import Pipeline
// Imports race results from external sources and processes them through the rating engine
// Supports JSON format with race metadata and results

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface ImportRider {
  name: string
  team?: string
  country?: string
  country_code?: string
}

interface ImportResult {
  rider_name: string
  position: number
  time_seconds?: number
  time_behind_seconds?: number
  dnf?: boolean
  dns?: boolean
}

interface ImportRace {
  name: string
  date: string  // YYYY-MM-DD
  category: 'GT' | 'Monument' | 'WC' | 'Olympics' | 'WT' | 'ProSeries' | 'Continental' | 'National' | 'U23' | 'Others'
  country?: string
  terrain?: 'flat' | 'flat_technical' | 'rolling' | 'hilly' | 'mountain' | 'mountain_summit' | 'cobbles' | 'mixed' | 'time_trial_flat' | 'time_trial_hilly' | 'time_trial_mountain'
  typical_finish?: 'bunch_sprint' | 'reduced_sprint' | 'small_group' | 'solo' | 'summit_finish' | 'time_trial'
  distance_km?: number
  elevation_gain_m?: number
  is_stage_race?: boolean
  stage_number?: number
  parent_race_name?: string
  characteristics?: Record<string, number>  // Weight factors
  results: ImportResult[]
}

interface ImportBatch {
  source?: string
  imported_at?: string
  races: ImportRace[]
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function findOrCreateRider(
  supabase: ReturnType<typeof createClient>,
  rider: ImportRider,
  existingRiders: Map<string, number>
): Promise<number> {
  // Normalize name for matching
  const normalizedName = rider.name.toLowerCase().trim()

  // Check cache first
  if (existingRiders.has(normalizedName)) {
    return existingRiders.get(normalizedName)!
  }

  // Try to find existing rider
  const { data: existing } = await supabase
    .from('riders')
    .select('id, name')
    .ilike('name', rider.name)
    .limit(1)
    .single()

  if (existing) {
    existingRiders.set(normalizedName, existing.id)
    return existing.id
  }

  // Create new rider
  const { data: newRider, error } = await supabase
    .from('riders')
    .insert({
      name: rider.name,
      team: rider.team,
      country: rider.country,
      country_code: rider.country_code
    })
    .select('id')
    .single()

  if (error) {
    console.error(`Error creating rider ${rider.name}:`, error)
    throw new Error(`Failed to create rider: ${rider.name}`)
  }

  // Initialize ratings for new rider
  await supabase
    .from('rider_ratings')
    .insert({ rider_id: newRider.id })

  existingRiders.set(normalizedName, newRider.id)
  return newRider.id
}

async function findOrCreateRace(
  supabase: ReturnType<typeof createClient>,
  race: ImportRace,
  existingRaces: Map<string, number>
): Promise<number> {
  const raceKey = `${race.name}-${race.date}`

  // Check cache
  if (existingRaces.has(raceKey)) {
    return existingRaces.get(raceKey)!
  }

  // Try to find existing race
  const { data: existing } = await supabase
    .from('races')
    .select('id')
    .eq('name', race.name)
    .eq('date', race.date)
    .limit(1)
    .single()

  if (existing) {
    existingRaces.set(raceKey, existing.id)
    return existing.id
  }

  // Create new race
  const { data: newRace, error } = await supabase
    .from('races')
    .insert({
      name: race.name,
      date: race.date,
      category: race.category || 'Others',
      terrain: race.terrain,
      typical_finish: race.typical_finish,
      country: race.country,
      distance_km: race.distance_km,
      elevation_gain_m: race.elevation_gain_m,
      is_stage_race: race.is_stage_race || false,
      stage_number: race.stage_number,
      season: parseInt(race.date.substring(0, 4))
    })
    .select('id')
    .single()

  if (error) {
    console.error(`Error creating race ${race.name}:`, error)
    throw new Error(`Failed to create race: ${race.name}`)
  }

  // Create characteristics if provided
  if (race.characteristics) {
    await supabase
      .from('race_characteristics')
      .insert({
        race_id: newRace.id,
        ...race.characteristics
      })
  }

  existingRaces.set(raceKey, newRace.id)
  return newRace.id
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const batch: ImportBatch = await req.json()

    if (!batch.races || batch.races.length === 0) {
      throw new Error('races array is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Pre-load existing riders and races for efficiency
    const { data: allRiders } = await supabase.from('riders').select('id, name')
    const existingRiders = new Map<string, number>(
      allRiders?.map(r => [r.name.toLowerCase().trim(), r.id]) || []
    )

    const { data: allRaces } = await supabase.from('races').select('id, name, date')
    const existingRaces = new Map<string, number>(
      allRaces?.map(r => [`${r.name}-${r.date}`, r.id]) || []
    )

    // Process results
    const importStats = {
      races_processed: 0,
      races_created: 0,
      riders_created: 0,
      results_imported: 0,
      errors: [] as string[]
    }

    const processedRaceIds: number[] = []

    for (const race of batch.races) {
      try {
        // Validate race has results
        if (!race.results || race.results.length === 0) {
          importStats.errors.push(`Race ${race.name} has no results`)
          continue
        }

        // Find or create race
        const initialRaceCount = existingRaces.size
        const raceId = await findOrCreateRace(supabase, race, existingRaces)
        if (existingRaces.size > initialRaceCount) {
          importStats.races_created++
        }

        // Process results
        const resultsToInsert = []

        for (const result of race.results) {
          // Find or create rider
          const initialRiderCount = existingRiders.size
          const riderId = await findOrCreateRider(
            supabase,
            { name: result.rider_name },
            existingRiders
          )
          if (existingRiders.size > initialRiderCount) {
            importStats.riders_created++
          }

          resultsToInsert.push({
            race_id: raceId,
            rider_id: riderId,
            position: result.position,
            time_seconds: result.time_seconds,
            time_behind_seconds: result.time_behind_seconds,
            did_not_finish: result.dnf || false,
            did_not_start: result.dns || false
          })
        }

        // Delete existing results for this race (in case of re-import)
        await supabase
          .from('race_results')
          .delete()
          .eq('race_id', raceId)

        // Insert all results
        const { error: insertError } = await supabase
          .from('race_results')
          .insert(resultsToInsert)

        if (insertError) {
          importStats.errors.push(`Failed to insert results for ${race.name}: ${insertError.message}`)
          continue
        }

        importStats.results_imported += resultsToInsert.length
        importStats.races_processed++
        processedRaceIds.push(raceId)

      } catch (error) {
        importStats.errors.push(`Error processing ${race.name}: ${error.message}`)
      }
    }

    // Optionally trigger rating updates for all processed races
    const updateResults = []
    if (processedRaceIds.length > 0) {
      console.log(`Triggering rating updates for ${processedRaceIds.length} races`)

      for (const raceId of processedRaceIds) {
        try {
          // Call update-ratings function
          const { data: updateResult, error: updateError } = await supabase.functions.invoke(
            'update-ratings',
            { body: { race_id: raceId, batch_mode: true } }
          )

          if (updateError) {
            console.error(`Error updating ratings for race ${raceId}:`, updateError)
          } else {
            updateResults.push({
              race_id: raceId,
              riders_updated: updateResult?.riders_updated || 0
            })
          }
        } catch (err) {
          console.error(`Exception updating ratings for race ${raceId}:`, err)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: batch.source,
        stats: importStats,
        rating_updates: updateResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in batch import:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
