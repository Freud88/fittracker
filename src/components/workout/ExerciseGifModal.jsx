import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp, Loader } from 'lucide-react'
import { searchExercise } from '../../services/exercisedb'

export default function ExerciseGifModal({ exerciseName, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    searchExercise(exerciseName)
      .then(result => {
        if (!cancelled) {
          if (result) setData(result)
          else setError('Esercizio non trovato nel database')
        }
      })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [exerciseName])

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-border rounded-full mx-auto mt-3 mb-3" />

        {/* Header */}
        <div className="flex justify-between items-start px-4 mb-4">
          <div>
            <h3 className="text-text font-semibold text-base leading-tight">{exerciseName}</h3>
            {data && (
              <p className="text-text-muted text-xs mt-0.5 capitalize">
                {data.bodyPart} · {data.target}
                {data.equipment && data.equipment !== 'body weight' ? ` · ${data.equipment}` : ''}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted p-1 shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader size={28} className="text-accent-blue animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-text-muted text-sm">{error}</p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* GIF */}
              <div className="bg-black rounded-xl overflow-hidden mb-4 flex justify-center">
                <img
                  src={data.gifUrl}
                  alt={data.name}
                  className="h-52 object-contain"
                />
              </div>

              {/* Muscles */}
              {data.secondaryMuscles?.length > 0 && (
                <div className="mb-4">
                  <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest mb-1.5">Muscoli secondari</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.secondaryMuscles.map(m => (
                      <span key={m} className="text-[11px] bg-surface2 text-text-muted px-2 py-0.5 rounded-md capitalize">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {data.instructions?.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="w-full flex items-center justify-between py-2 text-text-muted text-xs font-semibold uppercase tracking-widest"
                  >
                    <span>Come si esegue</span>
                    {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showSteps && (
                    <ol className="space-y-2 mt-1">
                      {data.instructions.map((step, i) => (
                        <li key={i} className="flex gap-2.5 text-xs text-text-muted leading-relaxed">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-surface2 flex items-center justify-center text-[10px] font-bold text-text-dim">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
