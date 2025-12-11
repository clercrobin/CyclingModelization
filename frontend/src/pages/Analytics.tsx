import { useState } from 'react'
import { useRatingDistribution, useDimensionCorrelation, useSystemStats } from '../hooks/useStats'
import { useTopRiders } from '../hooks/useRiders'
import { useAnalyzeText, useBatchImport, SAMPLE_RACE_REPORT, SAMPLE_BATCH_IMPORT } from '../hooks/useAnalytics'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { TrendingUp, Users, Trophy, BarChart3, Brain, FileText, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function Analytics() {
  const { data: stats } = useSystemStats()
  const { data: distribution } = useRatingDistribution()
  const { data: correlation } = useDimensionCorrelation()
  const { data: topRiders } = useTopRiders('overall', 10)

  // Text analysis state
  const [analysisText, setAnalysisText] = useState('')
  const [sourceType, setSourceType] = useState<'report' | 'news' | 'comment' | 'social'>('report')
  const [applyUpdates, setApplyUpdates] = useState(false)
  const analyzeText = useAnalyzeText()

  // Batch import state
  const [importJson, setImportJson] = useState('')
  const batchImport = useBatchImport()

  const handleAnalyze = () => {
    if (!analysisText.trim()) return
    analyzeText.mutate({
      text: analysisText,
      source_type: sourceType,
      apply_updates: applyUpdates,
      confidence_threshold: 0.5
    })
  }

  const handleLoadSample = () => {
    setAnalysisText(SAMPLE_RACE_REPORT)
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importJson)
      batchImport.mutate(data)
    } catch {
      alert('Invalid JSON format')
    }
  }

  const handleLoadSampleImport = () => {
    setImportJson(JSON.stringify(SAMPLE_BATCH_IMPORT, null, 2))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & AI Engine</h1>
        <p className="text-gray-600">Multi-factor rating model with NLP-powered trait extraction</p>
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
              <div className="text-2xl font-bold text-gray-900">65+</div>
              <div className="text-sm text-gray-500">Dimensions</div>
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

      {/* NLP Text Analysis */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex items-center mb-4">
          <Brain className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">NLP Text Analysis Engine</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Extract rider traits from race reports, news articles, and comments. The AI analyzes text to identify
          performance indicators across 65+ dimensions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleLoadSample}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Load Sample Report
              </button>
            </div>
            <textarea
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              placeholder="Paste race report, news article, or commentary here..."
              className="w-full h-48 p-3 border rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as typeof sourceType)}
                  className="border rounded px-3 py-1.5 text-sm"
                >
                  <option value="report">Race Report</option>
                  <option value="news">News Article</option>
                  <option value="comment">Comment</option>
                  <option value="social">Social Media</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={applyUpdates}
                    onChange={(e) => setApplyUpdates(e.target.checked)}
                    className="rounded"
                  />
                  Apply rating updates
                </label>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzeText.isPending || !analysisText.trim()}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {analyzeText.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                  Analyze Text
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-80">
            <h4 className="font-medium text-gray-700 mb-2">Analysis Results</h4>
            {analyzeText.data ? (
              <div className="text-sm space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Found <strong>{analyzeText.data.riders_found}</strong> riders, <strong>{analyzeText.data.total_extractions}</strong> trait extractions</span>
                </div>

                {analyzeText.data.adjustments.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-600 mt-3 mb-2">Extracted Traits:</h5>
                    {analyzeText.data.adjustments.slice(0, 5).map((adj, i) => (
                      <div key={i} className="bg-white rounded p-2 mb-2 border">
                        <div className="font-medium text-gray-800">{adj.riderName}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {adj.dimensions.slice(0, 5).map((d, j) => (
                            <span
                              key={j}
                              className={`px-2 py-0.5 rounded text-xs ${
                                d.direction === 'positive'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {d.dimension}: {d.adjustment > 0 ? '+' : ''}{d.adjustment}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {analyzeText.data.applied_updates.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-3">
                    <h5 className="font-medium text-green-700">Updates Applied:</h5>
                    {analyzeText.data.applied_updates.map((u, i) => (
                      <div key={i} className="text-green-600 text-xs">
                        {u.riderName}: {u.overallChange > 0 ? '+' : ''}{u.overallChange} ({u.dimensionsUpdated.length} dims)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : analyzeText.error ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Error: {(analyzeText.error as Error).message}</span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Paste text and click "Analyze" to extract rider traits. The engine identifies mentions of riders
                and extracts performance indicators based on context.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Batch Import */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex items-center mb-4">
          <Upload className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Batch Race Import</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Import race results in JSON format. The system will create riders/races as needed and process ratings automatically.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleLoadSampleImport}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Load Sample Import
              </button>
            </div>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='{"source": "...", "races": [...]}'
              className="w-full h-48 p-3 border rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleImport}
              disabled={batchImport.isPending || !importJson.trim()}
              className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {batchImport.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import Races
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Import Results</h4>
            {batchImport.data ? (
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Import completed successfully</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-blue-600">{batchImport.data.stats.races_processed}</div>
                    <div className="text-xs text-gray-500">Races Processed</div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-green-600">{batchImport.data.stats.races_created}</div>
                    <div className="text-xs text-gray-500">Races Created</div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-purple-600">{batchImport.data.stats.riders_created}</div>
                    <div className="text-xs text-gray-500">Riders Created</div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-orange-600">{batchImport.data.stats.results_imported}</div>
                    <div className="text-xs text-gray-500">Results Imported</div>
                  </div>
                </div>
                {batchImport.data.stats.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                    <h5 className="font-medium text-red-700">Errors:</h5>
                    {batchImport.data.stats.errors.map((e, i) => (
                      <div key={i} className="text-red-600 text-xs">{e}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : batchImport.error ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Error: {(batchImport.error as Error).message}</span>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                <p className="mb-2">Expected JSON format:</p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
{`{
  "source": "Import name",
  "races": [{
    "name": "Race Name",
    "date": "2024-07-20",
    "category": "WT",
    "results": [
      {"rider_name": "...", "position": 1}
    ]
  }]
}`}
                </pre>
              </div>
            )}
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
            Average Rating by Profile
          </h3>
          <div className="h-80">
            {correlation && correlation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={correlation}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={30} domain={[1400, 2000]} />
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
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[1800, 2400]} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
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

        {/* Algorithm Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FileText className="inline h-5 w-5 mr-2" />
            Multi-Factor Rating Model
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-800">ELO-Based System</h4>
              <p className="text-blue-600 text-xs mt-1">
                Head-to-head comparisons for races &lt;50 riders, batch mode for larger fields.
                K-factor adjusted by race importance and dimension relevance.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-green-800">65+ Dimensions</h4>
              <p className="text-green-600 text-xs mt-1">
                Power (6), Terrain (10), Race Type (11), Classics (5), Tactical (6),
                Physical (7), Weather (4), Consistency (4), Profile Scores (8).
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-purple-800">NLP Trait Extraction</h4>
              <p className="text-purple-600 text-xs mt-1">
                Analyzes race reports and news to extract rider traits using keyword matching
                and sentiment analysis across all dimensions.
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <h4 className="font-medium text-orange-800">Auto-Inference</h4>
              <p className="text-orange-600 text-xs mt-1">
                Race characteristics auto-inferred from race name, terrain, elevation,
                and finish type when not manually specified.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Scale */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rating Scale (ELO-based)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { range: '1000-1400', level: 'Avg Pro', color: 'bg-gray-100 text-gray-800' },
            { range: '1400-1600', level: 'Good', color: 'bg-blue-100 text-blue-800' },
            { range: '1600-1800', level: 'Top Tier', color: 'bg-green-100 text-green-800' },
            { range: '1800-2000', level: 'World Class', color: 'bg-yellow-100 text-yellow-800' },
            { range: '2000-2200', level: 'Best in World', color: 'bg-orange-100 text-orange-800' },
            { range: '2200+', level: 'GOAT Tier', color: 'bg-purple-100 text-purple-800' }
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
