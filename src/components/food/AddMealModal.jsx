import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Camera } from 'lucide-react'
import FoodSearch from './FoodSearch'
import PhotoMealCapture from './PhotoMealCapture'
import { calcMacroFromFood } from '../../utils/macroCalc'
import { getCurrentTime, getToday } from '../../utils/dateUtils'

const categories = ['colazione', 'pranzo', 'cena', 'spuntino', 'post-workout']

// Alimenti numerabili: parola chiave → grammi per pezzo di default
const COUNTABLE = {
  'uov': 55, 'egg': 55,
  'mel': 180, 'apple': 180,
  'banan': 120,
  'aranci': 200, 'orange': 200,
  'pear': 170,
  'kiwi': 80,
  'fragol': 15, 'strawberr': 15,
  'pesc': 150,
  'albicocc': 40,
  'susina': 40,
  'dattero': 8,
  'fico': 50,
  'mandorl': 1, 'almond': 1,
  'noce': 5, 'walnut': 5,
  'anacardo': 2, 'cashew': 2,
  'pistacchio': 1,
}

function detectCountable(food) {
  const name = (food.name + ' ' + (food.nameEn ?? '')).toLowerCase()
  for (const [key, grams] of Object.entries(COUNTABLE)) {
    if (name.includes(key)) return grams
  }
  return null
}

export default function AddMealModal({ onAdd, onClose }) {
  const [ingredients, setIngredients] = useState([]) // [{ food, quantity, unit, gramsPerPiece, macros }]
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('g')           // 'g' | 'pz'
  const [gramsPerPiece, setGramsPerPiece] = useState('50')
  const [mealName, setMealName] = useState('')
  const [category, setCategory] = useState('pranzo')
  const [time, setTime] = useState(getCurrentTime())
  const [manualMode, setManualMode] = useState(false)
  const [manual, setManual] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [showCamera, setShowCamera] = useState(false)

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

  const totals = ingredients.reduce(
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
      gramsPerPiece: parseFloat(gramsPerPiece),
      grams: qtyGrams,
      macros: currentMacros,
    }])
    setSelectedFood(null)
    setQuantity('')
  }

  function handleRemoveIngredient(idx) {
    setIngredients(ingredients.filter((_, i) => i !== idx))
  }

  function handleAdd() {
    if (manualMode) {
      onAdd(getToday(), {
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
      })
    } else {
      const name = mealName.trim() || ingredients.map(i => i.food.name).join(' + ')
      onAdd(getToday(), {
        id: crypto.randomUUID(),
        time,
        category,
        name,
        quantity: ingredients.reduce((s, i) => s + i.grams, 0),
        unit: 'g',
        calories: totals.calories,
        protein:  totals.protein,
        carbs:    totals.carbs,
        fat:      totals.fat,
      })
    }
    onClose()
  }

  function handlePhotoConfirm(meal) {
    onAdd(getToday(), {
      id: crypto.randomUUID(),
      time,
      category,
      quantity: 1,
      unit: 'porzione',
      ...meal,
    })
    onClose()
  }

  const canSubmitUsda = ingredients.length > 0
  const canSubmit = manualMode
    ? manual.name && manual.calories
    : canSubmitUsda

  return (
    <>
    {showCamera && (
      <PhotoMealCapture
        onConfirm={handlePhotoConfirm}
        onClose={() => setShowCamera(false)}
      />
    )}
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl p-4 pb-12 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-title text-2xl text-text">Aggiungi Pasto</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCamera(true)}
              className="text-accent-red p-1.5 rounded-lg active:bg-surface2"
              title="Fotografa il pasto"
            >
              <Camera size={22} />
            </button>
            <button onClick={onClose} className="text-text-muted p-1">
              <X size={22} />
            </button>
          </div>
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
            {/* Ingredient list */}
            {ingredients.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {ingredients.map((ing, i) => (
                  <div key={i} className="bg-surface2 rounded-xl px-3 py-2.5 flex justify-between items-center">
                    <div>
                      <p className="text-text text-sm font-medium">{ing.food.name}</p>
                      <p className="text-text-dim text-xs">
                        {ing.unit === 'pz'
                          ? `${ing.quantity} pz (${Math.round(ing.grams)}g)`
                          : `${ing.quantity}g`
                        } · {Math.round(ing.macros.calories)} kcal · P{Math.round(ing.macros.protein)}g · C{Math.round(ing.macros.carbs)}g · G{Math.round(ing.macros.fat)}g
                      </p>
                    </div>
                    <button onClick={() => handleRemoveIngredient(i)} className="text-text-dim p-1 shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {/* Totals */}
                <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
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

                {/* Nome pasto */}
                <div>
                  <label className="text-text-muted text-xs mb-1 block">Nome pasto (opzionale)</label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder={ingredients.map(i => i.food.name).join(' + ')}
                    className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text text-sm outline-none focus:border-accent-blue"
                  />
                </div>
              </div>
            )}

            {/* Search + add ingredient row */}
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
                {/* Unit toggle */}
                <div className="flex gap-1.5">
                  {['g', 'pz'].map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        unit === u ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'
                      }`}
                    >
                      {u === 'g' ? 'Grammi' : 'Pezzi'}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-text-muted text-xs mb-1 block">
                      {unit === 'g' ? 'Quantità (g)' : 'Quantità (pz)'}
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={unit === 'g' ? 'es. 150' : 'es. 2'}
                      className="w-full bg-surface2 border border-border rounded-xl px-3 py-3 text-text text-lg outline-none focus:border-accent-blue"
                    />
                  </div>

                  {unit === 'pz' && (
                    <div className="w-24">
                      <label className="text-text-muted text-xs mb-1 block">g/pezzo</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={gramsPerPiece}
                        onChange={(e) => setGramsPerPiece(e.target.value)}
                        className="w-full bg-surface2 border border-border rounded-xl px-3 py-3 text-text text-lg outline-none focus:border-accent-blue"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAddIngredient}
                    disabled={!currentMacros}
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
    </>
  )
}
