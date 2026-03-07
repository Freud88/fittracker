import { useState, useMemo } from 'react'
import { RefreshCw, Check, Plus, ChevronDown } from 'lucide-react'
import { useFoodStore } from '../stores/foodStore'
import { useConfigStore } from '../stores/configStore'
import { useMealPlanStore } from '../stores/mealPlanStore'
import { getToday } from '../utils/dateUtils'

const CATS = ['colazione', 'pranzo', 'spuntino', 'cena']
const CAT_LABELS = { colazione: 'Colazione', pranzo: 'Pranzo', spuntino: 'Spuntino', cena: 'Cena' }
const CAT_MAP    = { colazione: 'breakfast', pranzo: 'lunch', spuntino: 'snack', cena: 'dinner' }

function getDefaultCat() {
  const h = new Date().getHours()
  if (h < 10) return 'colazione'
  if (h < 14) return 'pranzo'
  if (h < 18) return 'spuntino'
  return 'cena'
}

const MEAL_PROPORTIONS = { colazione: 0.20, pranzo: 0.35, spuntino: 0.15, cena: 0.30 }
const MEAL_CUTOFFS     = { colazione: 10,   pranzo: 14,   spuntino: 18,   cena: Infinity }

function getMealBudget(remainingCal, category, hour) {
  const remainingProportion = CATS.reduce((sum, cat) => {
    return hour < MEAL_CUTOFFS[cat] ? sum + MEAL_PROPORTIONS[cat] : sum
  }, 0) || 1
  const share = MEAL_PROPORTIONS[category] / remainingProportion
  return Math.max(100, remainingCal * share)
}

function pickMeal(library, category, remainingCal, excludeId = null) {
  const pool = library.filter(m => m.category === CAT_MAP[category] && m.id !== excludeId)
  if (pool.length === 0) return null
  const picked = pool[Math.floor(Math.random() * pool.length)]
  const cal = Math.max(100, remainingCal)
  const scale = cal / picked.calories
  return {
    ...picked,
    calories: Math.round(cal),
    protein:  Math.round(picked.protein  * scale * 10) / 10,
    carbs:    Math.round(picked.carbs    * scale * 10) / 10,
    fat:      Math.round(picked.fat      * scale * 10) / 10,
    ingredients: (picked.ingredients ?? []).map(ing => ({ ...ing, grams: Math.round(ing.grams * scale) })),
  }
}

export default function Plan() {
  const [category, setCategory]         = useState(getDefaultCat)
  const [seed, setSeed]                 = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const [added, setAdded]               = useState(false)

  const { getTodayTotals, addMeal } = useFoodStore()
  const { targets }                 = useConfigStore()
  const { mealLibrary, bannedMeals } = useMealPlanStore()

  const today  = getToday()
  const totals = getTodayTotals()

  const remaining = {
    calories: Math.max(0, targets.calories - totals.calories),
    protein:  Math.max(0, targets.protein  - totals.protein),
    carbs:    Math.max(0, targets.carbs    - totals.carbs),
    fat:      Math.max(0, targets.fat      - totals.fat),
  }

  const library = mealLibrary.filter(m => !bannedMeals.includes(m.id))

  const hour = new Date().getHours()
  const mealBudget = getMealBudget(remaining.calories, category, hour)

  const suggestion = useMemo(
    () => pickMeal(library, category, mealBudget),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, seed, mealBudget]
  )

  function handleEaten() {
    if (!suggestion) return
    addMeal(today, {
      id: crypto.randomUUID(),
      time: new Date().toTimeString().slice(0, 5),
      category,
      name: suggestion.name,
      quantity: 1,
      unit: 'porzione',
      calories: suggestion.calories,
      protein:  suggestion.protein,
      carbs:    suggestion.carbs,
      fat:      suggestion.fat,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const goalReached = remaining.calories < 50

  return (
    <div className="px-4 pt-5 pb-10">
      <h1 className="font-title text-3xl text-text mb-0.5">Suggerisci pasto</h1>
      <p className="text-text-muted text-xs mb-5">Basato sulle calorie rimaste oggi</p>

      {/* Remaining macros */}
      <div className="bg-surface rounded-2xl p-4 mb-5 grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-text font-bold text-lg">{Math.round(remaining.calories)}</p>
          <p className="text-text-muted text-[10px]">Kcal rimaste</p>
        </div>
        <div>
          <p className="text-accent-blue font-bold text-lg">{Math.round(remaining.protein)}</p>
          <p className="text-text-muted text-[10px]">Prot (g)</p>
        </div>
        <div>
          <p className="text-accent-gold font-bold text-lg">{Math.round(remaining.carbs)}</p>
          <p className="text-text-muted text-[10px]">Carb (g)</p>
        </div>
        <div>
          <p className="text-accent-green font-bold text-lg">{Math.round(remaining.fat)}</p>
          <p className="text-text-muted text-[10px]">Gras (g)</p>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {CATS.map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setSeed(0); setAdded(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === cat ? 'bg-accent-blue text-white' : 'bg-surface text-text-muted'}`}
          >
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Suggestion card */}
      {goalReached ? (
        <div className="bg-accent-green/10 border border-accent-green/30 rounded-2xl p-8 text-center">
          <Check size={36} className="text-accent-green mx-auto mb-3" />
          <p className="text-text font-semibold text-lg">Obiettivo raggiunto!</p>
          <p className="text-text-muted text-sm mt-1">Hai mangiato abbastanza per oggi.</p>
        </div>
      ) : !suggestion ? (
        <div className="bg-surface rounded-2xl p-8 text-center">
          <p className="text-text-muted text-sm">Nessun pasto disponibile per questa categoria.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-3">
              <p className="text-text font-semibold text-xl leading-tight">{suggestion.name}</p>
              {suggestion.description && (
                <p className="text-text-muted text-xs mt-1">{suggestion.description}</p>
              )}
            </div>
            <button onClick={() => { setSeed(s => s + 1); setAdded(false) }}
              className="p-2 text-text-muted active:text-accent-blue rounded-xl active:bg-surface2 shrink-0"
              title="Proponi altro"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2 text-center bg-surface2 rounded-xl p-3 mb-4">
            {[
              { label: 'kcal', v: suggestion.calories, cls: 'text-text' },
              { label: 'prot', v: suggestion.protein,  cls: 'text-accent-blue' },
              { label: 'carb', v: suggestion.carbs,    cls: 'text-accent-gold' },
              { label: 'gras', v: suggestion.fat,      cls: 'text-accent-green' },
            ].map(({ label, v, cls }) => (
              <div key={label}>
                <p className={`font-bold text-base ${cls}`}>{v}</p>
                <p className="text-text-dim text-[10px]">{label}</p>
              </div>
            ))}
          </div>

          {/* Ingredients toggle */}
          {suggestion.ingredients?.length > 0 && (
            <button
              onClick={() => setShowIngredients(v => !v)}
              className="flex items-center gap-1 text-text-muted text-xs mb-3 active:text-text"
            >
              <ChevronDown size={14} className={`transition-transform ${showIngredients ? 'rotate-180' : ''}`} />
              Ingredienti ({suggestion.ingredients.length})
            </button>
          )}
          {showIngredients && suggestion.ingredients?.length > 0 && (
            <div className="mb-4 space-y-1 bg-surface2 rounded-xl p-3">
              {suggestion.ingredients.map((ing, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-text-muted">{ing.name}</span>
                  <span className="text-text-dim">{ing.grams}g</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleEaten}
            disabled={added}
            className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${
              added ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-accent-green text-white'
            }`}
          >
            {added ? <><Check size={18} /> Aggiunto!</> : <><Plus size={18} /> Ho mangiato questo</>}
          </button>
        </div>
      )}
    </div>
  )
}
