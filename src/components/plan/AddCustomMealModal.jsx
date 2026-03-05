import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import FoodSearch from '../food/FoodSearch'
import { calcMacroFromFood } from '../../utils/macroCalc'

const categories = ['breakfast', 'lunch', 'snack', 'dinner']
const catLabels  = { breakfast: 'Colazione', lunch: 'Pranzo', snack: 'Spuntino', dinner: 'Cena' }

export default function AddCustomMealModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('lunch')
  const [ingredients, setIngredients] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [grams, setGrams] = useState('')

  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.macros.calories,
      protein:  acc.protein  + ing.macros.protein,
      carbs:    acc.carbs    + ing.macros.carbs,
      fat:      acc.fat      + ing.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  function addIngredient() {
    if (!selectedFood || !grams || parseFloat(grams) <= 0) return
    const macros = calcMacroFromFood(selectedFood, parseFloat(grams))
    setIngredients((prev) => [
      ...prev,
      { name: selectedFood.name, grams: parseFloat(grams), macros },
    ])
    setSelectedFood(null)
    setGrams('')
  }

  function handleSave() {
    if (!name.trim() || ingredients.length === 0) return
    onAdd({
      name,
      category,
      ingredients: ingredients.map((i) => ({ name: i.name, grams: i.grams })),
      calories: Math.round(totals.calories),
      protein:  Math.round(totals.protein * 10) / 10,
      carbs:    Math.round(totals.carbs   * 10) / 10,
      fat:      Math.round(totals.fat     * 10) / 10,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl p-4 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-title text-2xl text-text">Nuovo pasto</h2>
          <button onClick={onClose} className="text-text-muted p-1"><X size={22} /></button>
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="text-text-muted text-xs mb-1 block">Nome pasto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Pollo + riso + verdure"
            className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text outline-none focus:border-accent-blue"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-text-muted text-xs mb-1 block">Categoria</label>
          <div className="flex gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  category === cat ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'
                }`}
              >
                {catLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-3">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Ingredienti</p>

          {ingredients.map((ing, i) => (
            <div key={i} className="flex justify-between items-center bg-surface2 rounded-lg px-3 py-2 mb-1.5">
              <div>
                <p className="text-text text-sm">{ing.name}</p>
                <p className="text-text-dim text-xs">{ing.grams}g · {Math.round(ing.macros.calories)}kcal</p>
              </div>
              <button onClick={() => setIngredients((p) => p.filter((_, j) => j !== i))} className="text-text-dim p-1">
                <X size={14} />
              </button>
            </div>
          ))}

          <FoodSearch onSelect={setSelectedFood} />
          {selectedFood && (
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                inputMode="numeric"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="g"
                className="w-20 bg-surface2 border border-border rounded-lg px-2 py-2 text-text text-center outline-none"
              />
              <button
                onClick={addIngredient}
                className="flex-1 bg-surface2 border border-border rounded-lg py-2 text-text-muted text-sm flex items-center justify-center gap-1 active:bg-border"
              >
                <Plus size={14} /> {selectedFood.name.slice(0, 20)}…
              </button>
            </div>
          )}
        </div>

        {/* Macro totals preview */}
        {ingredients.length > 0 && (
          <div className="bg-surface2 rounded-xl p-3 mb-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Kcal', v: totals.calories },
              { label: 'Prot', v: totals.protein },
              { label: 'Carb', v: totals.carbs },
              { label: 'Gras', v: totals.fat },
            ].map(({ label, v }) => (
              <div key={label}>
                <p className="text-text font-bold text-base">{Math.round(v)}</p>
                <p className="text-text-muted text-[10px]">{label}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!name.trim() || ingredients.length === 0}
          className="w-full bg-accent-green text-white font-bold py-4 rounded-xl text-base disabled:opacity-40 active:scale-95 transition-transform"
        >
          Salva pasto
        </button>
      </div>
    </div>
  )
}
