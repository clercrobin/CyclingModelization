import { Link } from 'react-router-dom'
import { Trophy, User, Database, BarChart3, Zap, Mountain, Timer, Target, Users, Cloud, Brain, Activity } from 'lucide-react'
import { useSystemStats } from '../hooks/useStats'
import { RATING_CATEGORIES } from '../types/database'

const featureCategories = [
  { icon: Activity, title: 'Power Profile', count: 6, color: 'bg-red-500' },
  { icon: Mountain, title: 'Terrain', count: 10, color: 'bg-green-500' },
  { icon: Target, title: 'Race Type', count: 11, color: 'bg-blue-500' },
  { icon: Trophy, title: 'Classics', count: 5, color: 'bg-yellow-500' },
  { icon: Brain, title: 'Tactical', count: 6, color: 'bg-purple-500' },
  { icon: Zap, title: 'Physical', count: 7, color: 'bg-orange-500' },
  { icon: Cloud, title: 'Weather', count: 4, color: 'bg-cyan-500' },
  { icon: Timer, title: 'Consistency', count: 4, color: 'bg-pink-500' },
  { icon: Users, title: 'Profile Scores', count: 8, color: 'bg-indigo-500' }
]

const quickLinks = [
  { to: '/rankings', icon: Trophy, label: 'View Rankings', color: 'bg-blue-500' },
  { to: '/rider', icon: User, label: 'Rider Profiles', color: 'bg-green-500' },
  { to: '/manage', icon: Database, label: 'Manage Data', color: 'bg-purple-500' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', color: 'bg-orange-500' }
]

export function Home() {
  const { data: stats } = useSystemStats()

  const totalDimensions = Object.values(RATING_CATEGORIES).reduce(
    (sum, cat) => sum + cat.dimensions.length,
    0
  ) + 1 // +1 for overall

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
          Inspired by BlackRock Aladdin's Multi-Factor Model
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pro Cycling Analytics Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The most comprehensive cyclist rating system ever built. Track professional cyclists
          across <span className="font-bold text-blue-600">{totalDimensions}+ performance dimensions</span> using
          an advanced ELO-based algorithm.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-3xl font-bold text-blue-600">{stats?.totalRiders ?? 50}</div>
          <div className="text-gray-600">Pro Riders</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-3xl font-bold text-green-600">{totalDimensions}</div>
          <div className="text-gray-600">Dimensions</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-3xl font-bold text-purple-600">9</div>
          <div className="text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-3xl font-bold text-orange-600">ELO</div>
          <div className="text-gray-600">Rating System</div>
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

      {/* Rating Categories Grid */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Multi-Factor Rating Model</h2>
        <p className="text-gray-600 mb-6">
          Like BlackRock's Aladdin system uses 2000+ risk factors for financial assets,
          our platform analyzes cyclists across comprehensive performance dimensions.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {featureCategories.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="text-center">
                <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="font-medium text-gray-900 text-sm">{feature.title}</div>
                <div className="text-xs text-gray-500">{feature.count} dims</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dimension Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Power Profile</h3>
          <div className="space-y-2">
            {RATING_CATEGORIES.power.dimensions.map((dim) => (
              <div key={dim.key} className="flex justify-between text-sm">
                <span className="text-gray-600">{dim.label}</span>
                <span className="text-gray-400">Rating</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-4">Profile Scores</h3>
          <div className="space-y-2">
            {RATING_CATEGORIES.profile.dimensions.map((dim) => (
              <div key={dim.key} className="flex justify-between text-sm">
                <span className="text-gray-600">{dim.label}</span>
                <span className="text-gray-400">Rating</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Scale */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border p-6 mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Rating Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-500">1200-1400</div>
            <div className="text-xs text-gray-500">Average Pro</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">1400-1600</div>
            <div className="text-xs text-gray-500">Good</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-600">1600-1800</div>
            <div className="text-xs text-gray-500">Top Tier</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">1800-2000</div>
            <div className="text-xs text-gray-500">World Class</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-600">2000-2200</div>
            <div className="text-xs text-gray-500">Best in World</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-pink-600">2200+</div>
            <div className="text-xs text-gray-500">GOAT Tier</div>
          </div>
        </div>
      </div>

      {/* Featured Riders */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">50 Pro Riders Included</h2>
          <Link to="/rankings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Rankings →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Tadej Pogačar', 'Jonas Vingegaard', 'Remco Evenepoel', 'Mathieu van der Poel',
            'Wout van Aert', 'Primož Roglič', 'Jasper Philipsen', 'Filippo Ganna'].map((name) => (
            <span key={name} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {name}
            </span>
          ))}
          <Link to="/rankings" className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            +42 more
          </Link>
        </div>
      </div>
    </div>
  )
}
