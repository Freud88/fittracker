import { Plus } from 'lucide-react'

export default function SuggestionCard({ suggestion, onAdd }) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 mr-2">
          <h3 className="text-text font-semibold text-sm leading-tight">{suggestion.name}</h3>
          <p className="text-text-muted text-xs mt-0.5">{suggestion.description}</p>
        </div>
        <button
          onClick={() => onAdd(suggestion)}
          className="shrink-0 w-9 h-9 rounded-full bg-accent-green/20 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus size={18} className="text-accent-green" />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-2">
        {suggestion.ingredients.map((ing, i) => (
          <span key={i} className="text-[10px] bg-surface2 text-text-muted px-2 py-0.5 rounded-full">
            {ing}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 text-center bg-surface2 rounded-lg py-2">
        {[
          { label: 'Kcal', v: suggestion.calories, color: '#F4522A' },
          { label: 'Prot', v: suggestion.protein, color: '#3498DB' },
          { label: 'Carb', v: suggestion.carbs, color: '#F9A825' },
          { label: 'Gras', v: suggestion.fat, color: '#2ECC71' },
        ].map(({ label, v, color }) => (
          <div key={label}>
            <p className="text-xs font-bold" style={{ color }}>{Math.round(v)}</p>
            <p className="text-[9px] text-text-dim">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
