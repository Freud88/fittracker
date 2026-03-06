import { useState } from 'react'
import { Plus, Camera } from 'lucide-react'
import { useFoodStore } from '../stores/foodStore'
import { useConfigStore } from '../stores/configStore'
import { calcRemaining } from '../utils/macroCalc'
import { getToday } from '../utils/dateUtils'
import { getCurrentTime } from '../utils/dateUtils'
import Header from '../components/layout/Header'
import FoodLog from '../components/food/FoodLog'
import AddMealModal from '../components/food/AddMealModal'
import PhotoMealCapture from '../components/food/PhotoMealCapture'
import MacroSummary from '../components/food/MacroSummary'
import MealSuggestions from '../components/suggestions/MealSuggestions'

const TABS = ['Diario', 'Suggerimenti']

export default function Food() {
  const [activeTab, setActiveTab] = useState('Diario')
  const [showModal, setShowModal] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const { getTodayLog, getTodayTotals, addMeal, removeMeal } = useFoodStore()
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-red text-white font-bold mb-2 active:scale-95 transition-transform"
            >
              <Plus size={18} /> Aggiungi pasto
            </button>
            <button
              onClick={() => setShowCamera(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-text-muted font-medium mb-4 active:scale-95 transition-transform"
            >
              <Camera size={18} className="text-accent-red" /> Fotografa il pasto
            </button>
            <FoodLog meals={meals} onRemove={(id) => removeMeal(today, id)} />
          </>
        )}

        {activeTab === 'Suggerimenti' && (
          <MealSuggestions remaining={remaining} onAdd={handleAddSuggestion} />
        )}
      </div>

      {showModal && (
        <AddMealModal
          onAdd={addMeal}
          onClose={() => setShowModal(false)}
        />
      )}

      {showCamera && (
        <PhotoMealCapture
          onConfirm={(meal) => {
            addMeal(today, {
              id: crypto.randomUUID(),
              time: getCurrentTime(),
              category: 'pranzo',
              quantity: 1,
              unit: 'porzione',
              ...meal,
            })
            setShowCamera(false)
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}
