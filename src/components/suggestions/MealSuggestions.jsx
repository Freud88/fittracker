import { getSuggestions } from '../../utils/suggestionEngine'
import SuggestionCard from './SuggestionCard'
import { Lightbulb } from 'lucide-react'

export default function MealSuggestions({ remaining, onAdd }) {
  const suggestions = getSuggestions(remaining)

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
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-accent-gold" />
        <p className="text-text-muted text-xs">{deficientMacro} · Calorie rimaste: {Math.round(remaining.calories)}</p>
      </div>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} onAdd={onAdd} />
        ))}
      </div>
    </div>
  )
}
