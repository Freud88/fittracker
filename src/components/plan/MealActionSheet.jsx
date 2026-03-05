import { useState } from 'react'
import { X, Check, Edit3, Shuffle, Ban } from 'lucide-react'
import FoodSearch from '../food/FoodSearch'
import { calcMacroFromFood } from '../../utils/macroCalc'

const catLabels = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  snack: 'Spuntino',
  dinner: 'Cena',
}

export default function MealActionSheet({
  meal, date, category, dailyTarget,
  onMarkEaten, onRecordActual, onRegenerate, onBan, onClose
}) {
  const [mode, setMode] = useState('actions') // 'actions' | 'eaten_other'
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState('')

  const actualMacros = selectedFood && quantity
    ? calcMacroFromFood(selectedFood, parseFloat(quantity))
    : null

  // Impact preview
  const plannedCal   = meal?.calories ?? 0
  const actualCal    = actualMacros?.calories ?? 0
  const deltaCal     = actualCal - plannedCal
  const futureDays   = 4  // rough estimate shown to user

  function handleConfirmActual() {
    if (!actualMacros) return
    const actualMeal = {
      name:     selectedFood.name,
      calories: actualMacros.calories,
      protein:  actualMacros.protein,
      carbs:    actualMacros.carbs,
      fat:      actualMacros.fat,
    }
    onRecordActual(date, category, actualMeal, dailyTarget)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl p-4 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

        {mode === 'actions' ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-text-muted text-xs mb-0.5">{catLabels[category]}</p>
                <h2 className="font-title text-xl text-text leading-tight">{meal?.name}</h2>
                <p className="text-text-muted text-xs mt-0.5">
                  {meal?.calories} kcal · P{meal?.protein}g · C{meal?.carbs}g · G{meal?.fat}g
                </p>
              </div>
              <button onClick={onClose} className="text-text-muted p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { onMarkEaten(date, category); onClose() }}
                className="w-full flex items-center gap-3 bg-accent-green/10 border border-accent-green/30 rounded-xl px-4 py-3 text-left active:bg-accent-green/20"
              >
                <Check size={18} className="text-accent-green" />
                <span className="text-text text-sm font-medium">Mangiato come da piano</span>
              </button>

              <button
                onClick={() => setMode('eaten_other')}
                className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-left active:bg-border"
              >
                <Edit3 size={18} className="text-accent-gold" />
                <span className="text-text text-sm font-medium">Ho mangiato altro…</span>
              </button>

              <button
                onClick={() => { onRegenerate(date, category); onClose() }}
                className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-left active:bg-border"
              >
                <Shuffle size={18} className="text-accent-blue" />
                <span className="text-text text-sm font-medium">Proponi alternativa</span>
              </button>

              <button
                onClick={() => { onBan(meal?.mealId ?? meal?.id); onClose() }}
                className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-left active:bg-border"
              >
                <Ban size={18} className="text-accent-red" />
                <span className="text-text text-sm font-medium">Banna questo pasto</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-title text-xl text-text">Ho mangiato altro</h2>
              <button onClick={() => setMode('actions')} className="text-text-muted p-1">
                <X size={20} />
              </button>
            </div>

            <div className="mb-3">
              <FoodSearch onSelect={setSelectedFood} autoFocus />
            </div>

            {selectedFood && (
              <div className="mb-3">
                <label className="text-text-muted text-xs mb-1 block">Quantità (g)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="es. 150"
                  className="w-full bg-surface2 border border-border rounded-xl px-3 py-3 text-text text-lg outline-none focus:border-accent-blue"
                />
              </div>
            )}

            {/* Impact preview */}
            {actualMacros && (
              <div className={`rounded-xl p-3 mb-4 border ${deltaCal > 0 ? 'border-accent-red/40 bg-accent-red/10' : 'border-accent-green/40 bg-accent-green/10'}`}>
                <p className="text-text text-xs font-semibold mb-1">Impatto sul piano</p>
                <p className="text-text-muted text-xs">
                  Oggi: <span className={`font-bold ${deltaCal > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                    {deltaCal > 0 ? '+' : ''}{Math.round(deltaCal)} kcal
                  </span> rispetto al piano
                </p>
                {Math.abs(deltaCal) > 50 && (
                  <p className="text-text-muted text-xs mt-0.5">
                    Prossimi {futureDays} giorni: {deltaCal > 0 ? '' : '+'}{Math.round(-deltaCal / futureDays)} kcal/giorno
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleConfirmActual}
              disabled={!actualMacros}
              className="w-full bg-accent-blue text-white font-bold py-4 rounded-xl text-sm disabled:opacity-40 active:scale-95 transition-transform"
            >
              Conferma e ricalibra
            </button>
          </>
        )}
      </div>
    </div>
  )
}
