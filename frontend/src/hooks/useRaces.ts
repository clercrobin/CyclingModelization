import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Race, RaceCharacteristics, RaceCategory } from '../types/database'

export function useAllRaces() {
  return useQuery({
    queryKey: ['allRaces'],
    queryFn: async (): Promise<Race[]> => {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      return (data || []) as Race[]
    }
  })
}

export function useRace(raceId: number | null) {
  return useQuery({
    queryKey: ['race', raceId],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      if (!raceId) return null

      const { data, error } = await supabase
        .from('races')
        .select(`
          *,
          race_characteristics (*),
          race_results (
            *,
            riders (name)
          )
        `)
        .eq('id', raceId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!raceId
  })
}

export function useAddRace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (race: {
      name: string
      date: string
      category: RaceCategory
      country?: string
      characteristics: Partial<RaceCharacteristics>
    }) => {
      // Insert race
      const { data: newRace, error: raceError } = await supabase
        .from('races')
        .insert({
          name: race.name,
          date: race.date,
          category: race.category,
          country: race.country,
          season: new Date(race.date).getFullYear(),
          is_stage_race: false
        })
        .select()
        .single()

      if (raceError) throw raceError

      // Insert characteristics
      const { error: charError } = await supabase
        .from('race_characteristics')
        .insert({
          race_id: (newRace as { id: number }).id,
          flat_weight: race.characteristics.flat_weight ?? 0,
          cobbles_weight: race.characteristics.cobbles_weight ?? 0,
          mountain_weight: race.characteristics.mountain_weight ?? 0,
          time_trial_weight: race.characteristics.time_trial_weight ?? 0,
          sprint_weight: race.characteristics.sprint_weight ?? 0,
          gc_weight: race.characteristics.gc_weight ?? 0,
          one_day_weight: race.characteristics.one_day_weight ?? 0,
          endurance_weight: race.characteristics.endurance_weight ?? 0,
          distance_km: race.characteristics.distance_km,
          elevation_gain_m: race.characteristics.elevation_gain_m
        })

      if (charError) throw charError

      return newRace
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRaces'] })
    }
  })
}

export function useAddRaceResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (result: {
      race_id: number
      rider_id: number
      position: number
      time_seconds?: number
      time_behind_seconds?: number
    }) => {
      const { data, error } = await supabase
        .from('race_results')
        .insert({
          race_id: result.race_id,
          rider_id: result.rider_id,
          position: result.position,
          time_seconds: result.time_seconds,
          time_behind_seconds: result.time_behind_seconds,
          did_not_finish: false,
          did_not_start: false,
          points: 0
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['race', variables.race_id] })
    }
  })
}

export function useUpdateRatings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (raceId: number) => {
      // Call the Supabase Edge Function to update ratings
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
    }
  })
}

// Race templates
export const RACE_TEMPLATES: Record<string, Partial<RaceCharacteristics>> = {
  'Paris-Roubaix': {
    flat_weight: 0.6,
    cobbles_weight: 1.0,
    mountain_weight: 0.0,
    time_trial_weight: 0.0,
    sprint_weight: 0.3,
    gc_weight: 0.0,
    one_day_weight: 1.0,
    endurance_weight: 0.8
  },
  'Tour of Flanders': {
    flat_weight: 0.4,
    cobbles_weight: 0.8,
    mountain_weight: 0.3,
    time_trial_weight: 0.0,
    sprint_weight: 0.4,
    gc_weight: 0.0,
    one_day_weight: 1.0,
    endurance_weight: 0.7
  },
  'Mountain Stage': {
    flat_weight: 0.2,
    cobbles_weight: 0.0,
    mountain_weight: 1.0,
    time_trial_weight: 0.0,
    sprint_weight: 0.1,
    gc_weight: 0.7,
    one_day_weight: 0.0,
    endurance_weight: 0.9
  },
  'Flat Sprint Stage': {
    flat_weight: 1.0,
    cobbles_weight: 0.0,
    mountain_weight: 0.0,
    time_trial_weight: 0.0,
    sprint_weight: 1.0,
    gc_weight: 0.2,
    one_day_weight: 0.0,
    endurance_weight: 0.5
  },
  'Individual Time Trial': {
    flat_weight: 0.5,
    cobbles_weight: 0.0,
    mountain_weight: 0.0,
    time_trial_weight: 1.0,
    sprint_weight: 0.0,
    gc_weight: 0.5,
    one_day_weight: 0.0,
    endurance_weight: 0.6
  },
  'Milano-Sanremo': {
    flat_weight: 0.7,
    cobbles_weight: 0.0,
    mountain_weight: 0.2,
    time_trial_weight: 0.0,
    sprint_weight: 0.8,
    gc_weight: 0.0,
    one_day_weight: 1.0,
    endurance_weight: 0.9
  },
  'Liege-Bastogne-Liege': {
    flat_weight: 0.3,
    cobbles_weight: 0.0,
    mountain_weight: 0.7,
    time_trial_weight: 0.0,
    sprint_weight: 0.4,
    gc_weight: 0.0,
    one_day_weight: 1.0,
    endurance_weight: 0.8
  },
  'Il Lombardia': {
    flat_weight: 0.2,
    cobbles_weight: 0.0,
    mountain_weight: 0.8,
    time_trial_weight: 0.0,
    sprint_weight: 0.3,
    gc_weight: 0.0,
    one_day_weight: 1.0,
    endurance_weight: 0.7
  }
}
