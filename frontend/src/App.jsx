import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import Upload from './pages/Upload'
import History from './pages/History'

const NAV = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/analyze', label: '🔍 Analyze' },
  { to: '/upload', label: '📁 Upload CSV' },
  { to: '/history', label: '🕐 History' },
]

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10 rounded-none px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-lg">
              🧠
            </div>
            <span className="font-bold text-lg gradient-text tracking-tight">
              SentiScope
            </span>
          </div>
          <nav className="flex gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      <footer className="text-center text-xs text-gray-600 py-4">
        SentiScope — Social Media Sentiment Analyzer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
