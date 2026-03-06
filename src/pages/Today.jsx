import { useState } from 'react'
import { useFoodStore } from '../stores/foodStore'
import { useConfigStore } from '../stores/configStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { getToday } from '../utils/dateUtils'
import Header from '../components/layout/Header'
import DailyProgress from '../components/dashboard/DailyProgress'
import QuickAdd from '../components/dashboard/QuickAdd'
import AddMealModal from '../components/food/AddMealModal'
import PhotoMealCapture from '../components/food/PhotoMealCapture'
import AddWorkoutModal from '../components/workout/AddWorkoutModal'
import FoodLog from '../components/food/FoodLog'
import { Dumbbell, CheckCircle } from 'lucide-react'

export default function Today({ onNavigate }) {
  const [showMealModal, setShowMealModal] = useState(false)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const { getTodayTotals, getTodayLog, addMeal, removeMeal } = useFoodStore()
  const { targets, userInfo } = useConfigStore()
  const { workouts, templates, loadTemplate, startWorkout } = useWorkoutStore()

  const totals     = getTodayTotals()
  const todayLog   = getTodayLog()
  const today      = getToday()
  const todayWorkout = workouts[today]

  return (
    <div>
      <Header currentPage="today" userName={userInfo.name} onNavigate={onNavigate} />

      <DailyProgress totals={totals} targets={targets} />
      <QuickAdd
        onAddMeal={() => setShowMealModal(true)}
        onPhotoMeal={() => setShowCamera(true)}
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

      {showCamera && (
        <PhotoMealCapture
          onConfirm={(meal) => {
            addMeal(today, {
              id: crypto.randomUUID(),
              time: new Date().toTimeString().slice(0, 5),
              category: 'pranzo',
              quantity: 1,
              unit: 'porzione',
              ...meal,
            })
            setShowCamera(false)
          }}
          onClose={() => setShowCamera(false)}
        />
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
