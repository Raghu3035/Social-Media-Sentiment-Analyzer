const SENTIMENT_CONFIG = {
  positive: {
    emoji: '😊',
    label: 'Positive',
    color: 'text-green-400',
    bg: 'bg-green-900/20 border-green-500/30',
    bar: 'bg-green-400',
  },
  negative: {
    emoji: '😞',
    label: 'Negative',
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-500/30',
    bar: 'bg-red-400',
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20 border-yellow-500/30',
    bar: 'bg-yellow-400',
  },
}

export default function SentimentResult({ result }) {
  if (!result) return null
  const cfg = SENTIMENT_CONFIG[result.sentiment] || SENTIMENT_CONFIG.neutral
  const confPct = Math.round((result.confidence || 0) * 100)

  return (
    <div className={`glass-card p-6 border ${cfg.bg} slide-up`}>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl">{cfg.emoji}</span>
        <div>
          <p className="text-sm text-gray-400">Detected Sentiment</p>
          <p className={`text-3xl font-bold ${cfg.color} capitalize`}>{cfg.label}</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Confidence Score</span>
          <span className="font-semibold text-white">{confPct}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${cfg.bar} transition-all duration-700`}
            style={{ width: `${confPct}%` }}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400">Compound</p>
          <p className="text-lg font-bold text-white">{result.compound?.toFixed(3)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400">Polarity</p>
          <p className="text-lg font-bold text-white">{result.polarity?.toFixed(3)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400">Subjectivity</p>
          <p className="text-lg font-bold text-white">{result.subjectivity?.toFixed(3)}</p>
        </div>
      </div>

      {/* Processed text */}
      {result.processed_text && (
        <div className="mt-4 p-3 bg-black/20 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Preprocessed Text</p>
          <p className="text-sm text-gray-300 font-mono">{result.processed_text}</p>
        </div>
      )}
    </div>
  )
}
