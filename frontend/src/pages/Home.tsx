import { Link } from 'react-router-dom'
import { Trophy, User, Database, BarChart3, Zap, Mountain, Timer, Target } from 'lucide-react'
import { useSystemStats } from '../hooks/useStats'

const features = [
  {
    icon: Zap,
    title: 'Flat',
    description: 'Performance on flat terrain'
  },
  {
    icon: Mountain,
    title: 'Mountain',
    description: 'Climbing ability'
  },
  {
    icon: Timer,
    title: 'Time Trial',
    description: 'Individual TT performance'
  },
  {
    icon: Target,
    title: 'Sprint',
    description: 'Sprint finishing ability'
  }
]

const quickLinks = [
  { to: '/rankings', icon: Trophy, label: 'View Rankings', color: 'bg-blue-500' },
  { to: '/rider', icon: User, label: 'Rider Profiles', color: 'bg-green-500' },
  { to: '/manage', icon: Database, label: 'Manage Data', color: 'bg-purple-500' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', color: 'bg-orange-500' }
]

export function Home() {
  const { data: stats } = useSystemStats()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Professional Cycling Rating System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track and rate professional cyclists across multiple performance dimensions
          using an ELO-like algorithm, similar to Pro Cycling Manager.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-3xl font-bold text-blue-600">{stats?.totalRiders ?? 0}</div>
          <div className="text-gray-600">Riders Tracked</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-3xl font-bold text-green-600">{stats?.totalRaces ?? 0}</div>
          <div className="text-gray-600">Races Analyzed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-3xl font-bold text-purple-600">{stats?.totalResults ?? 0}</div>
          <div className="text-gray-600">Results Processed</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow text-center"
            >
              <div className={`${link.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="font-medium text-gray-900">{link.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Rating Dimensions */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Dimensions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="text-center">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="font-medium text-gray-900">{feature.title}</div>
                <div className="text-sm text-gray-500">{feature.description}</div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">All 8 Dimensions:</h3>
          <div className="flex flex-wrap gap-2">
            {['Flat', 'Cobbles', 'Mountain', 'Time Trial', 'Sprint', 'GC', 'One Day', 'Endurance'].map((dim) => (
              <span key={dim} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {dim}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Add Riders</h3>
              <p className="text-gray-600">Create rider profiles with initial base ratings (1500)</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Add Races</h3>
              <p className="text-gray-600">Define races with characteristics (mountain, sprint, etc.)</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Record Results</h3>
              <p className="text-gray-600">Input race results with rider positions</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Update Ratings</h3>
              <p className="text-gray-600">Ratings automatically update based on ELO algorithm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
