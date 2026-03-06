import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Zap, X } from 'lucide-react'

const UNITS = ['kg', 'sec', 'min']

function emptyExercise() {
  return { name: '', block: '', sets: 3, reps: 10, weight: 0, unit: 'kg' }
}

function TemplateForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState([emptyExercise()])

  function updateEx(i, field, value) {
    setExercises(prev => prev.map((ex, j) => j === i ? { ...ex, [field]: value } : ex))
  }

  function addEx() {
    setExercises(prev => [...prev, emptyExercise()])
  }

  function removeEx(i) {
    setExercises(prev => prev.filter((_, j) => j !== i))
  }

  function handleSave() {
    if (!name.trim() || exercises.length === 0) return
    const valid = exercises.filter(ex => ex.name.trim())
    if (valid.length === 0) return
    onSave({
      name: name.trim(),
      description: 'Template personalizzato',
      exercises: valid.map(ex => ({
        name: ex.name.trim(),
        block: ex.block.trim(),
        defaultSets: Number(ex.sets) || 3,
        defaultReps: Number(ex.reps) || 10,
        lastWeight: Number(ex.weight) || 0,
        unit: ex.unit,
      })),
    })
  }

  return (
    <div className="bg-surface2 rounded-xl p-4 space-y-4">
      {/* Template name */}
      <div>
        <label className="text-text-muted text-xs mb-1 block">Nome template</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Es. Push Day, Gambe…"
          autoFocus
          className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text text-sm outline-none focus:border-accent-blue"
        />
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">Esercizi</p>
        {exercises.map((ex, i) => (
          <div key={i} className="bg-surface rounded-xl p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={ex.name}
                onChange={e => updateEx(i, 'name', e.target.value)}
                placeholder="Nome esercizio"
                className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-text text-sm outline-none focus:border-accent-blue"
              />
              <button onClick={() => removeEx(i)} disabled={exercises.length === 1} className="text-text-dim p-1 disabled:opacity-30">
                <Trash2 size={15} />
              </button>
            </div>
            <input
              type="text"
              value={ex.block}
              onChange={e => updateEx(i, 'block', e.target.value)}
              placeholder="Gruppo muscolare (es. Petto)"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-text text-xs outline-none focus:border-accent-blue"
            />
            <div className="grid grid-cols-4 gap-1.5">
              {[['sets', 'Set'], ['reps', 'Rip'], ['weight', 'Peso']].map(([field, label]) => (
                <div key={field}>
                  <label className="text-text-dim text-[10px] mb-0.5 block">{label}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={ex[field]}
                    onChange={e => updateEx(i, field, e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg px-2 py-1.5 text-text text-xs outline-none focus:border-accent-blue"
                  />
                </div>
              ))}
              <div>
                <label className="text-text-dim text-[10px] mb-0.5 block">Unità</label>
                <select
                  value={ex.unit}
                  onChange={e => updateEx(i, 'unit', e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-lg px-1 py-1.5 text-text text-xs outline-none focus:border-accent-blue"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addEx}
          className="w-full py-2 rounded-xl border border-dashed border-border text-text-muted text-xs flex items-center justify-center gap-1.5 active:bg-surface2"
        >
          <Plus size={13} /> Aggiungi esercizio
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-surface text-text-muted text-sm">
          Annulla
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold disabled:opacity-40"
        >
          Salva template
        </button>
      </div>
    </div>
  )
}

function TemplateCard({ template, onDelete, onLoadTemplate, onClose }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center shrink-0">
            <Zap size={16} className="text-accent-blue" />
          </div>
          <div className="text-left">
            <p className="text-text font-semibold text-sm">{template.name}</p>
            <p className="text-text-muted text-xs">{template.exercises.length} esercizi{template.description && ` · ${template.description}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {template.custom && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(template.id) }}
              className="p-1.5 text-text-dim active:text-accent-red rounded-lg"
            >
              <Trash2 size={14} />
            </button>
          )}
          {expanded ? <ChevronUp size={15} className="text-text-muted" /> : <ChevronDown size={15} className="text-text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-3">
          {/* Group by block */}
          {(() => {
            const blocks = {}
            for (const ex of template.exercises) {
              const b = ex.block || 'Esercizi'
              if (!blocks[b]) blocks[b] = []
              blocks[b].push(ex)
            }
            return Object.entries(blocks).map(([block, exs]) => (
              <div key={block} className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-1">{block}</p>
                {exs.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <p className="text-text text-xs font-medium">{ex.name}</p>
                    <p className="text-text-muted text-[11px]">{ex.defaultSets}×{ex.defaultReps} {ex.unit || 'kg'}</p>
                  </div>
                ))}
              </div>
            ))
          })()}
          <button
            onClick={() => { onLoadTemplate(template.id); onClose() }}
            className="mt-3 w-full py-2 rounded-xl bg-accent-blue text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            Usa questo template
          </button>
        </div>
      )}
    </div>
  )
}

export default function TemplateManager({ templates, onAddTemplate, onDeleteTemplate, onLoadTemplate, onClose }) {
  const [creating, setCreating] = useState(false)

  function handleSave(template) {
    onAddTemplate(template)
    setCreating(false)
  }

  return (
    <div className="space-y-3">
      {templates.map(t => (
        <TemplateCard
          key={t.id}
          template={t}
          onDelete={onDeleteTemplate}
          onLoadTemplate={onLoadTemplate}
          onClose={onClose}
        />
      ))}

      {creating ? (
        <TemplateForm onSave={handleSave} onCancel={() => setCreating(false)} />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full py-3 rounded-xl border border-dashed border-border text-text-muted text-sm flex items-center justify-center gap-2 active:bg-surface"
        >
          <Plus size={16} /> Nuovo template
        </button>
      )}
    </div>
  )
}
