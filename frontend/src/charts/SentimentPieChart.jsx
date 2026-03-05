import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = {
  positive: '#34d399',
  negative: '#f87171',
  neutral:  '#fbbf24',
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0]
    return (
      <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-gray-400 capitalize">{name}</p>
        <p className="text-white font-bold">{value} comments</p>
      </div>
    )
  }
  return null
}

export default function SentimentPieChart({ stats }) {
  const data = [
    { name: 'Positive', value: stats.positive },
    { name: 'Negative', value: stats.negative },
    { name: 'Neutral',  value: stats.neutral  },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name.toLowerCase()]}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
