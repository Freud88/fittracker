import { useState } from 'react'
import { getSuggestions } from '../../utils/suggestionEngine'
import SuggestionCard from './SuggestionCard'
import { Lightbulb, RefreshCw } from 'lucide-react'

export default function MealSuggestions({ remaining, onAdd }) {
  const [page, setPage] = useState(0)
  const suggestions = getSuggestions(remaining, undefined, page)

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-6 text-text-muted text-sm">
        Nessun suggerimento disponibile — hai quasi raggiunto i tuoi obiettivi!
      </div>
    )
  }

  const deficientMacro = remaining.protein > remaining.carbs && remaining.protein > remaining.fat
    ? `Proteine mancanti: ${Math.round(remaining.protein)}g`
    : remaining.carbs > remaining.fat
    ? `Carboidrati mancanti: ${Math.round(remaining.carbs)}g`
    : `Grassi mancanti: ${Math.round(remaining.fat)}g`

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-accent-gold" />
          <p className="text-text-muted text-xs">{deficientMacro} · Calorie rimaste: {Math.round(remaining.calories)}</p>
        </div>
        <button
          onClick={() => setPage(p => p + 1)}
          className="p-1.5 text-text-muted active:text-accent-blue rounded-lg active:bg-surface2"
          title="Altri suggerimenti"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} onAdd={onAdd} />
        ))}
      </div>
    </div>
  )
}
