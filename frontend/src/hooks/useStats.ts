import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface SystemStats {
  totalRiders: number
  totalRaces: number
  totalResults: number
  avgRating: number
  topRatedRider: { name: string; rating: number } | null
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['systemStats'],
    queryFn: async (): Promise<SystemStats> => {
      // Get rider count
      const { count: riderCount } = await supabase
        .from('riders')
        .select('*', { count: 'exact', head: true })

      // Get race count
      const { count: raceCount } = await supabase
        .from('races')
        .select('*', { count: 'exact', head: true })

      // Get results count
      const { count: resultCount } = await supabase
        .from('race_results')
        .select('*', { count: 'exact', head: true })

      // Get average rating
      const { data: ratings } = await supabase
        .from('rider_ratings')
        .select('overall')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ratingsArr = (ratings || []) as any[]
      const avgRating = ratingsArr.length
        ? Math.round(ratingsArr.reduce((sum, r) => sum + (r.overall || 1500), 0) / ratingsArr.length)
        : 1500

      // Get top rider
      const { data: topRiderData } = await supabase
        .from('riders')
        .select(`
          name,
          rider_ratings (overall)
        `)
        .not('rider_ratings', 'is', null)
        .order('rider_ratings(overall)', { ascending: false })
        .limit(1)
        .single()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topRider = topRiderData as any

      return {
        totalRiders: riderCount || 0,
        totalRaces: raceCount || 0,
        totalResults: resultCount || 0,
        avgRating,
        topRatedRider: topRider ? {
          name: topRider.name,
          rating: topRider.rider_ratings?.overall ?? 1500
        } : null
      }
    }
  })
}

export function useRatingDistribution() {
  return useQuery({
    queryKey: ['ratingDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rider_ratings')
        .select('overall')

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ratings = (data || []) as any[]

      // Create distribution buckets
      const buckets: Record<string, number> = {
        '1000-1300': 0,
        '1300-1500': 0,
        '1500-1700': 0,
        '1700-1900': 0,
        '1900-2100': 0,
        '2100+': 0
      }

      ratings.forEach(r => {
        const overall = r.overall || 1500
        if (overall < 1300) buckets['1000-1300']++
        else if (overall < 1500) buckets['1300-1500']++
        else if (overall < 1700) buckets['1500-1700']++
        else if (overall < 1900) buckets['1700-1900']++
        else if (overall < 2100) buckets['1900-2100']++
        else buckets['2100+']++
      })

      return Object.entries(buckets).map(([range, count]) => ({
        range,
        count
      }))
    }
  })
}

export function useDimensionCorrelation() {
  return useQuery({
    queryKey: ['dimensionCorrelation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rider_ratings')
        .select('flat, cobbles, mountain, time_trial, sprint, gc, one_day, endurance')

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ratings = (data || []) as any[]
      if (ratings.length === 0) return []

      // Calculate average for each dimension
      const dimensions = ['flat', 'cobbles', 'mountain', 'time_trial', 'sprint', 'gc', 'one_day', 'endurance']

      return dimensions.map(dim => ({
        dimension: dim.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        average: Math.round(ratings.reduce((sum, r) => sum + (r[dim] || 1500), 0) / ratings.length)
      }))
    }
  })
}
