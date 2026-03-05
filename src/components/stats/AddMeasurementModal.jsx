import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { getToday } from '../../utils/dateUtils'

const BODY_FIELDS = [
  { key: 'vita',    label: 'Vita',    unit: 'cm' },
  { key: 'fianchi', label: 'Fianchi', unit: 'cm' },
  { key: 'petto',   label: 'Petto',   unit: 'cm' },
  { key: 'braccio', label: 'Braccio', unit: 'cm' },
  { key: 'coscia',  label: 'Coscia',  unit: 'cm' },
]

const PLICA_FIELDS = [
  { key: 'plica_tricipite',       label: 'Tricipite',        unit: 'mm' },
  { key: 'plica_sottoscapolare',  label: 'Sottoscapolare',   unit: 'mm' },
  { key: 'plica_soprailliaca',    label: 'Soprailliaca',     unit: 'mm' },
  { key: 'plica_addome',          label: 'Addome',           unit: 'mm' },
  { key: 'plica_coscia',          label: 'Coscia',           unit: 'mm' },
]

export default function AddMeasurementModal({ onAdd, onClose }) {
  const [date,   setDate]   = useState(getToday())
  const [weight, setWeight] = useState('')
  const [body,   setBody]   = useState({})
  const [plica,  setPlica]  = useState({})
  const [showBody,  setShowBody]  = useState(false)
  const [showPlica, setShowPlica] = useState(false)

  function handleSave() {
    if (!weight) return
    onAdd({
      date,
      weight: parseFloat(weight),
      ...Object.fromEntries(Object.entries(body).map(([k, v]) => [k, v ? parseFloat(v) : null])),
      ...Object.fromEntries(Object.entries(plica).map(([k, v]) => [k, v ? parseFloat(v) : null])),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-surface rounded-t-2xl p-4 pb-12 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-title text-xl text-text">Nuova misurazione</h2>
          <button onClick={onClose} className="text-text-muted p-1"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          {/* Data */}
          <div className="bg-surface2 rounded-xl px-4 py-3 flex justify-between items-center">
            <label className="text-text-muted text-sm">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-text text-right outline-none text-sm"
            />
          </div>

          {/* Peso */}
          <div className="bg-surface2 rounded-xl px-4 py-3 flex justify-between items-center">
            <label className="text-text-muted text-sm">Peso</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="80.5"
                className="bg-transparent text-text text-right w-20 outline-none font-medium"
              />
              <span className="text-text-dim text-sm">kg</span>
            </div>
          </div>

          {/* Misure corporee */}
          <div className="bg-surface2 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowBody(!showBody)}
              className="w-full px-4 py-3 flex justify-between items-center"
            >
              <span className="text-text-muted text-sm">Misure corporee (cm)</span>
              {showBody ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
            </button>
            {showBody && (
              <div className="border-t border-border space-y-0">
                {BODY_FIELDS.map(({ key, label, unit }) => (
                  <div key={key} className="px-4 py-2.5 flex justify-between items-center border-b border-border last:border-0">
                    <label className="text-text-muted text-sm">{label}</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={body[key] ?? ''}
                        onChange={(e) => setBody({ ...body, [key]: e.target.value })}
                        placeholder="—"
                        className="bg-transparent text-text text-right w-16 outline-none text-sm"
                      />
                      <span className="text-text-dim text-xs">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plicometria */}
          <div className="bg-surface2 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPlica(!showPlica)}
              className="w-full px-4 py-3 flex justify-between items-center"
            >
              <span className="text-text-muted text-sm">Plicometria (mm)</span>
              {showPlica ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
            </button>
            {showPlica && (
              <div className="border-t border-border">
                {PLICA_FIELDS.map(({ key, label, unit }) => (
                  <div key={key} className="px-4 py-2.5 flex justify-between items-center border-b border-border last:border-0">
                    <label className="text-text-muted text-sm">{label}</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={plica[key] ?? ''}
                        onChange={(e) => setPlica({ ...plica, [key]: e.target.value })}
                        placeholder="—"
                        className="bg-transparent text-text text-right w-16 outline-none text-sm"
                      />
                      <span className="text-text-dim text-xs">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!weight}
            className="w-full bg-accent-blue text-white font-bold py-4 rounded-xl text-sm disabled:opacity-40"
          >
            Salva misurazione
          </button>
        </div>
      </div>
    </div>
  )
}
