import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// =============================================================================
// RATING UPDATE HOOK
// =============================================================================

export interface RatingUpdateResult {
  success: boolean
  race: string
  riders_updated: number
  method: 'head-to-head' | 'batch'
  importance: number
  updates: Array<{
    rider_id: number
    position: number
    overall_before: number
    overall_after: number
    change: number
  }>
}

export function useUpdateRatings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (raceId: number): Promise<RatingUpdateResult> => {
      const { data, error } = await supabase.functions.invoke('update-ratings', {
        body: { race_id: raceId }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topRiders'] })
      queryClient.invalidateQueries({ queryKey: ['rider'] })
      queryClient.invalidateQueries({ queryKey: ['riderHistory'] })
      queryClient.invalidateQueries({ queryKey: ['allRaces'] })
    }
  })
}

// =============================================================================
// TEXT ANALYSIS HOOK
// =============================================================================

export interface TextAnalysisResult {
  success: boolean
  texts_processed: number
  total_extractions: number
  riders_found: number
  adjustments: Array<{
    riderId: number
    riderName: string
    dimensions: Array<{
      dimension: string
      adjustment: number
      direction: 'positive' | 'negative'
    }>
    sources: string[]
  }>
  updates_applied: boolean
  applied_updates: Array<{
    riderId: number
    riderName: string
    dimensionsUpdated: string[]
    overallChange: number
  }>
  sample_extractions: Array<{
    rider: string
    dimension: string
    keyword: string
    sentiment: 'positive' | 'negative' | 'neutral'
  }>
}

export interface TextAnalysisParams {
  text?: string
  texts?: string[]
  source_type?: 'report' | 'news' | 'comment' | 'social'
  source_url?: string
  apply_updates?: boolean
  confidence_threshold?: number
}

export function useAnalyzeText() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: TextAnalysisParams): Promise<TextAnalysisResult> => {
      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: params
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data.updates_applied && data.applied_updates.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['topRiders'] })
        queryClient.invalidateQueries({ queryKey: ['rider'] })
      }
    }
  })
}

// =============================================================================
// BATCH IMPORT HOOK
// =============================================================================

export interface ImportRace {
  name: string
  date: string
  category: 'GT' | 'Monument' | 'WC' | 'Olympics' | 'WT' | 'ProSeries' | 'Continental' | 'National' | 'U23' | 'Others'
  country?: string
  terrain?: string
  typical_finish?: string
  distance_km?: number
  elevation_gain_m?: number
  is_stage_race?: boolean
  stage_number?: number
  characteristics?: Record<string, number>
  results: Array<{
    rider_name: string
    position: number
    time_seconds?: number
    time_behind_seconds?: number
    dnf?: boolean
    dns?: boolean
  }>
}

export interface BatchImportResult {
  success: boolean
  source?: string
  stats: {
    races_processed: number
    races_created: number
    riders_created: number
    results_imported: number
    errors: string[]
  }
  rating_updates: Array<{
    race_id: number
    riders_updated: number
  }>
}

export function useBatchImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { source?: string; races: ImportRace[] }): Promise<BatchImportResult> => {
      const { data, error } = await supabase.functions.invoke('batch-import', {
        body: params
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRaces'] })
      queryClient.invalidateQueries({ queryKey: ['allRiders'] })
      queryClient.invalidateQueries({ queryKey: ['topRiders'] })
    }
  })
}

// =============================================================================
// SAMPLE DATA FOR TESTING
// =============================================================================

export const SAMPLE_RACE_REPORT = `
Tour de France Stage 17 Report:

In a stunning display of climbing prowess, Tadej Pogačar attacked on the final climb of the Col du Galibier,
dropping all his rivals including Jonas Vingegaard. The Slovenian showed incredible VO2max power,
sustaining over 6.5 watts per kilogram for the 20-minute effort. Pogačar's tactical race IQ was evident
as he timed his attack perfectly when UAE's Rafał Majka set a brutal tempo.

Vingegaard struggled to match the pace in the thin air at altitude, eventually losing 2 minutes.
The Dane looked fatigued after yesterday's efforts. Remco Evenepoel showed consistent day-to-day form,
limiting his losses to just 45 seconds.

In the breakaway, Mathieu van der Poel animated the race early with repeated attacks before being
caught on the penultimate climb. His punch climb abilities were on full display on the shorter steep sections.

Primož Roglič crashed descending the Col de Vars but showed incredible fatigue resistance to
fight back into contention.
`

export const SAMPLE_BATCH_IMPORT: { source: string; races: ImportRace[] } = {
  source: 'Sample Import',
  races: [
    {
      name: 'Sample Mountain Stage',
      date: '2024-07-20',
      category: 'GT',
      terrain: 'mountain_summit',
      typical_finish: 'summit_finish',
      distance_km: 180,
      elevation_gain_m: 4500,
      results: [
        { rider_name: 'Tadej Pogačar', position: 1, time_seconds: 18000 },
        { rider_name: 'Jonas Vingegaard', position: 2, time_behind_seconds: 120 },
        { rider_name: 'Remco Evenepoel', position: 3, time_behind_seconds: 165 },
        { rider_name: 'Primož Roglič', position: 4, time_behind_seconds: 210 },
        { rider_name: 'Richard Carapaz', position: 5, time_behind_seconds: 280 },
      ]
    }
  ]
}
