import { RefreshCw, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMealPlanStore } from '../stores/mealPlanStore'
import { useFoodStore } from '../stores/foodStore'
import { useConfigStore } from '../stores/configStore'
import { getToday } from '../utils/dateUtils'
import { getWeekDelta, getFutureDaysCount } from '../utils/mealPlanner'
import WeekGrid from '../components/plan/WeekGrid'
import AddCustomMealModal from '../components/plan/AddCustomMealModal'
import { useState } from 'react'

function weekRangeLabel(plan) {
  if (!plan) return ''
  const days = Object.keys(plan.days).sort()
  if (days.length === 0) return ''
  const start = new Date(days[0]  + 'T00:00:00')
  const end   = new Date(days[6]  + 'T00:00:00')
  const fmt = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function Plan() {
  const [showAddMeal, setShowAddMeal] = useState(false)
  const {
    plan,
    generatePlan,
    regenerateDay,
    regenerateMeal,
    markMealEaten,
    skipMeal,
    recordActualMeal,
    banMeal,
    addCustomMeal,
  } = useMealPlanStore()
  const { targets } = useConfigStore()
  const { addMeal, removeMeal, foodLog } = useFoodStore()

  function handleMarkEaten(date, category) {
    const meal = plan?.days[date]?.meals[category]
    if (meal) {
      addMeal(date, {
        id: crypto.randomUUID(),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        category,
      })
    }
    markMealEaten(date, category)
  }

  const delta       = getWeekDelta(plan)
  const futureDays  = getFutureDaysCount(plan)
  const hasCalDelta = Math.abs(delta.calories) > 50

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-title text-3xl text-text">Piano Settimana</h1>
            {plan && <p className="text-text-muted text-xs mt-0.5">{weekRangeLabel(plan)}</p>}
          </div>
          <button
            onClick={() => generatePlan(targets)}
            className="flex items-center gap-1.5 bg-surface2 text-text-muted px-3 py-2 rounded-xl text-xs active:bg-border"
          >
            <RefreshCw size={14} /> Rigenera
          </button>
        </div>
      </div>

      {/* Recalibration banner */}
      {hasCalDelta && plan && (
        <div className="mx-4 mb-4 bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-4 py-3">
          <p className="text-accent-blue text-xs font-semibold mb-0.5">Piano ricalibrato</p>
          <p className="text-text-muted text-xs">
            Hai accumulato {delta.calories > 0 ? '+' : ''}{Math.round(delta.calories)} kcal questa settimana.
            {futureDays > 0 && (
              <> I prossimi {futureDays} giorni: {Math.round(plan.adjustedTargets[Object.keys(plan.adjustedTargets).sort().find(d => d > getToday())]?.calories ?? targets.calories)} kcal/giorno.</>
            )}
          </p>
        </div>
      )}

      {!plan ? (
        <div className="text-center py-16 px-4">
          <Calendar size={48} className="text-text-dim mx-auto mb-4" />
          <p className="text-text-muted text-sm mb-6">
            Nessun piano questa settimana.<br />Generane uno in un tap.
          </p>
          <button
            onClick={() => generatePlan(targets)}
            className="bg-accent-blue text-white font-bold px-8 py-4 rounded-xl text-base active:scale-95 transition-transform"
          >
            Genera piano settimanale
          </button>
        </div>
      ) : (
        <div className="px-4">
          <WeekGrid
            plan={plan}
            dailyTarget={targets}
            onMarkEaten={handleMarkEaten}
            onSkip={(date, category) => {
            // Se il pasto era già stato marcato come mangiato, rimuovilo dal diario
            const meal = plan?.days[date]?.meals[category]
            if (meal?.eaten) {
              const entry = (foodLog[date] || []).find(m => m.name === meal.name && m.category === category)
              if (entry) removeMeal(date, entry.id)
            }
            skipMeal(date, category)
          }}
            onRecordActual={(d, c, m) => recordActualMeal(d, c, m, targets)}
            onRegenerate={regenerateMeal}
            onRegenerateDay={regenerateDay}
            onBan={banMeal}
          />

          {/* Legend */}
          <div className="flex gap-4 mt-5 justify-center flex-wrap">
            {[
              { color: 'bg-accent-green', label: 'Mangiato' },
              { color: 'bg-accent-gold', label: 'Modificato' },
              { color: 'bg-accent-blue/40', label: 'Ricalibrato' },
              { color: 'bg-surface2', label: 'Pianificato' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-text-dim text-[10px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddMeal && (
        <AddCustomMealModal onAdd={addCustomMeal} onClose={() => setShowAddMeal(false)} />
      )}
    </div>
  )
}
