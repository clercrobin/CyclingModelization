import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Rankings } from './pages/Rankings'
import { RiderProfile } from './pages/RiderProfile'
import { ManageData } from './pages/ManageData'
import { Analytics } from './pages/Analytics'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Get base URL for GitHub Pages
const basename = import.meta.env.BASE_URL || '/'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="rankings" element={<Rankings />} />
            <Route path="rider" element={<RiderProfile />} />
            <Route path="manage" element={<ManageData />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
