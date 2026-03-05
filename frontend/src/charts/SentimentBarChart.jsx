import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = { Positive: '#34d399', Negative: '#f87171', Neutral: '#fbbf24' }

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-bold">{payload[0].value} comments</p>
      </div>
    )
  }
  return null
}

export default function SentimentBarChart({ stats }) {
  const data = [
    { name: 'Positive', count: stats.positive },
    { name: 'Negative', count: stats.negative },
    { name: 'Neutral',  count: stats.neutral  },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
