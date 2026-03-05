import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function SentimentLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.slice(5)} // show MM-DD
        />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-gray-300 capitalize">{value}</span>}
        />
        <Line type="monotone" dataKey="positive" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Positive" animationDuration={800} />
        <Line type="monotone" dataKey="negative" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Negative" animationDuration={800} />
        <Line type="monotone" dataKey="neutral"  stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} name="Neutral"  animationDuration={800} />
      </LineChart>
    </ResponsiveContainer>
  )
}
