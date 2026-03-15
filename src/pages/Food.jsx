import { useState } from 'react'
import { Plus, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFoodStore } from '../stores/foodStore'
import { useConfigStore } from '../stores/configStore'
import { calcRemaining } from '../utils/macroCalc'
import { getToday, formatDate, getCurrentTime } from '../utils/dateUtils'
import Header from '../components/layout/Header'
import FoodLog from '../components/food/FoodLog'
import AddMealModal from '../components/food/AddMealModal'
import PhotoMealCapture from '../components/food/PhotoMealCapture'
import MacroSummary from '../components/food/MacroSummary'
import MealSuggestions from '../components/suggestions/MealSuggestions'
import FoodReport from '../components/food/FoodReport'

const TABS = ['Diario', 'Suggerimenti', 'Report']

function offsetDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Food() {
  const [activeTab, setActiveTab] = useState('Diario')
  const [showModal, setShowModal] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getToday())

  const { getLogForDate, getTotalsForDate, addMeal, removeMeal } = useFoodStore()
  const { targets } = useConfigStore()

  const today = getToday()
  const isToday = selectedDate === today
  const meals = getLogForDate(selectedDate)
  const totals = getTotalsForDate(selectedDate)
  const remaining = calcRemaining(targets, totals)

  function goBack() { setSelectedDate(offsetDate(selectedDate, -1)) }
  function goForward() {
    const next = offsetDate(selectedDate, 1)
    if (next <= today) setSelectedDate(next)
  }

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
    addMeal(selectedDate, meal)
    setActiveTab('Diario')
  }

  return (
    <div>
      <Header currentPage="food" />

      {/* Date navigator */}
      <div className="flex items-center justify-between px-4 mb-3">
        <button onClick={goBack} className="p-1.5 rounded-lg bg-surface text-text-muted active:bg-surface2">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setSelectedDate(today)}
          className="flex-1 text-center text-sm font-medium text-text capitalize mx-2"
        >
          {isToday ? 'Oggi' : formatDate(selectedDate)}
        </button>
        <button onClick={goForward} disabled={isToday}
          className="p-1.5 rounded-lg bg-surface text-text-muted active:bg-surface2 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

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
            <FoodLog meals={meals} onRemove={(id) => removeMeal(selectedDate, id)} />
          </>
        )}

        {activeTab === 'Suggerimenti' && (
          <MealSuggestions remaining={remaining} onAdd={handleAddSuggestion} />
        )}

        {activeTab === 'Report' && <FoodReport />}
      </div>

      {showModal && (
        <AddMealModal
          onAdd={addMeal}
          date={selectedDate}
          onClose={() => setShowModal(false)}
        />
      )}

      {showCamera && (
        <PhotoMealCapture
          onConfirm={(meal) => {
            addMeal(selectedDate, {
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
