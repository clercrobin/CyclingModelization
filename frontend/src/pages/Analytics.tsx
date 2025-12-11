import { useRatingDistribution, useDimensionCorrelation, useSystemStats } from '../hooks/useStats'
import { useTopRiders } from '../hooks/useRiders'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { TrendingUp, Users, Trophy, BarChart3 } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function Analytics() {
  const { data: stats } = useSystemStats()
  const { data: distribution } = useRatingDistribution()
  const { data: correlation } = useDimensionCorrelation()
  const { data: topRiders } = useTopRiders('overall', 10)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">System-wide performance insights and statistics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalRiders ?? 0}
              </div>
              <div className="text-sm text-gray-500">Total Riders</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalRaces ?? 0}
              </div>
              <div className="text-sm text-gray-500">Total Races</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalResults ?? 0}
              </div>
              <div className="text-sm text-gray-500">Race Results</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-full p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.avgRating ?? 1500}
              </div>
              <div className="text-sm text-gray-500">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="h-80">
            {distribution && distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Dimension Averages */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Average Rating by Dimension
          </h3>
          <div className="h-80">
            {correlation && correlation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={correlation}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={30} domain={[1400, 1600]} />
                  <Radar
                    name="Average"
                    dataKey="average"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Riders Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 Riders by Overall Rating
          </h3>
          <div className="h-80">
            {topRiders && topRiders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topRiders}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[1400, 1600]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Win Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Win Distribution (Top 10)
          </h3>
          <div className="h-80">
            {topRiders && topRiders.some((r) => r.wins > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topRiders
                      .filter((r) => r.wins > 0)
                      .map((r) => ({ name: r.name, wins: r.wins }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="wins"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {topRiders
                      .filter((r) => r.wins > 0)
                      .map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No wins recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Interpretation Guide */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rating Interpretation Guide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { range: '1000-1300', level: 'Amateur/Dev', color: 'bg-gray-100 text-gray-800' },
            { range: '1300-1500', level: 'Professional', color: 'bg-blue-100 text-blue-800' },
            { range: '1500-1700', level: 'Strong Pro', color: 'bg-green-100 text-green-800' },
            { range: '1700-1900', level: 'Top Tier', color: 'bg-yellow-100 text-yellow-800' },
            { range: '1900-2100', level: 'World Class', color: 'bg-orange-100 text-orange-800' },
            { range: '2100+', level: 'Exceptional', color: 'bg-purple-100 text-purple-800' }
          ].map((item) => (
            <div
              key={item.range}
              className={`${item.color} rounded-lg p-4 text-center`}
            >
              <div className="font-bold">{item.range}</div>
              <div className="text-sm">{item.level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
