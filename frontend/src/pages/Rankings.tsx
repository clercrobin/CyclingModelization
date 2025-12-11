import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTopRiders } from '../hooks/useRiders'
import { RATING_CATEGORIES, ALL_RATING_DIMENSIONS, type RatingDimensionKey } from '../types/database'
import { Trophy, Medal, Award, ChevronRight } from 'lucide-react'

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
  if (rating >= 2200) return 'text-pink-600 bg-pink-100'
  if (rating >= 2000) return 'text-purple-600 bg-purple-100'
  if (rating >= 1800) return 'text-red-600 bg-red-100'
  if (rating >= 1600) return 'text-orange-600 bg-orange-100'
  if (rating >= 1400) return 'text-blue-600 bg-blue-100'
  return 'text-gray-600 bg-gray-100'
}

function getDimensionLabel(key: string): string {
  const found = ALL_RATING_DIMENSIONS.find(d => d.key === key)
  return found?.label ?? key
}

export function Rankings() {
  const [dimension, setDimension] = useState<RatingDimensionKey>('overall')
  const [limit, setLimit] = useState(50)

  const { data: riders, isLoading, error } = useTopRiders(dimension, limit)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">World Rankings</h1>
        <p className="text-gray-600">Top professional cyclists ranked across 65+ performance dimensions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating Dimension
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as RatingDimensionKey)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            >
              <option value="overall">Overall Rating</option>
              <optgroup label="Profile Scores">
                {RATING_CATEGORIES.profile.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Power Profile">
                {RATING_CATEGORIES.power.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Terrain">
                {RATING_CATEGORIES.terrain.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Race Type">
                {RATING_CATEGORIES.raceType.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Classics">
                {RATING_CATEGORIES.classics.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Tactical">
                {RATING_CATEGORIES.tactical.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Physical">
                {RATING_CATEGORIES.physical.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Weather">
                {RATING_CATEGORIES.weather.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
              <optgroup label="Consistency">
                {RATING_CATEGORIES.consistency.dimensions.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </optgroup>
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
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          Showing rankings by: <span className="font-medium text-blue-600">{getDimensionLabel(dimension)}</span>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Country
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getDimensionLabel(dimension)}
                  </th>
                  {dimension !== 'overall' && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Overall
                    </th>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {riders?.map((rider, index) => (
                  <tr key={rider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link to={`/rider/${rider.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {rider.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500 hidden md:table-cell text-sm">
                      {rider.team || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {rider.country_code || rider.country?.slice(0, 3).toUpperCase() || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-sm font-semibold ${getRatingColor(rider.rating)}`}>
                        {rider.rating}
                      </span>
                    </td>
                    {dimension !== 'overall' && (
                      <td className="px-4 py-4 whitespace-nowrap text-right text-gray-500 hidden sm:table-cell">
                        {rider.overall}
                      </td>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link to={`/rider/${rider.id}`} className="text-gray-400 hover:text-blue-600">
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rating Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Scale</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
            1200-1400: Avg Pro
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
            1400-1600: Good
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-100">
            1600-1800: Top Tier
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
            1800-2000: World Class
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
            2000-2200: Best in World
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-pink-600 bg-pink-100">
            2200+: GOAT Tier
          </span>
        </div>
      </div>

      {/* Dimension Categories */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">65+ Rating Dimensions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(RATING_CATEGORIES).map(([key, category]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900 text-sm mb-1">{category.label}</div>
              <div className="text-xs text-gray-500">{category.dimensions.length} dimensions</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
