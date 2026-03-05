import { Plus, Dumbbell, Lightbulb, Camera } from 'lucide-react'

export default function QuickAdd({ onAddMeal, onAddWorkout, onViewSuggestions, onPhotoMeal }) {
  return (
    <div className="px-4 mb-4">
      <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Azioni rapide</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAddMeal}
          className="flex flex-col items-center gap-2 bg-surface rounded-xl p-3 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-accent-red/20 flex items-center justify-center">
            <Plus size={20} className="text-accent-red" />
          </div>
          <span className="text-xs text-text text-center leading-tight">Aggiungi pasto</span>
        </button>

        <button
          onClick={onPhotoMeal}
          className="flex flex-col items-center gap-2 bg-surface rounded-xl p-3 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-accent-red/10 border border-accent-red/30 flex items-center justify-center">
            <Camera size={20} className="text-accent-red" />
          </div>
          <span className="text-xs text-text text-center leading-tight">Fotografa pasto</span>
        </button>

        <button
          onClick={onAddWorkout}
          className="flex flex-col items-center gap-2 bg-surface rounded-xl p-3 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
            <Dumbbell size={20} className="text-accent-blue" />
          </div>
          <span className="text-xs text-text text-center leading-tight">Inizia allenamento</span>
        </button>

        <button
          onClick={onViewSuggestions}
          className="flex flex-col items-center gap-2 bg-surface rounded-xl p-3 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
            <Lightbulb size={20} className="text-accent-gold" />
          </div>
          <span className="text-xs text-text text-center leading-tight">Pasti consigliati</span>
        </button>
      </div>
    </div>
  )
}
