import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Rider, RiderRating, RatingHistory } from '../types/database'

export type RatingDimension = 'overall' | 'flat' | 'cobbles' | 'mountain' | 'time_trial' | 'sprint' | 'gc' | 'one_day' | 'endurance'

export interface RiderWithRating {
  id: number
  name: string
  team: string | null
  country: string | null
  rating: number
  overall: number
  races: number
  wins: number
  podiums: number
  ratings?: RiderRating
}

export function useTopRiders(dimension: RatingDimension = 'overall', limit: number = 50) {
  return useQuery({
    queryKey: ['topRiders', dimension, limit],
    queryFn: async (): Promise<RiderWithRating[]> => {
      const { data, error } = await supabase
        .from('riders')
        .select(`
          id,
          name,
          team,
          country,
          rider_ratings (
            flat,
            cobbles,
            mountain,
            time_trial,
            sprint,
            gc,
            one_day,
            endurance,
            overall,
            races_count,
            wins_count,
            podiums_count
          )
        `)
        .not('rider_ratings', 'is', null)
        .order(`rider_ratings(${dimension})`, { ascending: false })
        .limit(limit)

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((rider: any) => ({
        id: rider.id,
        name: rider.name,
        team: rider.team,
        country: rider.country,
        rating: rider.rider_ratings?.[dimension] ?? 1500,
        overall: rider.rider_ratings?.overall ?? 1500,
        races: rider.rider_ratings?.races_count ?? 0,
        wins: rider.rider_ratings?.wins_count ?? 0,
        podiums: rider.rider_ratings?.podiums_count ?? 0,
        ratings: rider.rider_ratings
      }))
    }
  })
}

export function useRider(riderId: number | null) {
  return useQuery({
    queryKey: ['rider', riderId],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      if (!riderId) return null

      const { data, error } = await supabase
        .from('riders')
        .select(`
          *,
          rider_ratings (*),
          race_results (
            *,
            races (
              id,
              name,
              date,
              category
            )
          )
        `)
        .eq('id', riderId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!riderId
  })
}

export function useRiderHistory(riderId: number | null) {
  return useQuery({
    queryKey: ['riderHistory', riderId],
    queryFn: async (): Promise<RatingHistory[]> => {
      if (!riderId) return []

      const { data, error } = await supabase
        .from('rating_history')
        .select('*')
        .eq('rider_id', riderId)
        .order('date', { ascending: true })

      if (error) throw error
      return (data || []) as RatingHistory[]
    },
    enabled: !!riderId
  })
}

export function useAllRiders() {
  return useQuery({
    queryKey: ['allRiders'],
    queryFn: async (): Promise<Rider[]> => {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .order('name')

      if (error) throw error
      return (data || []) as Rider[]
    }
  })
}

export function useAddRider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rider: { name: string; team?: string; country?: string }) => {
      // Insert rider
      const { data: newRider, error: riderError } = await supabase
        .from('riders')
        .insert({ name: rider.name, team: rider.team, country: rider.country })
        .select()
        .single()

      if (riderError) throw riderError

      // Initialize ratings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: ratingError } = await supabase
        .from('rider_ratings')
        .insert({
          rider_id: (newRider as { id: number }).id,
          flat: 1500,
          cobbles: 1500,
          mountain: 1500,
          time_trial: 1500,
          sprint: 1500,
          gc: 1500,
          one_day: 1500,
          endurance: 1500,
          overall: 1500,
          races_count: 0,
          wins_count: 0,
          podiums_count: 0
        })

      if (ratingError) throw ratingError

      return newRider
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRiders'] })
      queryClient.invalidateQueries({ queryKey: ['topRiders'] })
    }
  })
}
