import { useState, useRef } from 'react'
import { Camera, Upload, X, Check, RefreshCw, AlertCircle, Trash2 } from 'lucide-react'
import { estimateFoodFromPhoto, fileToBase64, resizeImage } from '../../services/foodVision'

const CONFIDENCE_LABEL = { high: '● Alta', medium: '● Media', low: '● Bassa' }
const CONFIDENCE_COLOR = { high: 'text-accent-green', medium: 'text-accent-gold', low: 'text-accent-red' }

function toDishEdit(d) {
  const qty = d.quantity_g || 1
  return {
    name:       d.name,
    confidence: d.confidence,
    editQty:    qty,
    cal_per_g:   d.calories  / qty,
    prot_per_g:  d.protein_g / qty,
    carbs_per_g: d.carbs_g   / qty,
    fat_per_g:   d.fat_g     / qty,
  }
}

export default function PhotoMealCapture({ onConfirm, onClose }) {
  const [phase, setPhase]               = useState('capture')
  const [preview, setPreview]           = useState(null)
  const [estimate, setEstimate]         = useState(null)
  const [editedDishes, setEditedDishes] = useState([])
  const [error, setError]               = useState(null)
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file?.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
    setPhase('analyzing')
    setError(null)

    try {
      const resized = await resizeImage(file)
      const base64  = await fileToBase64(resized)
      const result  = await estimateFoodFromPhoto(base64, 'image/jpeg')

      if (!result.dishes?.length) {
        throw new Error(result.notes || 'Nessun alimento riconosciuto. Riprova con una foto più chiara.')
      }

      setEstimate(result)
      setEditedDishes(result.dishes.map(toDishEdit))
      setPhase('review')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  function openPicker(useCamera) {
    if (useCamera) fileRef.current.setAttribute('capture', 'environment')
    else fileRef.current.removeAttribute('capture')
    fileRef.current.value = ''
    fileRef.current.click()
  }

  function updateDish(i, field, value) {
    setEditedDishes(prev => prev.map((d, j) => j === i ? { ...d, [field]: value } : d))
  }

  function removeDish(i) {
    setEditedDishes(prev => prev.filter((_, j) => j !== i))
  }

  const totals = editedDishes.reduce((acc, d) => {
    const qty = parseFloat(d.editQty) || 0
    return {
      calories:  acc.calories  + d.cal_per_g   * qty,
      protein_g: acc.protein_g + d.prot_per_g  * qty,
      carbs_g:   acc.carbs_g   + d.carbs_per_g * qty,
      fat_g:     acc.fat_g     + d.fat_per_g   * qty,
    }
  }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })

  function handleConfirm() {
    onConfirm({
      name:     editedDishes.map(d => d.name).join(' + ') || 'Pasto fotografato',
      calories: Math.round(totals.calories),
      protein:  Math.round(totals.protein_g),
      carbs:    Math.round(totals.carbs_g),
      fat:      Math.round(totals.fat_g),
      source:   'photo',
    })
  }

  function reset() {
    setPhase('capture')
    setEstimate(null)
    setPreview(null)
    setError(null)
    setEditedDishes([])
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={onClose}>
      <div className="flex flex-col h-full" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-12 pb-4 shrink-0">
          <button onClick={onClose} className="text-white/60 p-1"><X size={24} /></button>
          <span className="text-white font-semibold text-base">Fotografa il pasto</span>
          <div className="w-8" />
        </div>

        {/* CAPTURE */}
        {phase === 'capture' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
            <div className="w-56 h-56 rounded-3xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-3">
              <Camera size={52} className="text-white/20" />
              <span className="text-white/30 text-xs">foto o galleria</span>
            </div>
            <button
              onClick={() => openPicker(true)}
              className="w-full max-w-xs flex items-center justify-center gap-2 bg-accent-red text-white px-8 py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform"
            >
              <Camera size={20} /> Scatta foto
            </button>
            <button
              onClick={() => openPicker(false)}
              className="w-full max-w-xs flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-2xl active:bg-white/10"
            >
              <Upload size={20} /> Dalla galleria
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          </div>
        )}

        {/* ANALYZING */}
        {phase === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            {preview && <img src={preview} alt="" className="w-64 h-64 object-cover rounded-2xl opacity-40" />}
            <RefreshCw size={32} className="text-white animate-spin" />
            <p className="text-white/60 text-sm">Analisi del pasto in corso…</p>
          </div>
        )}

        {/* REVIEW */}
        {phase === 'review' && estimate && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              {preview && (
                <img src={preview} alt="pasto" className="w-full max-h-64 object-contain rounded-2xl bg-black" />
              )}

              {/* Alimenti modificabili */}
              <div className="bg-white/8 rounded-2xl p-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Alimenti riconosciuti — modifica se necessario</p>
                {editedDishes.map((dish, i) => (
                  <div key={i} className="py-2.5 border-b border-white/8 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        value={dish.name}
                        onChange={e => updateDish(i, 'name', e.target.value)}
                        className="flex-1 bg-white/10 text-white text-sm font-medium rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-white/30"
                      />
                      <button onClick={() => removeDish(i)} className="text-white/30 p-1 shrink-0 active:text-accent-red">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={dish.editQty}
                        onChange={e => updateDish(i, 'editQty', e.target.value)}
                        className="w-20 bg-white/10 text-white text-sm text-right rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-white/30"
                      />
                      <span className="text-white/40 text-xs">g</span>
                      <span className={`text-xs ml-auto ${CONFIDENCE_COLOR[dish.confidence]}`}>
                        {Math.round((parseFloat(dish.editQty) || 0) * dish.cal_per_g)} kcal · {CONFIDENCE_LABEL[dish.confidence]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totali automatici */}
              <div className="bg-white/8 rounded-2xl p-4 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Kcal', v: totals.calories },
                  { label: 'Prot', v: totals.protein_g },
                  { label: 'Carb', v: totals.carbs_g },
                  { label: 'Gras', v: totals.fat_g },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <p className="text-white font-bold text-base">{Math.round(v)}</p>
                    <p className="text-white/40 text-[10px]">{label}</p>
                  </div>
                ))}
              </div>

              {/* Note AI */}
              {estimate.notes && (
                <div className="flex gap-2 bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-3">
                  <AlertCircle size={15} className="text-accent-gold shrink-0 mt-0.5" />
                  <p className="text-accent-gold text-xs leading-relaxed">{estimate.notes}</p>
                </div>
              )}
            </div>

            {/* Bottoni sticky */}
            <div className="shrink-0 px-4 pb-10 pt-3 flex gap-3 border-t border-white/8">
              <button
                onClick={reset}
                className="flex-1 border border-white/20 text-white py-3.5 rounded-2xl text-sm active:bg-white/10"
              >
                Riprova
              </button>
              <button
                onClick={handleConfirm}
                disabled={editedDishes.length === 0}
                className="flex-1 bg-accent-green text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
              >
                <Check size={18} /> Aggiungi
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <AlertCircle size={48} className="text-accent-red" />
            <p className="text-white font-medium">Analisi non riuscita</p>
            <p className="text-white/50 text-sm leading-relaxed">{error}</p>
            <button onClick={reset} className="mt-2 bg-white/10 text-white px-6 py-3 rounded-full active:bg-white/20">
              Riprova
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
