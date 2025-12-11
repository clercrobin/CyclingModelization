// Supabase Edge Function for updating rider ratings
// Deploy with: supabase functions deploy update-ratings

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rating system constants
const K_FACTOR = 32
const INITIAL_RATING = 1500
const RACE_IMPORTANCE: Record<string, number> = {
  'GT': 2.0,
  'Monument': 1.8,
  'WC': 1.7,
  'WT': 1.3,
  'ProSeries': 1.0,
  'Others': 0.7
}

const OVERALL_WEIGHTS: Record<string, number> = {
  'flat': 0.15,
  'cobbles': 0.10,
  'mountain': 0.20,
  'time_trial': 0.15,
  'sprint': 0.10,
  'gc': 0.15,
  'one_day': 0.10,
  'endurance': 0.05
}

function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

function calculatePerformanceScore(position: number, totalRiders: number): number {
  if (position === 1) return 1.0
  if (position <= 3) return 0.9 - (position - 1) * 0.15
  if (position <= 10) return 0.6 - (position - 3) * 0.05
  if (position <= 20) return 0.3 - (position - 10) * 0.02
  return Math.max(0.1, 0.1 - (position - 20) * 0.005)
}

function calculateOverallRating(ratings: Record<string, number>): number {
  let weightedSum = 0
  for (const [dim, weight] of Object.entries(OVERALL_WEIGHTS)) {
    weightedSum += (ratings[dim] || INITIAL_RATING) * weight
  }
  return Math.round(weightedSum)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { race_id } = await req.json()

    if (!race_id) {
      throw new Error('race_id is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get race with characteristics
    const { data: race, error: raceError } = await supabase
      .from('races')
      .select(`
        *,
        race_characteristics (*)
      `)
      .eq('id', race_id)
      .single()

    if (raceError || !race) {
      throw new Error(`Race not found: ${raceError?.message}`)
    }

    const characteristics = race.race_characteristics
    if (!characteristics) {
      throw new Error('Race has no characteristics defined')
    }

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
    const importance = RACE_IMPORTANCE[race.category] || 1.0

    // Get all rider ratings
    const riderIds = results.map(r => r.rider_id)
    const { data: existingRatings } = await supabase
      .from('rider_ratings')
      .select('*')
      .in('rider_id', riderIds)

    const ratingsMap = new Map(existingRatings?.map(r => [r.rider_id, r]) || [])

    // Calculate average ratings for each dimension
    const avgRatings: Record<string, number> = {}
    const dimensions = ['flat', 'cobbles', 'mountain', 'time_trial', 'sprint', 'gc', 'one_day', 'endurance']

    for (const dim of dimensions) {
      let sum = 0
      for (const result of results) {
        const rating = ratingsMap.get(result.rider_id)
        sum += rating?.[dim] || INITIAL_RATING
      }
      avgRatings[dim] = sum / results.length
    }

    // Update ratings for each rider
    const updates = []
    for (const result of results) {
      const currentRating = ratingsMap.get(result.rider_id) || {
        rider_id: result.rider_id,
        flat: INITIAL_RATING,
        cobbles: INITIAL_RATING,
        mountain: INITIAL_RATING,
        time_trial: INITIAL_RATING,
        sprint: INITIAL_RATING,
        gc: INITIAL_RATING,
        one_day: INITIAL_RATING,
        endurance: INITIAL_RATING,
        overall: INITIAL_RATING,
        races_count: 0,
        wins_count: 0,
        podiums_count: 0
      }

      const newRatings: Record<string, number> = {}
      const charWeights: Record<string, number> = {
        flat: characteristics.flat_weight || 0,
        cobbles: characteristics.cobbles_weight || 0,
        mountain: characteristics.mountain_weight || 0,
        time_trial: characteristics.time_trial_weight || 0,
        sprint: characteristics.sprint_weight || 0,
        gc: characteristics.gc_weight || 0,
        one_day: characteristics.one_day_weight || 0,
        endurance: characteristics.endurance_weight || 0
      }

      // Update each dimension
      for (const dim of dimensions) {
        const weight = charWeights[dim]
        if (weight > 0) {
          const currentDimRating = currentRating[dim] || INITIAL_RATING
          const expected = calculateExpectedScore(currentDimRating, avgRatings[dim])
          const actual = calculatePerformanceScore(result.position, totalRiders)
          const change = Math.round(K_FACTOR * importance * weight * (actual - expected))
          newRatings[dim] = Math.max(1000, Math.min(2500, currentDimRating + change))
        } else {
          newRatings[dim] = currentRating[dim] || INITIAL_RATING
        }
      }

      // Calculate overall
      newRatings.overall = calculateOverallRating(newRatings)

      // Update statistics
      const newRacesCount = (currentRating.races_count || 0) + 1
      const newWinsCount = (currentRating.wins_count || 0) + (result.position === 1 ? 1 : 0)
      const newPodiumsCount = (currentRating.podiums_count || 0) + (result.position <= 3 ? 1 : 0)

      // Upsert rating
      const { error: upsertError } = await supabase
        .from('rider_ratings')
        .upsert({
          rider_id: result.rider_id,
          ...newRatings,
          races_count: newRacesCount,
          wins_count: newWinsCount,
          podiums_count: newPodiumsCount
        }, {
          onConflict: 'rider_id'
        })

      if (upsertError) {
        console.error(`Error updating rider ${result.rider_id}:`, upsertError)
        continue
      }

      // Insert history
      await supabase
        .from('rating_history')
        .insert({
          rider_id: result.rider_id,
          race_id: race_id,
          date: race.date,
          ratings: newRatings,
          change_reason: `Race result: ${race.name} (P${result.position})`
        })

      updates.push({
        rider_id: result.rider_id,
        position: result.position,
        new_overall: newRatings.overall
      })
    }

    return new Response(
      JSON.stringify({
        updated: updates.length,
        race: race.name,
        updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
