import { Check, RefreshCw, Edit3, AlertCircle } from 'lucide-react'

const catLabels = { breakfast: 'Colaz.', lunch: 'Pranzo', snack: 'Snack', dinner: 'Cena' }

function StatusIcon({ meal }) {
  if (!meal) return <AlertCircle size={12} className="text-text-dim" />
  if (meal.eaten && !meal.actual) return <Check size={12} className="text-accent-green" />
  if (meal.actual) return <Edit3 size={12} className="text-accent-gold" />
  if (meal.adjusted) return <RefreshCw size={12} className="text-accent-blue" />
  return null
}

export default function MealCell({ meal, category, isToday, isPast, onTap }) {
  const empty = !meal

  return (
    <button
      onClick={() => !empty && onTap()}
      className={`w-full rounded-lg p-2 text-left transition-colors min-h-[72px] flex flex-col justify-between
        ${isToday ? 'border border-accent-blue/40' : ''}
        ${meal?.eaten ? 'bg-accent-green/10' : meal?.actual ? 'bg-accent-gold/10' : 'bg-surface2'}
        ${empty ? 'opacity-40 cursor-default' : 'active:bg-border'}`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-text-dim text-[9px] uppercase leading-none">{catLabels[category]}</span>
        <StatusIcon meal={meal} />
      </div>

      {meal ? (
        <>
          <p className="text-text text-[11px] font-medium leading-tight line-clamp-2 flex-1">
            {meal.name}
          </p>
          <div className="mt-1">
            <span className="text-accent-red text-[10px] font-semibold">{meal.calories} </span>
            <span className="text-text-dim text-[9px]">P{Math.round(meal.protein)}</span>
          </div>
        </>
      ) : (
        <p className="text-text-dim text-[10px]">—</p>
      )}
    </button>
  )
}
