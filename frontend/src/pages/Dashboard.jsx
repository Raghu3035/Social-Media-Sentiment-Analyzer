import { useEffect, useState, useCallback } from 'react'
import { getStatistics, getTrend, getKeywords, getResults } from '../services/api'
import SentimentPieChart from '../charts/SentimentPieChart'
import SentimentBarChart from '../charts/SentimentBarChart'
import SentimentLineChart from '../charts/SentimentLineChart'
import WordCloud from '../components/WordCloud'
import StatCard from '../components/StatCard'
import RecentComments from '../components/RecentComments'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [keywords, setKeywords] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, t, k, r] = await Promise.all([
        getStatistics(),
        getTrend(7),
        getKeywords(null, 30),
        getResults({ limit: 10 }),
      ])
      setStats(s)
      setTrend(t.trend || [])
      setKeywords(k.keywords || [])
      setRecent(r.results || [])
    } catch (e) {
      setError('Could not connect to the API. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // auto-refresh every 30s
    return () => clearInterval(interval)
  }, [load])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="spinner w-10 h-10" />
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400 text-lg mb-2">⚠️ {error}</p>
        <button onClick={load} className="mt-4 btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-8 slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Sentiment Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time overview of analyzed social media comments</p>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Analyzed" value={stats.total} icon="💬" color="violet" />
          <StatCard label="Positive" value={`${stats.positive_pct}%`} icon="😊" color="green" sub={`${stats.positive} comments`} />
          <StatCard label="Negative" value={`${stats.negative_pct}%`} icon="😞" color="red" sub={`${stats.negative} comments`} />
          <StatCard label="Neutral" value={`${stats.neutral_pct}%`} icon="😐" color="yellow" sub={`${stats.neutral} comments`} />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats && (
          <>
            <div className="glass-card p-5">
              <h3 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider">Distribution</h3>
              <SentimentPieChart stats={stats} />
            </div>
            <div className="glass-card p-5">
              <h3 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider">Count by Sentiment</h3>
              <SentimentBarChart stats={stats} />
            </div>
          </>
        )}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider">7-Day Trend</h3>
          {trend.length > 0 ? <SentimentLineChart data={trend} /> : (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
              No trend data yet. Analyze some comments!
            </div>
          )}
        </div>
      </div>

      {/* Word Cloud + Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider">Top Keywords</h3>
          {keywords.length > 0 ? <WordCloud keywords={keywords} /> : (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
              No keywords yet. Analyze some comments!
            </div>
          )}
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider">Recent Comments</h3>
          <RecentComments comments={recent} />
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg text-sm bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 transition-all"
        >
          🔄 Refresh Dashboard
        </button>
      </div>
    </div>
  )
}
