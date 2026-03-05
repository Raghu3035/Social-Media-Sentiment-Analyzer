export default function WordCloud({ keywords }) {
  if (!keywords || keywords.length === 0) return null

  const maxCount = Math.max(...keywords.map((k) => k.count))
  const minCount = Math.min(...keywords.map((k) => k.count))

  const colors = [
    'text-violet-300', 'text-blue-300', 'text-indigo-300',
    'text-purple-300', 'text-cyan-300', 'text-fuchsia-300',
    'text-sky-300', 'text-teal-300',
  ]

  const getFontSize = (count) => {
    const range = maxCount - minCount || 1
    const normalized = (count - minCount) / range // 0 to 1
    return 12 + normalized * 26 // 12px to 38px
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center py-4 min-h-[140px]">
      {keywords.map((kw, i) => (
        <span
          key={kw.word}
          title={`${kw.word}: ${kw.count} occurrences`}
          className={`font-semibold cursor-default hover:opacity-70 transition-opacity ${colors[i % colors.length]}`}
          style={{ fontSize: `${getFontSize(kw.count)}px` }}
        >
          {kw.word}
        </span>
      ))}
    </div>
  )
}
