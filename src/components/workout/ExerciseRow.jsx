import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Plus, PlayCircle } from 'lucide-react'
import SetTracker from './SetTracker'
import ExerciseGifModal from './ExerciseGifModal'

export default function ExerciseRow({ exercise, date, onUpdateSet, onRemove, onAddSet }) {
  const [expanded, setExpanded] = useState(true)
  const [showGif, setShowGif]   = useState(false)

  const completedSets = exercise.sets.filter((s) => s.completed).length
  const allDone = completedSets === exercise.sets.length

  return (
    <>
      {showGif && <ExerciseGifModal exerciseName={exercise.name} onClose={() => setShowGif(false)} />}
      <div className={`rounded-xl border transition-colors ${allDone ? 'border-accent-green/40 bg-accent-green/5' : 'border-border bg-surface'}`}>
      {/* Header */}
      <div className="flex items-center px-3 py-3 gap-2">
        <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
          <p className="text-text font-semibold text-sm truncate">{exercise.name}</p>
          {exercise.block && (
            <p className="text-text-dim text-[10px]">{exercise.block}</p>
          )}
        </div>
        <span className="text-text-muted text-xs shrink-0">
          {completedSets}/{exercise.sets.length} set
        </span>
        <button onClick={() => setShowGif(true)} className="text-text-dim p-1" title="Vedi animazione">
          <PlayCircle size={16} />
        </button>
        <button onClick={() => onRemove(exercise.id)} className="text-text-dim p-1">
          <Trash2 size={14} />
        </button>
        <button onClick={() => setExpanded(!expanded)} className="text-text-dim p-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <SetTracker
            sets={exercise.sets}
            exerciseId={exercise.id}
            onUpdate={onUpdateSet}
            unit={exercise.unit}
          />
          <button
            onClick={() => onAddSet(exercise.id)}
            className="mt-2 w-full flex items-center justify-center gap-1 text-text-muted text-xs py-2 rounded-lg bg-surface2 active:bg-border"
          >
            <Plus size={13} /> Aggiungi set
          </button>
        </div>
      )}
    </div>
    </>
  )
}
