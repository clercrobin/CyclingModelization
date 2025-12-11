import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  Home,
  Trophy,
  User,
  Database,
  BarChart3,
  Bike
} from 'lucide-react'
import { useSystemStats } from '../hooks/useStats'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/rankings', label: 'Rankings', icon: Trophy },
  { path: '/rider', label: 'Rider Profile', icon: User },
  { path: '/manage', label: 'Manage Data', icon: Database },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Layout() {
  const location = useLocation()
  const { data: stats } = useSystemStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Bike className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Cycling Rating System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Stats */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] p-4 hidden lg:block">
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Riders</span>
                  <span className="font-semibold">{stats?.totalRiders ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Races</span>
                  <span className="font-semibold">{stats?.totalRaces ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Results</span>
                  <span className="font-semibold">{stats?.totalResults ?? 0}</span>
                </div>
              </div>
            </div>

            {stats?.topRatedRider && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Top Rated Rider
                </h3>
                <p className="font-semibold text-gray-900">
                  {stats.topRatedRider.name}
                </p>
                <p className="text-sm text-gray-600">
                  Rating: {stats.topRatedRider.rating}
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-sm text-gray-600">
                This rating system uses an ELO-like algorithm to rate cyclists across 8 dimensions.
              </p>
              <p className="text-xs text-gray-400 mt-2">Version 2.0.0</p>
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
