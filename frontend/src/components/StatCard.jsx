const COLOR_MAP = {
  violet: 'from-violet-600/20 to-violet-900/10 border-violet-500/20',
  green:  'from-green-600/20 to-green-900/10 border-green-500/20',
  red:    'from-red-600/20 to-red-900/10 border-red-500/20',
  yellow: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/20',
}

export default function StatCard({ label, value, icon, color = 'violet', sub }) {
  return (
    <div className={`glass-card p-5 bg-gradient-to-br border ${COLOR_MAP[color] || COLOR_MAP.violet}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}
