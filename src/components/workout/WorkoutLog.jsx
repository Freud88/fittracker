import { useState } from 'react'
import { Plus, CheckCircle, X, Search } from 'lucide-react'
import ExerciseRow from './ExerciseRow'

export default function WorkoutLog({ workout, date, onUpdateSet, onRemoveExercise, onAddExercise, onAddSet, onComplete, onCancel }) {
  const [showAddEx, setShowAddEx] = useState(false)
  const [exName, setExName] = useState('')
  const [exSets, setExSets] = useState('3')
  const [exReps, setExReps] = useState('10')
  const [exWeight, setExWeight] = useState('0')

  const completedExercises = workout.exercises.filter(
    (ex) => ex.sets.length > 0 && ex.sets.every((s) => s.completed)
  ).length
  const totalExercises = workout.exercises.length

  function handleAddEx() {
    if (!exName.trim()) return
    const exercise = {
      id: crypto.randomUUID(),
      name: exName.trim(),
      block: '',
      unit: 'kg',
      sets: Array.from({ length: parseInt(exSets) || 3 }, () => ({
        reps: parseInt(exReps) || 10,
        weight: parseFloat(exWeight) || 0,
        completed: false,
      })),
      notes: '',
    }
    onAddExercise(date, exercise)
    setExName('')
    setShowAddEx(false)
  }

  return (
    <div>
      {/* Session header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-text-muted text-xs">
            {completedExercises}/{totalExercises} esercizi completati
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface2 text-text-muted text-xs"
          >
            <X size={13} /> Annulla
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-green text-white text-xs font-semibold"
          >
            <CheckCircle size={13} /> Fine
          </button>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3 mb-4">
        {workout.exercises.map((ex) => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            date={date}
            onUpdateSet={onUpdateSet}
            onRemove={onRemoveExercise}
            onAddSet={onAddSet}
          />
        ))}
      </div>

      {/* Add exercise */}
      {showAddEx ? (
        <div className="bg-surface rounded-xl p-4">
          <p className="text-text font-semibold mb-3">Aggiungi esercizio</p>
          <input
            type="text"
            value={exName}
            onChange={(e) => setExName(e.target.value)}
            placeholder="Nome esercizio"
            autoFocus
            className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text mb-2 outline-none focus:border-accent-blue"
          />
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Serie', val: exSets, set: setExSets },
              { label: 'Rip.', val: exReps, set: setExReps },
              { label: 'Kg', val: exWeight, set: setExWeight },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="text-text-muted text-xs mb-1 block">{label}</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-lg px-2 py-2 text-text text-center outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddEx(false)} className="flex-1 py-2.5 rounded-xl bg-surface2 text-text-muted text-sm">
              Annulla
            </button>
            <button onClick={handleAddEx} disabled={!exName.trim()} className="flex-1 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold disabled:opacity-40">
              Aggiungi
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddEx(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-text-muted text-sm active:bg-surface"
        >
          <Plus size={16} /> Aggiungi esercizio
        </button>
      )}
    </div>
  )
}
