import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useFoodStore } from '../stores/foodStore'
import { useConfigStore } from '../stores/configStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { useMealPlanStore } from '../stores/mealPlanStore'
import { calcRemaining } from '../utils/macroCalc'
import { getToday } from '../utils/dateUtils'
import { getWeekDelta, getFutureDaysCount } from '../utils/mealPlanner'
import Header from '../components/layout/Header'
import DailyProgress from '../components/dashboard/DailyProgress'
import QuickAdd from '../components/dashboard/QuickAdd'
import AddMealModal from '../components/food/AddMealModal'
import AddWorkoutModal from '../components/workout/AddWorkoutModal'
import FoodLog from '../components/food/FoodLog'
import { Dumbbell, CheckCircle } from 'lucide-react'

export default function Today({ onNavigate }) {
  const [showMealModal, setShowMealModal] = useState(false)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)

  const { getTodayTotals, getTodayLog, addMeal, removeMeal } = useFoodStore()
  const { targets, userInfo } = useConfigStore()
  const { workouts, templates, loadTemplate, startWorkout } = useWorkoutStore()
  const { plan } = useMealPlanStore()

  const totals     = getTodayTotals()
  const todayLog   = getTodayLog()
  const today      = getToday()
  const todayWorkout = workouts[today]

  // Recalibration banner
  const delta      = getWeekDelta(plan)
  const futureDays = getFutureDaysCount(plan)
  const hasCalDelta = plan && Math.abs(delta.calories) > 50

  // Adjusted today target (from plan if available)
  const todayTarget = plan?.adjustedTargets?.[today] ?? targets

  return (
    <div>
      <Header currentPage="today" userName={userInfo.name} onNavigate={onNavigate} />

      {/* Recalibration banner */}
      {hasCalDelta && (
        <div className="mx-4 mb-3 bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-accent-blue" />
            <p className="text-accent-blue text-xs font-semibold">Piano ricalibrato</p>
          </div>
          <p className="text-text-muted text-xs">
            Hai accumulato {delta.calories > 0 ? '+' : ''}{Math.round(delta.calories)} kcal questa settimana.
            {futureDays > 0 && ` I prossimi ${futureDays} giorni: ${todayTarget.calories} kcal/giorno.`}
          </p>
          <button
            onClick={() => onNavigate('plan')}
            className="mt-1.5 text-accent-blue text-xs font-medium"
          >
            Vedi piano →
          </button>
        </div>
      )}

      <DailyProgress totals={totals} targets={todayTarget} />
      <QuickAdd
        onAddMeal={() => setShowMealModal(true)}
        onAddWorkout={() => todayWorkout ? onNavigate('workout') : setShowWorkoutModal(true)}
        onViewSuggestions={() => onNavigate('food')}
      />

      {/* Today's workout status */}
      {todayWorkout && (
        <div className="px-4 mb-4">
          <button
            onClick={() => onNavigate('workout')}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 ${
              todayWorkout.completed
                ? 'bg-accent-green/10 border border-accent-green/30'
                : 'bg-accent-blue/10 border border-accent-blue/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              todayWorkout.completed ? 'bg-accent-green/20' : 'bg-accent-blue/20'
            }`}>
              {todayWorkout.completed
                ? <CheckCircle size={20} className="text-accent-green" />
                : <Dumbbell size={20} className="text-accent-blue" />
              }
            </div>
            <div className="text-left">
              <p className="text-text font-semibold text-sm">
                {todayWorkout.completed ? 'Allenamento completato' : 'Sessione in corso'}
              </p>
              <p className="text-text-muted text-xs">
                {todayWorkout.exercises.length} esercizi · Tocca per {todayWorkout.completed ? 'vedere' : 'continuare'}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Today's plan preview */}
      {plan?.days?.[today] && (
        <div className="px-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-text-muted text-xs uppercase tracking-wider">Piano di oggi</p>
            <button onClick={() => onNavigate('plan')} className="text-accent-blue text-xs">Vedi piano</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {['breakfast','lunch','snack','dinner'].map((cat) => {
              const meal = plan.days[today].meals[cat]
              if (!meal) return null
              const labels = { breakfast: 'Colazione', lunch: 'Pranzo', snack: 'Spuntino', dinner: 'Cena' }
              return (
                <div key={cat} className={`rounded-xl px-3 py-2 ${meal.eaten ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-surface'}`}>
                  <p className="text-text-dim text-[10px]">{labels[cat]}</p>
                  <p className="text-text text-xs font-medium truncate">{meal.name}</p>
                  <p className="text-accent-red text-[10px]">{meal.calories} kcal</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Today's meal log preview */}
      {todayLog.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-text-muted text-xs uppercase tracking-wider">Pasti registrati</p>
            <button onClick={() => onNavigate('food')} className="text-accent-blue text-xs">Vedi tutti</button>
          </div>
          <FoodLog meals={todayLog.slice(-3)} onRemove={(id) => removeMeal(today, id)} />
        </div>
      )}

      {showMealModal && (
        <AddMealModal onAdd={addMeal} onClose={() => setShowMealModal(false)} />
      )}

      {showWorkoutModal && (
        <AddWorkoutModal
          templates={templates}
          onLoadTemplate={(tid) => loadTemplate(tid, today)}
          onStartBlank={() => startWorkout(today)}
          onClose={() => setShowWorkoutModal(false)}
        />
      )}
    </div>
  )
}
