import { useState } from 'react'
import { X, Zap, Plus } from 'lucide-react'

export default function AddWorkoutModal({ templates, onLoadTemplate, onStartBlank, onClose }) {
  const [showCustomName, setShowCustomName] = useState(false)
  const [newExName, setNewExName] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl p-4 pb-12 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-title text-2xl text-text">Inizia Allenamento</h2>
          <button onClick={onClose} className="text-text-muted p-1">
            <X size={22} />
          </button>
        </div>

        <p className="text-text-muted text-sm mb-3">Carica un template:</p>

        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => { onLoadTemplate(t.id); onClose() }}
            className="w-full bg-surface2 rounded-xl px-4 py-3 mb-2 text-left flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
              <Zap size={18} className="text-accent-blue" />
            </div>
            <div>
              <p className="text-text font-semibold">{t.name}</p>
              <p className="text-text-muted text-xs">{t.description} · {t.exercises.length} esercizi</p>
            </div>
          </button>
        ))}

        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => { onStartBlank(); onClose() }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface2 text-text-muted text-sm active:bg-border"
          >
            <Plus size={16} />
            Inizia sessione vuota
          </button>
        </div>
      </div>
    </div>
  )
}
