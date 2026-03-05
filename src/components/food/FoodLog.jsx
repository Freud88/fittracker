import { Trash2 } from 'lucide-react'

const categoryColors = {
  colazione: '#F9A825',
  pranzo: '#3498DB',
  cena: '#2ECC71',
  spuntino: '#F4522A',
  'post-workout': '#9B59B6',
}

export default function FoodLog({ meals, onRemove }) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        Nessun pasto registrato oggi
      </div>
    )
  }

  const grouped = meals.reduce((acc, meal) => {
    if (!acc[meal.category]) acc[meal.category] = []
    acc[meal.category].push(meal)
    return acc
  }, {})

  const order = ['colazione', 'pranzo', 'cena', 'spuntino', 'post-workout']
  const sortedGroups = order.filter((c) => grouped[c])

  return (
    <div className="space-y-4">
      {sortedGroups.map((cat) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryColors[cat] }}
            />
            <p className="text-text-muted text-xs uppercase tracking-wider capitalize">{cat}</p>
          </div>
          <div className="space-y-2">
            {grouped[cat].map((meal) => (
              <div
                key={meal.id}
                className="bg-surface rounded-xl px-3 py-3 flex justify-between items-center"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-text text-sm font-medium truncate">{meal.name}</p>
                    {meal.unit === 'g' && (
                      <span className="text-text-dim text-xs shrink-0">{meal.quantity}g</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-accent-red text-xs font-semibold">{Math.round(meal.calories)} kcal</span>
                    <span className="text-text-dim text-xs">P{Math.round(meal.protein)}</span>
                    <span className="text-text-dim text-xs">C{Math.round(meal.carbs)}</span>
                    <span className="text-text-dim text-xs">G{Math.round(meal.fat)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-text-dim text-xs">{meal.time}</span>
                  <button
                    onClick={() => onRemove(meal.id)}
                    className="p-1.5 text-text-dim active:text-accent-red transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
