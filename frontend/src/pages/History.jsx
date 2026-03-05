import { useEffect, useState } from 'react'
import { getResults } from '../services/api'

const FILTERS = ['all', 'positive', 'negative', 'neutral']

const SENTIMENT_STYLES = {
  positive: 'bg-green-900/20 text-green-400 border-green-500/30',
  negative: 'bg-red-900/20 text-red-400 border-red-500/30',
  neutral:  'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
}
const EMOJI = { positive: '😊', negative: '😞', neutral: '😐' }

export default function History() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const PER_PAGE = 20

  const load = async (sentiment, skip) => {
    setLoading(true)
    try {
      const params = { limit: PER_PAGE, skip }
      if (sentiment !== 'all') params.sentiment = sentiment
      const data = await getResults(params)
      setLogs(data.results || [])
    } catch (e) {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    load(filter, 0)
  }, [filter])

  useEffect(() => {
    load(filter, page * PER_PAGE)
  }, [page])

  return (
    <div className="space-y-6 slide-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Analysis History</h1>
        <p className="text-gray-400 mt-1">Browse all stored sentiment analysis results</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize border ${
              filter === f
                ? 'bg-violet-600/30 text-violet-300 border-violet-500/50'
                : 'text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'all' ? '🔎 All' : `${EMOJI[f]} ${f}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400 uppercase text-xs tracking-wider">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Sentiment</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner" /> Loading...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No results found. Analyze some comments first!
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={log.id || i}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">{page * PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3 text-gray-200 max-w-xs">
                      <span className="block truncate" title={log.comment}>{log.comment}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${SENTIMENT_STYLES[log.sentiment] || ''}`}>
                        {EMOJI[log.sentiment]} {log.sentiment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-1.5 w-16">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                            style={{ width: `${Math.round((log.confidence || 0) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {Math.round((log.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${log.source === 'csv' ? 'bg-blue-900/30 text-blue-400' : 'bg-violet-900/30 text-violet-400'}`}>
                        {log.source || 'manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <span className="text-xs text-gray-500">Page {page + 1}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={logs.length < PER_PAGE}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
