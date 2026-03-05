import { useState } from 'react'
import MealCell from './MealCell'
import MealActionSheet from './MealActionSheet'
import { getToday, formatDateShort } from '../../utils/dateUtils'

const CATEGORIES = ['breakfast', 'lunch', 'snack', 'dinner']
const DAY_LABELS  = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function WeekGrid({ plan, dailyTarget, onMarkEaten, onRecordActual, onRegenerate, onBan }) {
  const [selected, setSelected] = useState(null) // { date, category }
  const today = getToday()

  if (!plan) return null

  const sortedDays = Object.keys(plan.days).sort()

  return (
    <>
      {/* Horizontal scroll grid */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2" style={{ minWidth: `${sortedDays.length * 100}px` }}>
          {sortedDays.map((date, i) => {
            const isToday = date === today
            const isPast  = date < today
            const dayTarget = plan.adjustedTargets[date]
            const dayMeals  = plan.days[date].meals

            const dayTotal = Object.values(dayMeals).reduce(
              (acc, m) => acc + (m?.calories ?? 0), 0
            )

            return (
              <div key={date} className="flex-shrink-0 w-24">
                {/* Day header */}
                <div className={`text-center mb-2 py-1 rounded-lg ${isToday ? 'bg-accent-blue/20' : ''}`}>
                  <p className={`text-xs font-bold ${isToday ? 'text-accent-blue' : 'text-text-muted'}`}>
                    {DAY_LABELS[i]}
                  </p>
                  <p className="text-text-dim text-[10px]">{formatDateShort(date)}</p>
                </div>

                {/* Meal cells */}
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <MealCell
                      key={cat}
                      meal={dayMeals[cat]}
                      category={cat}
                      isToday={isToday}
                      isPast={isPast}
                      onTap={() => setSelected({ date, category: cat })}
                    />
                  ))}
                </div>

                {/* Day total */}
                <div className="mt-1.5 text-center">
                  <p className="text-text-dim text-[10px]">{Math.round(dayTotal)} kcal</p>
                  {dayTarget && dayTarget.calories !== dailyTarget.calories && (
                    <p className="text-accent-blue text-[9px]">target {dayTarget.calories}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action sheet */}
      {selected && (
        <MealActionSheet
          meal={plan.days[selected.date]?.meals[selected.category]}
          date={selected.date}
          category={selected.category}
          dailyTarget={dailyTarget}
          onMarkEaten={(d, c) => { onMarkEaten(d, c); setSelected(null) }}
          onRecordActual={onRecordActual}
          onRegenerate={(d, c) => { onRegenerate(d, c); setSelected(null) }}
          onBan={(id) => { onBan(id); setSelected(null) }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
