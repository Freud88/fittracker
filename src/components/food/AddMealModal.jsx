import { useState } from 'react'
import { X, Plus, Camera, Sparkles, RefreshCw } from 'lucide-react'
import PhotoMealCapture from './PhotoMealCapture'
import { getCurrentTime, getToday, formatDate } from '../../utils/dateUtils'
import { parseMealFromText } from '../../services/foodTextParser'

const categories = ['colazione', 'pranzo', 'cena', 'spuntino', 'post-workout']

export default function AddMealModal({ onAdd, onClose, date: dateProp }) {
  const date = dateProp || getToday()
  const [category, setCategory]     = useState('pranzo')
  const [time, setTime]             = useState(getCurrentTime())
  const [showCamera, setShowCamera] = useState(false)

  const [aiText, setAiText]         = useState('')
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiResult, setAiResult]     = useState(null)
  const [aiError, setAiError]       = useState(null)

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
    if (!aiResult) return
    onAdd(date, {
      id: crypto.randomUUID(), time, category,
      name: aiResult.name, quantity: 1, unit: 'porzione',
      calories: Number(aiResult.calories) || 0,
      protein:  Number(aiResult.protein)  || 0,
      carbs:    Number(aiResult.carbs)    || 0,
      fat:      Number(aiResult.fat)      || 0,
    })
    onClose()
  }

  function handlePhotoConfirm(meal) {
    onAdd(date, { id: crypto.randomUUID(), time, category, quantity: 1, unit: 'porzione', ...meal })
    onClose()
  }

  return (
    <>
      {showCamera && <PhotoMealCapture onConfirm={handlePhotoConfirm} onClose={() => setShowCamera(false)} />}
      <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
        <div className="w-full bg-surface rounded-t-2xl p-4 pb-12 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-title text-2xl text-text">Aggiungi Pasto</h2>
              <p className={`text-xs mt-0.5 capitalize ${date === getToday() ? 'text-accent-green' : 'text-accent-gold'}`}>
                {date === getToday() ? 'Oggi' : formatDate(date)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowCamera(true)} className="text-accent-red p-1.5 rounded-lg active:bg-surface2" title="Fotografa il pasto">
                <Camera size={22} />
              </button>
              <button onClick={onClose} className="text-text-muted p-1"><X size={22} /></button>
            </div>
          </div>

          {/* AI text input */}
          <div className="space-y-3 mb-4">
            <textarea
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              placeholder={"Es: pasta al tonno con olio d'oliva e insalata mista, circa 200g\nOppure: 2 uova strapazzate con prosciutto"}
              rows={3}
              autoFocus
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

          <button onClick={handleAdd} disabled={!aiResult}
            className="w-full bg-accent-red text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Plus size={18} /> Aggiungi
          </button>
        </div>
      </div>
    </>
  )
}
