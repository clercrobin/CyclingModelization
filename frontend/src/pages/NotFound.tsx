import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-white rounded-xl shadow-sm border p-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-medium text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
