import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, Clock, Download } from 'lucide-react'
import { formatDate } from '../../utils/dateUtils'

function exportWorkout(workout) {
  const date = new Date(workout.date + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalSets = workout.exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const completedSets = workout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)

  let duration = ''
  if (workout.startTime && workout.endTime) {
    const mins = Math.round((new Date(workout.endTime) - new Date(workout.startTime)) / 60000)
    duration = `Durata: ${mins} min  |  `
  }

  let text = `ALLENAMENTO — ${date}\n`
  text += `${duration}${workout.exercises.length} esercizi  ·  ${completedSets}/${totalSets} set completati\n`
  text += '─'.repeat(44) + '\n\n'

  for (const ex of workout.exercises) {
    text += `${ex.name}${ex.block ? ` (${ex.block})` : ''}\n`
    for (let i = 0; i < ex.sets.length; i++) {
      const s = ex.sets[i]
      const unit = ex.unit || 'kg'
      const check = s.completed ? '  ✓' : ''
      text += `  #${i + 1}  ${s.weight}${unit} × ${s.reps} rip${check}\n`
    }
    if (ex.notes) text += `  Note: ${ex.notes}\n`
    text += '\n'
  }

  if (workout.notes) text += `Note: ${workout.notes}\n`

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `allenamento_${workout.date}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function WorkoutCard({ workout }) {
  const [expanded, setExpanded] = useState(false)
  const totalSets = workout.exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const completedSets = workout.exercises.reduce(
    (a, ex) => a + ex.sets.filter((s) => s.completed).length,
    0
  )

  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-left">
          <p className="text-text font-semibold text-sm capitalize">{formatDate(workout.date)}</p>
          <p className="text-text-muted text-xs">
            {workout.exercises.length} esercizi · {completedSets}/{totalSets} set
          </p>
        </div>
        <div className="flex items-center gap-2">
          {workout.completed ? (
            <CheckCircle size={16} className="text-accent-green" />
          ) : (
            <Clock size={16} className="text-accent-gold" />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); exportWorkout(workout) }}
            className="p-1 text-text-muted active:text-accent-blue"
            title="Esporta allenamento"
          >
            <Download size={15} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          {workout.exercises.map((ex) => (
            <div key={ex.id} className="mt-3">
              <p className="text-text text-sm font-medium mb-1">{ex.name}</p>
              <div className="space-y-1">
                {ex.sets.map((s, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="text-text-dim w-6">#{i + 1}</span>
                    <span className={s.completed ? 'text-accent-green' : 'text-text-muted'}>
                      {s.reps} rip × {s.weight}kg
                      {s.completed && ' ✓'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {workout.notes && (
            <p className="text-text-muted text-xs mt-3 italic">"{workout.notes}"</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkoutHistory({ workouts }) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        Nessuna sessione registrata
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {workouts.map((w) => (
        <WorkoutCard key={w.id} workout={w} />
      ))}
    </div>
  )
}
