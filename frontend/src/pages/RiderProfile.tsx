import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAllRiders, useRider, useRiderHistory } from '../hooks/useRiders'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { User, Trophy, Calendar, TrendingUp } from 'lucide-react'

export function RiderProfile() {
  const { id } = useParams<{ id: string }>()
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null)

  // Sync URL param with state
  useEffect(() => {
    if (id) {
      setSelectedRiderId(Number(id))
    }
  }, [id])

  const { data: allRiders, isLoading: ridersLoading } = useAllRiders()
  const { data: rider, isLoading: riderLoading } = useRider(selectedRiderId)
  const { data: history } = useRiderHistory(selectedRiderId)

  const radarData = rider?.rider_ratings
    ? [
        { dimension: 'Flat', value: rider.rider_ratings.flat, fullMark: 2500 },
        { dimension: 'Cobbles', value: rider.rider_ratings.cobbles, fullMark: 2500 },
        { dimension: 'Mountain', value: rider.rider_ratings.mountain, fullMark: 2500 },
        { dimension: 'Time Trial', value: rider.rider_ratings.time_trial, fullMark: 2500 },
        { dimension: 'Sprint', value: rider.rider_ratings.sprint, fullMark: 2500 },
        { dimension: 'GC', value: rider.rider_ratings.gc, fullMark: 2500 },
        { dimension: 'One Day', value: rider.rider_ratings.one_day, fullMark: 2500 },
        { dimension: 'Endurance', value: rider.rider_ratings.endurance, fullMark: 2500 }
      ]
    : []

  const historyData = history?.map((h) => ({
    date: new Date(h.date).toLocaleDateString(),
    overall: h.ratings.overall || 1500,
    mountain: h.ratings.mountain || 1500,
    sprint: h.ratings.sprint || 1500
  })) || []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rider Profile</h1>
        <p className="text-gray-600">Detailed analysis of individual rider performance</p>
      </div>

      {/* Rider Selector */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Rider
        </label>
        <select
          value={selectedRiderId || ''}
          onChange={(e) => setSelectedRiderId(e.target.value ? Number(e.target.value) : null)}
          className="block w-full max-w-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
        >
          <option value="">Choose a rider...</option>
          {allRiders?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} {r.team ? `(${r.team})` : ''}
            </option>
          ))}
        </select>
      </div>

      {ridersLoading && (
        <div className="text-center text-gray-500 py-8">Loading riders...</div>
      )}

      {selectedRiderId && riderLoading && (
        <div className="text-center text-gray-500 py-8">Loading rider data...</div>
      )}

      {rider && (
        <div className="space-y-6">
          {/* Rider Info Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-4 mr-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{rider.name}</h2>
                  <div className="flex items-center gap-4 text-gray-600 mt-1">
                    {rider.team && <span>{rider.team}</span>}
                    {rider.country && <span>{rider.country}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {rider.rider_ratings?.overall || 1500}
                </div>
                <div className="text-sm text-gray-500">Overall Rating</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {rider.rider_ratings?.races_count || 0}
                </div>
                <div className="text-sm text-gray-500">Races</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {rider.rider_ratings?.wins_count || 0}
                </div>
                <div className="text-sm text-gray-500">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {rider.rider_ratings?.podiums_count || 0}
                </div>
                <div className="text-sm text-gray-500">Podiums</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {rider.rider_ratings?.races_count
                    ? Math.round(
                        ((rider.rider_ratings.wins_count || 0) /
                          rider.rider_ratings.races_count) *
                          100
                      )
                    : 0}%
                </div>
                <div className="text-sm text-gray-500">Win Rate</div>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Skill Profile
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={30} domain={[1000, 2500]} />
                  <Radar
                    name="Rating"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rating Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rating Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {radarData.map((item) => (
                <div key={item.dimension} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">{item.dimension}</div>
                  <div className="text-xl font-bold text-gray-900">{item.value}</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((item.value - 1000) / 1500) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating History Chart */}
          {historyData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Rating Evolution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1400, 1600]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="overall"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="Overall"
                    />
                    <Line
                      type="monotone"
                      dataKey="mountain"
                      stroke="#16a34a"
                      strokeWidth={2}
                      name="Mountain"
                    />
                    <Line
                      type="monotone"
                      dataKey="sprint"
                      stroke="#dc2626"
                      strokeWidth={2}
                      name="Sprint"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Results */}
          {rider.race_results && rider.race_results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Recent Results
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Race
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Position
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rider.race_results.slice(0, 10).map((result: any) => (
                      <tr key={result.id}>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                          {result.races?.name || 'Unknown Race'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {result.races?.date
                            ? new Date(result.races.date).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              result.position === 1
                                ? 'bg-yellow-100 text-yellow-800'
                                : result.position <= 3
                                ? 'bg-orange-100 text-orange-800'
                                : result.position <= 10
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {result.position}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedRiderId && !ridersLoading && (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Rider
          </h3>
          <p className="text-gray-500">
            Choose a rider from the dropdown above to view their detailed profile
          </p>
        </div>
      )}
    </div>
  )
}
