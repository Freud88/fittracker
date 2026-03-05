import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { formatDateShort } from '../../utils/dateUtils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {Math.round(p.value)}
          {p.dataKey.includes('cal') ? ' kcal' : 'g'}
        </p>
      ))}
    </div>
  )
}

export default function ProgressChart({ data, lines, title }) {
  const formatted = data.map((d) => ({
    ...d,
    date: formatDateShort(d.date),
  }))

  return (
    <div className="bg-surface rounded-xl p-4">
      <p className="text-text-muted text-xs uppercase tracking-wider mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#7A8499', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#7A8499', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {lines.map(({ key, color, name }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={name}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
