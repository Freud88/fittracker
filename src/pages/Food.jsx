import { useState } from 'react'
import { Plus, Database } from 'lucide-react'
import { useFoodStore } from '../stores/foodStore'
import { useConfigStore } from '../stores/configStore'
import { calcRemaining } from '../utils/macroCalc'
import { getToday } from '../utils/dateUtils'
import Header from '../components/layout/Header'
import FoodLog from '../components/food/FoodLog'
import AddMealModal from '../components/food/AddMealModal'
import MacroSummary from '../components/food/MacroSummary'
import MealSuggestions from '../components/suggestions/MealSuggestions'

const TABS = ['Diario', 'Suggerimenti', 'Database']

export default function Food() {
  const [activeTab, setActiveTab] = useState('Diario')
  const [showModal, setShowModal] = useState(false)
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' })

  const { getTodayLog, getTodayTotals, foodDatabase, addMeal, removeMeal, addCustomFood, removeCustomFood } = useFoodStore()
  // FoodSearch ora usa USDA direttamente — foodDatabase usato solo per la tab Database locale
  const { targets } = useConfigStore()

  const today = getToday()
  const meals = getTodayLog()
  const totals = getTodayTotals()
  const remaining = calcRemaining(targets, totals)

  function handleAddSuggestion(suggestion) {
    const meal = {
      id: crypto.randomUUID(),
      time: new Date().toTimeString().slice(0, 5),
      category: suggestion.category || 'spuntino',
      name: suggestion.name,
      quantity: 1,
      unit: 'porzione',
      calories: suggestion.calories,
      protein: suggestion.protein,
      carbs: suggestion.carbs,
      fat: suggestion.fat,
    }
    addMeal(today, meal)
    setActiveTab('Diario')
  }

  function handleSaveCustomFood() {
    if (!customFood.name) return
    addCustomFood({
      name: customFood.name,
      per100g: {
        calories: parseFloat(customFood.calories) || 0,
        protein: parseFloat(customFood.protein) || 0,
        carbs: parseFloat(customFood.carbs) || 0,
        fat: parseFloat(customFood.fat) || 0,
      },
    })
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' })
    setShowAddCustom(false)
  }

  return (
    <div>
      <Header currentPage="food" />

      {/* Macro summary bar */}
      <div className="px-4 mb-4">
        <div className="bg-surface rounded-xl p-3">
          <div className="flex justify-between mb-2">
            <span className="text-text-muted text-xs">Calorie: <span className="text-text font-bold">{Math.round(totals.calories)}</span> / {targets.calories}</span>
            <span className="text-text-muted text-xs">Rimaste: <span className="text-accent-green font-bold">{Math.round(remaining.calories)}</span></span>
          </div>
          <MacroSummary totals={totals} targets={targets} />
        </div>
      </div>

      {/* Tabs */}
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
        {activeTab === 'Diario' && (
          <>
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-red text-white font-bold mb-4 active:scale-95 transition-transform"
            >
              <Plus size={18} /> Aggiungi pasto
            </button>
            <FoodLog meals={meals} onRemove={(id) => removeMeal(today, id)} />
          </>
        )}

        {activeTab === 'Suggerimenti' && (
          <MealSuggestions remaining={remaining} onAdd={handleAddSuggestion} />
        )}

        {activeTab === 'Database' && (
          <div>
            {!showAddCustom ? (
              <button
                onClick={() => setShowAddCustom(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-text-muted text-sm mb-4"
              >
                <Plus size={16} /> Aggiungi alimento custom
              </button>
            ) : (
              <div className="bg-surface rounded-xl p-4 mb-4 space-y-2">
                <p className="text-text font-semibold text-sm mb-2">Nuovo alimento (per 100g)</p>
                <input
                  type="text"
                  placeholder="Nome alimento"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-text text-sm outline-none focus:border-accent-blue"
                />
                <div className="grid grid-cols-2 gap-2">
                  {['calories', 'protein', 'carbs', 'fat'].map((f) => (
                    <input
                      key={f}
                      type="number"
                      inputMode="decimal"
                      placeholder={f === 'calories' ? 'Kcal' : f === 'protein' ? 'Proteine g' : f === 'carbs' ? 'Carb g' : 'Grassi g'}
                      value={customFood[f]}
                      onChange={(e) => setCustomFood({ ...customFood, [f]: e.target.value })}
                      className="bg-surface2 border border-border rounded-lg px-3 py-2 text-text text-sm outline-none focus:border-accent-blue"
                    />
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowAddCustom(false)} className="flex-1 py-2 rounded-lg bg-surface2 text-text-muted text-sm">Annulla</button>
                  <button onClick={handleSaveCustomFood} className="flex-1 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold">Salva</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {foodDatabase.map((food) => (
                <div key={food.id} className="bg-surface rounded-xl px-3 py-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-text text-sm">{food.name}</p>
                    <p className="text-text-dim text-xs">
                      {food.per100g.calories}kcal · P{food.per100g.protein} C{food.per100g.carbs} G{food.per100g.fat}
                    </p>
                  </div>
                  {food.custom && (
                    <button onClick={() => removeCustomFood(food.id)} className="text-text-dim text-xs px-2 py-1 rounded bg-surface2">
                      rimuovi
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddMealModal
          onAdd={addMeal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
