import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import FoodSearch from './FoodSearch'
import { calcMacroFromFood } from '../../utils/macroCalc'
import { getCurrentTime, getToday } from '../../utils/dateUtils'

const categories = ['colazione', 'pranzo', 'cena', 'spuntino', 'post-workout']

export default function AddMealModal({ onAdd, onClose }) {
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('pranzo')
  const [time, setTime] = useState(getCurrentTime())
  const [manualMode, setManualMode] = useState(false)
  const [manual, setManual] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' })

  const macros = selectedFood && quantity
    ? calcMacroFromFood(selectedFood, parseFloat(quantity))
    : null

  function handleAdd() {
    const meal = manualMode
      ? {
          id: crypto.randomUUID(),
          time,
          category,
          name: manual.name,
          quantity: 1,
          unit: 'porzione',
          calories: parseFloat(manual.calories) || 0,
          protein:  parseFloat(manual.protein)  || 0,
          carbs:    parseFloat(manual.carbs)    || 0,
          fat:      parseFloat(manual.fat)      || 0,
        }
      : {
          id: crypto.randomUUID(),
          time,
          category,
          name: selectedFood.name,
          quantity: parseFloat(quantity),
          unit: 'g',
          calories: macros.calories,
          protein:  macros.protein,
          carbs:    macros.carbs,
          fat:      macros.fat,
          foodId: selectedFood.id,
        }

    onAdd(getToday(), meal)
    onClose()
  }

  const canSubmit = manualMode
    ? manual.name && manual.calories
    : selectedFood && quantity && parseFloat(quantity) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl p-4 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-title text-2xl text-text">Aggiungi Pasto</h2>
          <button onClick={onClose} className="text-text-muted p-1">
            <X size={22} />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setManualMode(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              !manualMode ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'
            }`}
          >
            Cerca (USDA)
          </button>
          <button
            onClick={() => setManualMode(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              manualMode ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'
            }`}
          >
            Manuale
          </button>
        </div>

        {!manualMode ? (
          <>
            <div className="mb-3">
              <FoodSearch onSelect={setSelectedFood} autoFocus />
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

            {macros && (
              <div className="bg-surface2 rounded-xl p-3 mb-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Kcal', v: macros.calories },
                  { label: 'Prot', v: macros.protein },
                  { label: 'Carb', v: macros.carbs },
                  { label: 'Gras', v: macros.fat },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <p className="text-text font-bold text-base">{Math.round(v)}</p>
                    <p className="text-text-muted text-[10px]">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 mb-3">
            <div>
              <label className="text-text-muted text-xs mb-1 block">Nome pasto</label>
              <input
                type="text"
                value={manual.name}
                onChange={(e) => setManual({ ...manual, name: e.target.value })}
                placeholder="es. Petto di pollo"
                className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text outline-none focus:border-accent-blue"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'calories', label: 'Calorie' },
                { key: 'protein',  label: 'Proteine (g)' },
                { key: 'carbs',    label: 'Carboidrati (g)' },
                { key: 'fat',      label: 'Grassi (g)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-text-muted text-xs mb-1 block">{label}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={manual[key]}
                    onChange={(e) => setManual({ ...manual, [key]: e.target.value })}
                    className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text outline-none focus:border-accent-blue"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <div className="mb-3">
          <label className="text-text-muted text-xs mb-1 block">Categoria</label>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  category === cat ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="mb-4">
          <label className="text-text-muted text-xs mb-1 block">Orario</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text outline-none focus:border-accent-blue"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!canSubmit}
          className="w-full bg-accent-red text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-transform"
        >
          <Plus size={18} />
          Aggiungi
        </button>
      </div>
    </div>
  )
}
