export default function MacroSummary({ totals, targets }) {
  const macros = [
    { label: 'P', value: totals.protein, target: targets.protein, color: '#3498DB' },
    { label: 'C', value: totals.carbs, target: targets.carbs, color: '#F9A825' },
    { label: 'G', value: totals.fat, target: targets.fat, color: '#2ECC71' },
  ]

  return (
    <div className="flex gap-3">
      {macros.map(({ label, value, target, color }) => (
        <div key={label} className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-muted font-medium">{label}</span>
            <span className="text-text">{Math.round(value)}g</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (value / target) * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
