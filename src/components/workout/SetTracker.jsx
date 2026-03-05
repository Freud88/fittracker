import { Check } from 'lucide-react'

export default function SetTracker({ sets, exerciseId, onUpdate, unit = 'kg' }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 text-center">
        <span className="text-text-dim text-xs">Set</span>
        <span className="text-text-dim text-xs">Rip.</span>
        <span className="text-text-dim text-xs">{unit === 'sec' ? 'Sec' : unit === 'min' ? 'Min' : 'Kg'}</span>
        <span></span>
      </div>
      {sets.map((set, i) => (
        <div key={i} className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 items-center">
          <span className="text-text-muted text-xs text-center">{i + 1}</span>
          <input
            type="number"
            inputMode="numeric"
            value={set.reps}
            onChange={(e) => onUpdate(exerciseId, i, { reps: parseInt(e.target.value) || 0 })}
            className={`text-center rounded-lg py-2 text-sm font-medium outline-none border ${
              set.completed
                ? 'bg-accent-green/20 border-accent-green/40 text-accent-green'
                : 'bg-surface2 border-border text-text'
            }`}
          />
          <input
            type="number"
            inputMode="decimal"
            value={set.weight}
            onChange={(e) => onUpdate(exerciseId, i, { weight: parseFloat(e.target.value) || 0 })}
            className={`text-center rounded-lg py-2 text-sm font-medium outline-none border ${
              set.completed
                ? 'bg-accent-green/20 border-accent-green/40 text-accent-green'
                : 'bg-surface2 border-border text-text'
            }`}
          />
          <button
            onClick={() => onUpdate(exerciseId, i, { completed: !set.completed })}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              set.completed ? 'bg-accent-green text-white' : 'bg-surface2 text-text-dim'
            }`}
          >
            <Check size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
