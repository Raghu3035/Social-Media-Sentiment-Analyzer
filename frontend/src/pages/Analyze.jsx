import { useState } from 'react'
import { analyzeComment } from '../services/api'
import SentimentResult from '../components/SentimentResult'
import toast from 'react-hot-toast'

const EXAMPLES = [
  "I absolutely love this product, it exceeded all expectations!",
  "This is the worst service I have ever experienced.",
  "The delivery was on time and the product is as described.",
  "Customer support was incredibly helpful and friendly.",
  "Very disappointed, the quality is terrible.",
]

export default function Analyze() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter a comment to analyze.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const data = await analyzeComment(text)
      setResult(data)
      toast.success('Analysis complete!')
    } catch (e) {
      toast.error('Failed to analyze. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAnalyze()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 slide-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Real-Time Analyzer</h1>
        <p className="text-gray-400 mt-1">Type or paste a comment to instantly detect its sentiment</p>
      </div>

      {/* Input card */}
      <div className="glass-card p-6 space-y-4">
        <label className="block text-sm font-medium text-gray-300">Enter Comment</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Type your comment here... (Ctrl+Enter to analyze)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 resize-none transition-all"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{text.length} / 5000 characters</span>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/40"
          >
            {loading ? <><div className="spinner" /> Analyzing...</> : '🔍 Analyze Sentiment'}
          </button>
        </div>
      </div>

      {/* Example buttons */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Quick Examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setText(ex); setResult(null) }}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-violet-500/40 transition-all truncate max-w-xs"
            >
              "{ex.slice(0, 45)}…"
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && <SentimentResult result={result} />}
    </div>
  )
}
