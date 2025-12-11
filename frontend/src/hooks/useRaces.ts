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

      // Insert characteristics with new field names
      const { error: charError } = await supabase
        .from('race_characteristics')
        .insert({
          race_id: (newRace as { id: number }).id,
          terrain_flat_weight: race.characteristics.terrain_flat_weight ?? 0,
          terrain_cobbles_weight: race.characteristics.terrain_cobbles_weight ?? 0,
          terrain_long_climbs_weight: race.characteristics.terrain_long_climbs_weight ?? 0,
          race_sprint_finish_weight: race.characteristics.race_sprint_finish_weight ?? 0,
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

// Race templates with updated field names
export const RACE_TEMPLATES: Record<string, Partial<RaceCharacteristics>> = {
  'Paris-Roubaix': {
    terrain_flat_weight: 0.6,
    terrain_cobbles_weight: 1.0,
    terrain_long_climbs_weight: 0.0,
    race_sprint_finish_weight: 0.3,
    power_endurance_2h_weight: 0.8
  },
  'Tour of Flanders': {
    terrain_flat_weight: 0.4,
    terrain_cobbles_weight: 0.8,
    terrain_punch_climbs_weight: 0.6,
    race_sprint_finish_weight: 0.4,
    power_endurance_2h_weight: 0.7
  },
  'Mountain Stage': {
    terrain_flat_weight: 0.2,
    terrain_long_climbs_weight: 1.0,
    terrain_altitude_weight: 0.8,
    race_sprint_finish_weight: 0.1,
    power_endurance_2h_weight: 0.9
  },
  'Flat Sprint Stage': {
    terrain_flat_weight: 1.0,
    terrain_long_climbs_weight: 0.0,
    race_sprint_finish_weight: 1.0,
    power_sprint_5s_weight: 0.9,
    power_endurance_2h_weight: 0.5
  },
  'Individual Time Trial': {
    terrain_flat_weight: 0.7,
    terrain_rolling_weight: 0.5,
    power_threshold_20m_weight: 0.9,
    power_ftp_60m_weight: 1.0
  },
  'Milano-Sanremo': {
    terrain_flat_weight: 0.7,
    terrain_punch_climbs_weight: 0.5,
    race_sprint_finish_weight: 0.8,
    power_endurance_2h_weight: 0.9
  },
  'Liege-Bastogne-Liege': {
    terrain_rolling_weight: 0.7,
    terrain_punch_climbs_weight: 0.9,
    terrain_medium_climbs_weight: 0.6,
    power_vo2max_5m_weight: 0.8,
    power_endurance_2h_weight: 0.8
  },
  'Il Lombardia': {
    terrain_medium_climbs_weight: 0.8,
    terrain_long_climbs_weight: 0.5,
    terrain_descending_weight: 0.7,
    race_sprint_finish_weight: 0.4,
    power_endurance_2h_weight: 0.7
  }
}
