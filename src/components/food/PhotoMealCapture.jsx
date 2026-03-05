import { useState, useRef } from 'react'
import { Camera, Upload, X, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { estimateFoodFromPhoto, fileToBase64, resizeImage } from '../../services/foodVision'

const CONFIDENCE_LABEL = { high: '● Alta', medium: '● Media', low: '● Bassa' }
const CONFIDENCE_COLOR = { high: 'text-accent-green', medium: 'text-accent-gold', low: 'text-accent-red' }

export default function PhotoMealCapture({ onConfirm, onClose }) {
  const [phase, setPhase]       = useState('capture') // capture | analyzing | review | error
  const [preview, setPreview]   = useState(null)
  const [estimate, setEstimate] = useState(null)
  const [error, setError]       = useState(null)
  const [edited, setEdited]     = useState({})
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
      setEdited(result.total)
      setPhase('review')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  function openPicker(useCamera) {
    if (useCamera) {
      fileRef.current.setAttribute('capture', 'environment')
    } else {
      fileRef.current.removeAttribute('capture')
    }
    fileRef.current.value = ''
    fileRef.current.click()
  }

  function handleConfirm() {
    onConfirm({
      name:     estimate.dishes.map(d => d.name).join(' + '),
      calories: Number(edited.calories)  || 0,
      protein:  Number(edited.protein_g) || 0,
      carbs:    Number(edited.carbs_g)   || 0,
      fat:      Number(edited.fat_g)     || 0,
      source:   'photo',
    })
  }

  function reset() {
    setPhase('capture')
    setEstimate(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={onClose}>
      <div className="flex flex-col h-full" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-12 pb-4">
          <button onClick={onClose} className="text-white/60 p-1">
            <X size={24} />
          </button>
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

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}
            />
          </div>
        )}

        {/* ANALYZING */}
        {phase === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            {preview && (
              <img src={preview} alt="" className="w-64 h-64 object-cover rounded-2xl opacity-40" />
            )}
            <RefreshCw size={32} className="text-white animate-spin" />
            <p className="text-white/60 text-sm">Gemini sta analizzando il pasto…</p>
          </div>
        )}

        {/* REVIEW */}
        {phase === 'review' && estimate && (
          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
            {preview && (
              <img src={preview} alt="pasto" className="w-full h-44 object-cover rounded-2xl" />
            )}

            {/* Alimenti riconosciuti */}
            <div className="bg-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Alimenti riconosciuti</p>
              {estimate.dishes.map((dish, i) => (
                <div key={i} className="py-2.5 border-b border-white/8 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium text-sm">{dish.name}</p>
                      <p className={`text-xs mt-0.5 ${CONFIDENCE_COLOR[dish.confidence]}`}>
                        ~{dish.quantity_g}g · {CONFIDENCE_LABEL[dish.confidence]}
                      </p>
                    </div>
                    <p className="text-white/70 text-sm font-medium">{dish.calories} kcal</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totali modificabili */}
            <div className="bg-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Totali — modifica se necessario</p>
              {[
                { key: 'calories',  label: 'Calorie',     unit: 'kcal', cls: 'text-accent-red' },
                { key: 'protein_g', label: 'Proteine',    unit: 'g',    cls: 'text-accent-blue' },
                { key: 'carbs_g',   label: 'Carboidrati', unit: 'g',    cls: 'text-accent-gold' },
                { key: 'fat_g',     label: 'Grassi',      unit: 'g',    cls: 'text-accent-green' },
              ].map(({ key, label, unit, cls }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className={`text-sm font-medium ${cls}`}>{label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={edited[key] ?? 0}
                      onChange={e => setEdited(p => ({ ...p, [key]: e.target.value }))}
                      className="w-20 bg-white/10 text-white text-right rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-white/30"
                    />
                    <span className="text-white/30 text-xs w-8">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Note Gemini */}
            {estimate.notes && (
              <div className="flex gap-2 bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-3">
                <AlertCircle size={15} className="text-accent-gold shrink-0 mt-0.5" />
                <p className="text-accent-gold text-xs leading-relaxed">{estimate.notes}</p>
              </div>
            )}

            {/* Azioni */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={reset}
                className="flex-1 border border-white/20 text-white py-3.5 rounded-2xl text-sm active:bg-white/10"
              >
                Riprova
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-accent-green text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
            <button
              onClick={reset}
              className="mt-2 bg-white/10 text-white px-6 py-3 rounded-full active:bg-white/20"
            >
              Riprova
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
