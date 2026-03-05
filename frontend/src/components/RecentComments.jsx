const EMOJI = { positive: '😊', negative: '😞', neutral: '😐' }
const COLOR = {
  positive: 'text-green-400',
  negative: 'text-red-400',
  neutral:  'text-yellow-400',
}

export default function RecentComments({ comments }) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-8">
        No comments yet. Start analyzing!
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {comments.map((c, i) => (
        <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-white/4 hover:bg-white/7 transition-colors">
          <span className="text-lg flex-shrink-0">{EMOJI[c.sentiment] || '💬'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200 truncate" title={c.comment}>{c.comment}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium capitalize ${COLOR[c.sentiment] || 'text-gray-400'}`}>
                {c.sentiment}
              </span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">
                {Math.round((c.confidence || 0) * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
