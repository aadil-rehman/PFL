import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import HomePage from './pages/HomePage'
import AreaTreesPage from './pages/AreaTreesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SubmitPanelProvider from './components/submit/SubmitPanelProvider'
import AuthProvider from './components/auth/AuthProvider'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <SubmitPanelProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/area/:id" element={<AreaTreesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </SubmitPanelProvider>
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  )
}
