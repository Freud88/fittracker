export default function TargetEditor({ targets, onChange }) {
  const fields = [
    { key: 'calories', label: 'Calorie giornaliere', unit: 'kcal', step: 50 },
    { key: 'protein', label: 'Proteine', unit: 'g', step: 5 },
    { key: 'carbs', label: 'Carboidrati', unit: 'g', step: 5 },
    { key: 'fat', label: 'Grassi', unit: 'g', step: 5 },
  ]

  return (
    <div className="space-y-3">
      {fields.map(({ key, label, unit, step }) => (
        <div key={key} className="bg-surface2 rounded-xl px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-text text-sm font-medium">{label}</label>
            <span className="text-text-muted text-xs">{unit}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChange({ ...targets, [key]: Math.max(0, targets[key] - step) })}
              className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-text text-lg active:bg-border"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={targets[key]}
              onChange={(e) => onChange({ ...targets, [key]: parseFloat(e.target.value) || 0 })}
              className="flex-1 text-center bg-surface border border-border rounded-lg py-2 text-text font-bold outline-none focus:border-accent-blue"
            />
            <button
              onClick={() => onChange({ ...targets, [key]: targets[key] + step })}
              className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-text text-lg active:bg-border"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
