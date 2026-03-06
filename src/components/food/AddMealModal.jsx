import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Camera, Sparkles, RefreshCw } from 'lucide-react'
import FoodSearch from './FoodSearch'
import PhotoMealCapture from './PhotoMealCapture'
import { calcMacroFromFood } from '../../utils/macroCalc'
import { getCurrentTime, getToday } from '../../utils/dateUtils'
import { parseMealFromText } from '../../services/foodTextParser'

const categories = ['colazione', 'pranzo', 'cena', 'spuntino', 'post-workout']

const COUNTABLE = {
  'uov': 55, 'egg': 55,
  'mel': 180, 'apple': 180,
  'banan': 120,
  'aranci': 200, 'orange': 200,
  'pear': 170, 'kiwi': 80,
  'fragol': 15, 'strawberr': 15,
  'pesc': 150, 'albicocc': 40,
  'susina': 40, 'dattero': 8, 'fico': 50,
  'mandorl': 1, 'almond': 1,
  'noce': 5, 'walnut': 5,
  'anacardo': 2, 'cashew': 2, 'pistacchio': 1,
}

function detectCountable(food) {
  const name = (food.name + ' ' + (food.nameEn ?? '')).toLowerCase()
  for (const [key, grams] of Object.entries(COUNTABLE)) {
    if (name.includes(key)) return grams
  }
  return null
}

export default function AddMealModal({ onAdd, onClose }) {
  const [mode, setMode]           = useState('cerca') // 'cerca' | 'ai'
  const [category, setCategory]   = useState('pranzo')
  const [time, setTime]           = useState(getCurrentTime())
  const [showCamera, setShowCamera] = useState(false)

  // CERCA state
  const [ingredients, setIngredients]     = useState([])
  const [selectedFood, setSelectedFood]   = useState(null)
  const [quantity, setQuantity]           = useState('')
  const [unit, setUnit]                   = useState('g')
  const [gramsPerPiece, setGramsPerPiece] = useState('50')
  const [mealName, setMealName]           = useState('')

  // AI state
  const [aiText, setAiText]       = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult]   = useState(null)
  const [aiError, setAiError]     = useState(null)

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
    (acc, ing) => ({ calories: acc.calories + ing.macros.calories, protein: acc.protein + ing.macros.protein, carbs: acc.carbs + ing.macros.carbs, fat: acc.fat + ing.macros.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  function handleAddIngredient() {
    if (!currentMacros) return
    setIngredients([...ingredients, { food: selectedFood, quantity: parseFloat(quantity), unit, gramsPerPiece: parseFloat(gramsPerPiece), grams: qtyGrams, macros: currentMacros }])
    setSelectedFood(null)
    setQuantity('')
  }

  async function handleAnalyze() {
    if (!aiText.trim()) return
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    try {
      setAiResult(await parseMealFromText(aiText))
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  function handleAdd() {
    if (mode === 'ai' && aiResult) {
      onAdd(getToday(), {
        id: crypto.randomUUID(), time, category,
        name: aiResult.name, quantity: 1, unit: 'porzione',
        calories: Number(aiResult.calories) || 0,
        protein:  Number(aiResult.protein)  || 0,
        carbs:    Number(aiResult.carbs)    || 0,
        fat:      Number(aiResult.fat)      || 0,
      })
    } else {
      const name = mealName.trim() || ingredients.map(i => i.food.name).join(' + ')
      onAdd(getToday(), {
        id: crypto.randomUUID(), time, category, name,
        quantity: ingredients.reduce((s, i) => s + i.grams, 0), unit: 'g',
        calories: totals.calories, protein: totals.protein, carbs: totals.carbs, fat: totals.fat,
      })
    }
    onClose()
  }

  function handlePhotoConfirm(meal) {
    onAdd(getToday(), { id: crypto.randomUUID(), time, category, quantity: 1, unit: 'porzione', ...meal })
    onClose()
  }

  const canSubmit = mode === 'ai' ? !!aiResult : ingredients.length > 0

  return (
    <>
      {showCamera && <PhotoMealCapture onConfirm={handlePhotoConfirm} onClose={() => setShowCamera(false)} />}
      <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
        <div className="w-full bg-surface rounded-t-2xl p-4 pb-12 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

          <div className="flex justify-between items-center mb-4">
            <h2 className="font-title text-2xl text-text">Aggiungi Pasto</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowCamera(true)} className="text-accent-red p-1.5 rounded-lg active:bg-surface2" title="Fotografa il pasto">
                <Camera size={22} />
              </button>
              <button onClick={onClose} className="text-text-muted p-1"><X size={22} /></button>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            {[{ key: 'cerca', label: 'Cerca (USDA)' }, { key: 'ai', label: '✦ Descrivi' }].map(({ key, label }) => (
              <button key={key} onClick={() => setMode(key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === key ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── CERCA ── */}
          {mode === 'cerca' && (
            <>
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
                      <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-text-dim p-1 shrink-0"><Trash2 size={15} /></button>
                    </div>
                  ))}
                  <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                    {[['Kcal', totals.calories], ['Prot', totals.protein], ['Carb', totals.carbs], ['Gras', totals.fat]].map(([label, v]) => (
                      <div key={label}>
                        <p className="text-text font-bold text-base">{Math.round(v)}</p>
                        <p className="text-text-muted text-[10px]">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-text-muted text-xs mb-1 block">Nome pasto (opzionale)</label>
                    <input type="text" value={mealName} onChange={e => setMealName(e.target.value)}
                      placeholder={ingredients.map(i => i.food.name).join(' + ')}
                      className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text text-sm outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>
              )}

              <div className="mb-3">
                <FoodSearch onSelect={setSelectedFood} autoFocus={ingredients.length === 0} />
              </div>

              {selectedFood && (
                <div className="bg-surface2 rounded-xl p-3 mb-3 flex justify-between items-start">
                  <div>
                    <p className="text-text font-medium text-sm">{selectedFood.name}</p>
                    <p className="text-text-muted text-xs mt-0.5">per 100g: {selectedFood.per100g.calories}kcal · P{selectedFood.per100g.protein}g · C{selectedFood.per100g.carbs}g · G{selectedFood.per100g.fat}g</p>
                  </div>
                  <button onClick={() => setSelectedFood(null)} className="text-text-dim p-1 shrink-0"><X size={14} /></button>
                </div>
              )}

              {selectedFood && (
                <div className="mb-3 space-y-2">
                  <div className="flex gap-1.5">
                    {['g', 'pz'].map(u => (
                      <button key={u} onClick={() => setUnit(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${unit === u ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'}`}
                      >
                        {u === 'g' ? 'Grammi' : 'Pezzi'}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-text-muted text-xs mb-1 block">{unit === 'g' ? 'Quantità (g)' : 'Quantità (pz)'}</label>
                      <input type="number" inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)}
                        placeholder={unit === 'g' ? 'es. 150' : 'es. 2'}
                        className="w-full bg-surface2 border border-border rounded-xl px-3 py-3 text-text text-lg outline-none focus:border-accent-blue"
                      />
                    </div>
                    {unit === 'pz' && (
                      <div className="w-24">
                        <label className="text-text-muted text-xs mb-1 block">g/pezzo</label>
                        <input type="number" inputMode="numeric" value={gramsPerPiece} onChange={e => setGramsPerPiece(e.target.value)}
                          className="w-full bg-surface2 border border-border rounded-xl px-3 py-3 text-text text-lg outline-none focus:border-accent-blue"
                        />
                      </div>
                    )}
                    <button onClick={handleAddIngredient} disabled={!currentMacros}
                      className="self-end bg-surface2 border border-border rounded-xl px-4 py-3 text-accent-blue font-bold text-sm disabled:opacity-40 active:bg-border"
                    >
                      + Aggiungi
                    </button>
                  </div>
                </div>
              )}

              {currentMacros && (
                <div className="bg-surface2 rounded-xl p-3 mb-3 grid grid-cols-4 gap-2 text-center">
                  {[['Kcal', currentMacros.calories], ['Prot', currentMacros.protein], ['Carb', currentMacros.carbs], ['Gras', currentMacros.fat]].map(([label, v]) => (
                    <div key={label}>
                      <p className="text-text font-bold text-base">{Math.round(v)}</p>
                      <p className="text-text-muted text-[10px]">{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── AI DESCRIVI ── */}
          {mode === 'ai' && (
            <div className="space-y-3 mb-3">
              <textarea
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                placeholder={"Es: pasta al tonno con olio d'oliva e insalata mista, circa 200g\nOppure: 2 uova strapazzate con prosciutto"}
                rows={3}
                className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text text-sm outline-none focus:border-accent-blue resize-none"
              />
              <button onClick={handleAnalyze} disabled={!aiText.trim() || aiLoading}
                className="w-full bg-surface2 border border-border py-2.5 rounded-xl text-sm font-medium text-text-muted disabled:opacity-40 flex items-center justify-center gap-2 active:bg-border"
              >
                {aiLoading
                  ? <><RefreshCw size={15} className="animate-spin" /> Analisi in corso…</>
                  : <><Sparkles size={15} /> Analizza con AI</>
                }
              </button>

              {aiError && <p className="text-accent-red text-xs px-1">{aiError}</p>}

              {aiResult && (
                <div className="bg-surface2 rounded-xl p-3 space-y-2">
                  <div>
                    <label className="text-text-muted text-xs mb-1 block">Nome</label>
                    <input type="text" value={aiResult.name} onChange={e => setAiResult({ ...aiResult, name: e.target.value })}
                      className="w-full bg-surface rounded-lg px-3 py-2 text-text text-sm outline-none focus:ring-1 focus:ring-accent-blue/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[['calories', 'Calorie (kcal)'], ['protein', 'Proteine (g)'], ['carbs', 'Carboidrati (g)'], ['fat', 'Grassi (g)']].map(([key, label]) => (
                      <div key={key}>
                        <label className="text-text-muted text-xs mb-1 block">{label}</label>
                        <input type="number" inputMode="decimal" value={aiResult[key]}
                          onChange={e => setAiResult({ ...aiResult, [key]: e.target.value })}
                          className="w-full bg-surface rounded-lg px-3 py-2 text-text text-sm outline-none focus:ring-1 focus:ring-accent-blue/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category */}
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">Categoria</label>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${category === cat ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="mb-4">
            <label className="text-text-muted text-xs mb-1 block">Orario</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="bg-surface2 border border-border rounded-xl px-3 py-2.5 text-text outline-none focus:border-accent-blue"
            />
          </div>

          <button onClick={handleAdd} disabled={!canSubmit}
            className="w-full bg-accent-red text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Plus size={18} /> Aggiungi
          </button>
        </div>
      </div>
    </>
  )
}
