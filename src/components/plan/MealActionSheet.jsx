import { useState, useEffect } from 'react'
import { X, Check, Edit3, Shuffle, Ban, SkipForward, Trash2 } from 'lucide-react'
import FoodSearch from '../food/FoodSearch'
import { calcMacroFromFood } from '../../utils/macroCalc'
import { formatIngredient } from '../../utils/formatIngredient'

const catLabels = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  snack: 'Spuntino',
  dinner: 'Cena',
}

const COUNTABLE = {
  'uov': 55, 'egg': 55, 'mel': 180, 'apple': 180, 'banan': 120,
  'aranci': 200, 'orange': 200, 'pear': 170, 'kiwi': 80,
  'fragol': 15, 'strawberr': 15, 'pesc': 150, 'albicocc': 40,
  'mandorl': 1, 'almond': 1, 'noce': 5, 'walnut': 5,
  'anacardo': 2, 'cashew': 2, 'pistacchio': 1,
}
function detectCountable(food) {
  const name = (food.name + ' ' + (food.nameEn ?? '')).toLowerCase()
  for (const [key, grams] of Object.entries(COUNTABLE)) {
    if (name.includes(key)) return grams
  }
  return null
}

export default function MealActionSheet({
  meal, date, category, dailyTarget,
  onMarkEaten, onSkip, onRecordActual, onRegenerate, onBan, onClose
}) {
  const [mode, setMode] = useState('actions') // 'actions' | 'eaten_other'
  const [ingredients, setIngredients] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('g')
  const [gramsPerPiece, setGramsPerPiece] = useState('50')

  useEffect(() => {
    if (!selectedFood) { setUnit('g'); return }
    const gpp = detectCountable(selectedFood)
    if (gpp) { setUnit('pz'); setGramsPerPiece(String(gpp)) }
    else setUnit('g')
  }, [selectedFood])

  const qtyGrams = unit === 'g'
    ? parseFloat(quantity)
    : parseFloat(quantity) * parseFloat(gramsPerPiece)

  const currentMacros = selectedFood && quantity && qtyGrams > 0
    ? calcMacroFromFood(selectedFood, qtyGrams)
    : null

  const ingredientTotals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.macros.calories,
      protein:  acc.protein  + ing.macros.protein,
      carbs:    acc.carbs    + ing.macros.carbs,
      fat:      acc.fat      + ing.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  function handleAddIngredient() {
    if (!currentMacros) return
    setIngredients([...ingredients, {
      food: selectedFood,
      quantity: parseFloat(quantity),
      unit,
      grams: qtyGrams,
      macros: currentMacros,
    }])
    setSelectedFood(null)
    setQuantity('')
  }

  const actualMacros = ingredients.length > 0 ? ingredientTotals : null
  const plannedCal   = meal?.calories ?? 0
  const deltaCal     = (actualMacros?.calories ?? 0) - plannedCal
  const futureDays   = 4

  function handleConfirmActual() {
    if (!actualMacros) return
    onRecordActual(date, category, {
      name:     ingredients.map(i => i.food.name).join(' + '),
      calories: actualMacros.calories,
      protein:  actualMacros.protein,
      carbs:    actualMacros.carbs,
      fat:      actualMacros.fat,
    }, dailyTarget)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl p-4 pb-12 max-h-[90vh] overflow-y-auto"
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
                {meal?.ingredients?.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {meal.ingredients.map((ing, i) => (
                      <p key={i} className="text-text-dim text-xs">
                        · {formatIngredient(ing)}
                      </p>
                    ))}
                  </div>
                )}
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
                onClick={() => { onSkip?.(date, category); onClose() }}
                className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-left active:bg-border"
              >
                <SkipForward size={18} className="text-text-muted" />
                <span className="text-text text-sm font-medium">Pasto saltato</span>
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
              <div>
                <p className="text-text-muted text-xs">{catLabels[category]} · pianificato</p>
                <h2 className="font-title text-xl text-text">Ho mangiato altro</h2>
              </div>
              <button onClick={() => setMode('actions')} className="text-text-muted p-1">
                <X size={20} />
              </button>
            </div>

            {/* Ingredient list */}
            {ingredients.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {ingredients.map((ing, i) => (
                  <div key={i} className="bg-surface2 rounded-xl px-3 py-2.5 flex justify-between items-center">
                    <div>
                      <p className="text-text text-sm font-medium">{ing.food.name}</p>
                      <p className="text-text-dim text-xs">
                        {ing.unit === 'pz' ? `${ing.quantity} pz (${Math.round(ing.grams)}g)` : `${ing.quantity}g`}
                        {' '}· {Math.round(ing.macros.calories)} kcal · P{Math.round(ing.macros.protein)}g · C{Math.round(ing.macros.carbs)}g · G{Math.round(ing.macros.fat)}g
                      </p>
                    </div>
                    <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-text-dim p-1 shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {/* Totali */}
                <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Kcal', v: ingredientTotals.calories },
                    { label: 'Prot', v: ingredientTotals.protein },
                    { label: 'Carb', v: ingredientTotals.carbs },
                    { label: 'Gras', v: ingredientTotals.fat },
                  ].map(({ label, v }) => (
                    <div key={label}>
                      <p className="text-text font-bold text-base">{Math.round(v)}</p>
                      <p className="text-text-muted text-[10px]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-3">
              <FoodSearch onSelect={setSelectedFood} autoFocus={ingredients.length === 0} />
            </div>

            {selectedFood && (
              <div className="bg-surface2 rounded-xl p-3 mb-3 flex justify-between items-start">
                <div>
                  <p className="text-text font-medium text-sm">{selectedFood.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    per 100g: {selectedFood.per100g.calories}kcal · P{selectedFood.per100g.protein}g · C{selectedFood.per100g.carbs}g · G{selectedFood.per100g.fat}g
                  </p>
                </div>
                <button onClick={() => setSelectedFood(null)} className="text-text-dim p-1 shrink-0">
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedFood && (
              <div className="mb-3 space-y-2">
                <div className="flex gap-1.5">
                  {['g', 'pz'].map((u) => (
                    <button key={u} onClick={() => setUnit(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${unit === u ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'}`}>
                      {u === 'g' ? 'Grammi' : 'Pezzi'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-text-muted text-xs mb-1 block">{unit === 'g' ? 'Quantità (g)' : 'Quantità (pz)'}</label>
                    <input
                      type="number" inputMode="numeric" value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={unit === 'g' ? 'es. 150' : 'es. 2'}
                      className="w-full bg-surface2 border border-border rounded-xl px-3 py-3 text-text text-lg outline-none focus:border-accent-blue"
                    />
                  </div>
                  {unit === 'pz' && (
                    <div className="w-24">
                      <label className="text-text-muted text-xs mb-1 block">g/pezzo</label>
                      <input
                        type="number" inputMode="numeric" value={gramsPerPiece}
                        onChange={(e) => setGramsPerPiece(e.target.value)}
                        className="w-full bg-surface2 border border-border rounded-xl px-3 py-3 text-text text-lg outline-none focus:border-accent-blue"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleAddIngredient} disabled={!currentMacros}
                    className="self-end bg-surface2 border border-border rounded-xl px-4 py-3 text-accent-blue font-bold text-sm disabled:opacity-40 active:bg-border"
                  >
                    + Aggiungi
                  </button>
                </div>
              </div>
            )}

            {currentMacros && (
              <div className="bg-surface2 rounded-xl p-3 mb-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Kcal', v: currentMacros.calories },
                  { label: 'Prot', v: currentMacros.protein },
                  { label: 'Carb', v: currentMacros.carbs },
                  { label: 'Gras', v: currentMacros.fat },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <p className="text-text font-bold text-base">{Math.round(v)}</p>
                    <p className="text-text-muted text-[10px]">{label}</p>
                  </div>
                ))}
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
