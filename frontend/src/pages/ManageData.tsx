import { useState } from 'react'
import { useAddRider, useAllRiders } from '../hooks/useRiders'
import { useAllRaces, useAddRace, useAddRaceResult, useUpdateRatings, RACE_TEMPLATES } from '../hooks/useRaces'
import type { RaceCategory, RaceCharacteristics } from '../types/database'
import { Plus, Upload, RefreshCw, Check, AlertCircle } from 'lucide-react'

type TabType = 'riders' | 'races' | 'results' | 'update'

const categories: { value: RaceCategory; label: string }[] = [
  { value: 'GT', label: 'Grand Tour' },
  { value: 'Monument', label: 'Monument' },
  { value: 'WC', label: 'World Championship' },
  { value: 'WT', label: 'World Tour' },
  { value: 'ProSeries', label: 'Pro Series' },
  { value: 'Others', label: 'Others' }
]

const CHARACTERISTIC_FIELDS = [
  { key: 'terrain_flat_weight', label: 'Flat' },
  { key: 'terrain_cobbles_weight', label: 'Cobbles' },
  { key: 'terrain_long_climbs_weight', label: 'Climbing' },
  { key: 'race_sprint_finish_weight', label: 'Sprint' },
  { key: 'power_threshold_20m_weight', label: 'TT' },
  { key: 'power_endurance_2h_weight', label: 'Endurance' }
] as const

export function ManageData() {
  const [activeTab, setActiveTab] = useState<TabType>('riders')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Data</h1>
        <p className="text-gray-600">Add and manage riders, races, and results</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { id: 'riders', label: 'Add Rider' },
              { id: 'races', label: 'Add Race' },
              { id: 'results', label: 'Add Results' },
              { id: 'update', label: 'Update Ratings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'riders' && <AddRiderForm />}
          {activeTab === 'races' && <AddRaceForm />}
          {activeTab === 'results' && <AddResultsForm />}
          {activeTab === 'update' && <UpdateRatingsForm />}
        </div>
      </div>
    </div>
  )
}

function AddRiderForm() {
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [country, setCountry] = useState('')
  const [success, setSuccess] = useState(false)

  const addRider = useAddRider()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addRider.mutateAsync({ name, team: team || undefined, country: country || undefined })
      setName('')
      setTeam('')
      setCountry('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to add rider:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rider Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          placeholder="e.g., Tadej Pogacar"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Team
        </label>
        <input
          type="text"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          placeholder="e.g., UAE Team Emirates"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          placeholder="e.g., Slovenia"
        />
      </div>

      {success && (
        <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <Check className="h-4 w-4 mr-2" />
          Rider added successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={addRider.isPending}
        className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4 mr-2" />
        {addRider.isPending ? 'Adding...' : 'Add Rider'}
      </button>
    </form>
  )
}

function AddRaceForm() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState<RaceCategory>('Others')
  const [country, setCountry] = useState('')
  const [template, setTemplate] = useState('')
  const [characteristics, setCharacteristics] = useState<Partial<RaceCharacteristics>>({
    terrain_flat_weight: 0,
    terrain_cobbles_weight: 0,
    terrain_long_climbs_weight: 0,
    race_sprint_finish_weight: 0,
    power_threshold_20m_weight: 0,
    power_endurance_2h_weight: 0
  })
  const [success, setSuccess] = useState(false)

  const addRace = useAddRace()

  const handleTemplateChange = (templateName: string) => {
    setTemplate(templateName)
    if (templateName && RACE_TEMPLATES[templateName]) {
      setCharacteristics(RACE_TEMPLATES[templateName])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addRace.mutateAsync({
        name,
        date,
        category,
        country: country || undefined,
        characteristics
      })
      setName('')
      setDate('')
      setCategory('Others')
      setCountry('')
      setTemplate('')
      setCharacteristics({
        terrain_flat_weight: 0,
        terrain_cobbles_weight: 0,
        terrain_long_climbs_weight: 0,
        race_sprint_finish_weight: 0,
        power_threshold_20m_weight: 0,
        power_endurance_2h_weight: 0
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to add race:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Race Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            placeholder="e.g., Tour de France Stage 15"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as RaceCategory)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            placeholder="e.g., France"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Race Template
        </label>
        <select
          value={template}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
        >
          <option value="">Custom characteristics...</option>
          {Object.keys(RACE_TEMPLATES).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Race Characteristics
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CHARACTERISTIC_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-xs text-gray-500 mb-1">
                {field.label}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={(characteristics[field.key as keyof RaceCharacteristics] as number) || 0}
                onChange={(e) =>
                  setCharacteristics({
                    ...characteristics,
                    [field.key]: parseFloat(e.target.value)
                  })
                }
                className="w-full"
              />
              <div className="text-xs text-center text-gray-600">
                {(characteristics[field.key as keyof RaceCharacteristics] as number) || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {success && (
        <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <Check className="h-4 w-4 mr-2" />
          Race added successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={addRace.isPending}
        className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4 mr-2" />
        {addRace.isPending ? 'Adding...' : 'Add Race'}
      </button>
    </form>
  )
}

function AddResultsForm() {
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null)
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null)
  const [position, setPosition] = useState('')
  const [batchResults, setBatchResults] = useState('')
  const [success, setSuccess] = useState(false)

  const { data: races } = useAllRaces()
  const { data: riders } = useAllRiders()
  const addResult = useAddRaceResult()

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRaceId || !selectedRiderId) return

    try {
      await addResult.mutateAsync({
        race_id: selectedRaceId,
        rider_id: selectedRiderId,
        position: parseInt(position)
      })
      setSelectedRiderId(null)
      setPosition('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to add result:', error)
    }
  }

  const handleBatchSubmit = async () => {
    if (!selectedRaceId || !batchResults.trim()) return

    const lines = batchResults.trim().split('\n')
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim())
      if (parts.length >= 2) {
        const pos = parseInt(parts[0])
        const riderName = parts[1]
        const rider = riders?.find(
          (r) => r.name.toLowerCase() === riderName.toLowerCase()
        )
        if (rider && !isNaN(pos)) {
          try {
            await addResult.mutateAsync({
              race_id: selectedRaceId,
              rider_id: rider.id,
              position: pos
            })
          } catch (error) {
            console.error(`Failed to add result for ${riderName}:`, error)
          }
        }
      }
    }
    setBatchResults('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Race *
        </label>
        <select
          value={selectedRaceId || ''}
          onChange={(e) => setSelectedRaceId(e.target.value ? Number(e.target.value) : null)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
        >
          <option value="">Choose a race...</option>
          {races?.map((race) => (
            <option key={race.id} value={race.id}>
              {race.name} ({new Date(race.date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {selectedRaceId && (
        <>
          {/* Single Result */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Add Single Result</h4>
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rider *
                  </label>
                  <select
                    value={selectedRiderId || ''}
                    onChange={(e) => setSelectedRiderId(e.target.value ? Number(e.target.value) : null)}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  >
                    <option value="">Choose a rider...</option>
                    {riders?.map((rider) => (
                      <option key={rider.id} value={rider.id}>
                        {rider.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                    placeholder="1"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={addResult.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </button>
            </form>
          </div>

          {/* Batch Import */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Batch Import Results</h4>
            <p className="text-sm text-gray-500 mb-2">
              Enter results in CSV format: position,rider_name
            </p>
            <textarea
              value={batchResults}
              onChange={(e) => setBatchResults(e.target.value)}
              rows={6}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border font-mono text-sm"
              placeholder={`1,Tadej Pogacar\n2,Jonas Vingegaard\n3,Primoz Roglic`}
            />
            <button
              type="button"
              onClick={handleBatchSubmit}
              disabled={!batchResults.trim()}
              className="mt-3 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Batch Results
            </button>
          </div>
        </>
      )}

      {success && (
        <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <Check className="h-4 w-4 mr-2" />
          Results added successfully!
        </div>
      )}
    </div>
  )
}

function UpdateRatingsForm() {
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: races } = useAllRaces()
  const updateRatings = useUpdateRatings()

  const handleUpdate = async () => {
    if (!selectedRaceId) return

    setError(null)
    try {
      await updateRatings.mutateAsync(selectedRaceId)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ratings'
      setError(errorMessage)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Race to Update Ratings
        </label>
        <select
          value={selectedRaceId || ''}
          onChange={(e) => setSelectedRaceId(e.target.value ? Number(e.target.value) : null)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
        >
          <option value="">Choose a race...</option>
          {races?.map((race) => (
            <option key={race.id} value={race.id}>
              {race.name} ({new Date(race.date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">How Rating Updates Work</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Ratings are calculated using an ELO-like algorithm</li>
          <li>Each race dimension affects the corresponding rider ratings</li>
          <li>Race importance (GT, Monument, etc.) affects the magnitude of changes</li>
          <li>Win/loss ratios are tracked automatically</li>
        </ul>
      </div>

      {error && (
        <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <Check className="h-4 w-4 mr-2" />
          Ratings updated successfully!
        </div>
      )}

      <button
        type="button"
        onClick={handleUpdate}
        disabled={!selectedRaceId || updateRatings.isPending}
        className="flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${updateRatings.isPending ? 'animate-spin' : ''}`} />
        {updateRatings.isPending ? 'Updating...' : 'Update Ratings'}
      </button>
    </div>
  )
}
