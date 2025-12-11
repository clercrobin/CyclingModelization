import { useState } from 'react'
import { useTopRiders } from '../hooks/useRiders'
import type { RatingDimension } from '../hooks/useRiders'
import { Trophy, Medal, Award } from 'lucide-react'

const dimensions: { value: RatingDimension; label: string }[] = [
  { value: 'overall', label: 'Overall' },
  { value: 'flat', label: 'Flat' },
  { value: 'cobbles', label: 'Cobbles' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'time_trial', label: 'Time Trial' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'gc', label: 'GC' },
  { value: 'one_day', label: 'One Day' },
  { value: 'endurance', label: 'Endurance' }
]

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return <span className="text-gray-500 font-medium">{rank}</span>
  }
}

function getRatingColor(rating: number) {
  if (rating >= 2100) return 'text-purple-600 bg-purple-100'
  if (rating >= 1900) return 'text-red-600 bg-red-100'
  if (rating >= 1700) return 'text-orange-600 bg-orange-100'
  if (rating >= 1500) return 'text-blue-600 bg-blue-100'
  return 'text-gray-600 bg-gray-100'
}

export function Rankings() {
  const [dimension, setDimension] = useState<RatingDimension>('overall')
  const [limit, setLimit] = useState(50)

  const { data: riders, isLoading, error } = useTopRiders(dimension, limit)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rankings</h1>
        <p className="text-gray-600">Top riders ranked by their performance ratings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating Dimension
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as RatingDimension)}
              className="block w-48 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            >
              {dimensions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Top
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="block w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading rankings...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error loading rankings</div>
        ) : riders?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No riders found. Add some riders to see rankings.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {dimension === 'overall' ? 'Rating' : `${dimensions.find(d => d.value === dimension)?.label} Rating`}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Races
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wins
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Podiums
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {riders?.map((rider, index) => (
                <tr key={rider.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index + 1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{rider.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {rider.team || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {rider.country || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-sm font-semibold ${getRatingColor(rider.rating)}`}>
                      {rider.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                    {rider.races}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                    {rider.wins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                    {rider.podiums}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rating Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Interpretation</h3>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 bg-gray-100">
            1000-1500: Professional
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100">
            1500-1700: Strong Pro
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium text-orange-600 bg-orange-100">
            1700-1900: Top Tier
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-100">
            1900-2100: World Class
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium text-purple-600 bg-purple-100">
            2100+: Exceptional
          </span>
        </div>
      </div>
    </div>
  )
}
