import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useWorkoutStore } from '../stores/workoutStore'
import { getToday } from '../utils/dateUtils'
import Header from '../components/layout/Header'
import WorkoutLog from '../components/workout/WorkoutLog'
import WorkoutHistory from '../components/workout/WorkoutHistory'
import AddWorkoutModal from '../components/workout/AddWorkoutModal'

const TABS = ['Oggi', 'Storico']

export default function Workout() {
  const [activeTab, setActiveTab] = useState('Oggi')
  const [showModal, setShowModal] = useState(false)

  const {
    workouts,
    templates,
    activeWorkoutDate,
    startWorkout,
    loadTemplate,
    addExercise,
    removeExercise,
    updateSet,
    completeWorkout,
    cancelWorkout,
    getWorkoutHistory,
  } = useWorkoutStore()

  const today = getToday()
  const todayWorkout = workouts[today]
  const isActive = !!todayWorkout && !todayWorkout.completed
  const history = getWorkoutHistory().filter((w) => w.date !== today || w.completed)

  function handleAddSet(exerciseId) {
    const ex = todayWorkout?.exercises.find((e) => e.id === exerciseId)
    if (!ex) return
    const lastSet = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 0 }
    const newSets = [...ex.sets, { reps: lastSet.reps, weight: lastSet.weight, completed: false }]
    const updatedEx = { ...ex, sets: newSets }
    const updatedExercises = todayWorkout.exercises.map((e) => e.id === exerciseId ? updatedEx : e)
    useWorkoutStore.setState((state) => ({
      workouts: {
        ...state.workouts,
        [today]: { ...state.workouts[today], exercises: updatedExercises },
      },
    }))
  }

  return (
    <div>
      <Header currentPage="workout" />

      <div className="flex px-4 gap-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab ? 'bg-accent-blue text-white' : 'bg-surface text-text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4">
        {activeTab === 'Oggi' && (
          <>
            {!todayWorkout ? (
              <div className="text-center py-10">
                <p className="text-text-muted text-sm mb-4">Nessuna sessione per oggi</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-accent-blue text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 mx-auto active:scale-95 transition-transform"
                >
                  <Plus size={18} /> Inizia allenamento
                </button>
              </div>
            ) : (
              <WorkoutLog
                workout={todayWorkout}
                date={today}
                onUpdateSet={(exId, si, data) => updateSet(today, exId, si, data)}
                onRemoveExercise={(exId) => removeExercise(today, exId)}
                onAddExercise={addExercise}
                onAddSet={handleAddSet}
                onComplete={() => completeWorkout(today)}
                onCancel={() => cancelWorkout(today)}
              />
            )}
          </>
        )}

        {activeTab === 'Storico' && (
          <WorkoutHistory workouts={history} />
        )}
      </div>

      {showModal && (
        <AddWorkoutModal
          templates={templates}
          onLoadTemplate={(tid) => loadTemplate(tid, today)}
          onStartBlank={() => startWorkout(today)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
