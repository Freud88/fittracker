import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, Clock, FileDown } from 'lucide-react'
import { formatDate } from '../../utils/dateUtils'

function getDuration(workout) {
  if (!workout.startTime || !workout.endTime) return null
  const mins = Math.round((new Date(workout.endTime) - new Date(workout.startTime)) / 60000)
  return mins
}

function exportPDF(workout) {
  const date = new Date(workout.date + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalSets = workout.exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const completedSets = workout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)
  const duration = getDuration(workout)

  // Group exercises by block
  const blocks = {}
  for (const ex of workout.exercises) {
    const b = ex.block || 'Esercizi'
    if (!blocks[b]) blocks[b] = []
    blocks[b].push(ex)
  }

  const blockHtml = Object.entries(blocks).map(([block, exs]) => `
    <div class="block">
      <div class="block-title">${block}</div>
      ${exs.map(ex => `
        <div class="exercise">
          <div class="exercise-name">${ex.name}</div>
          <table>
            <thead><tr><th>Set</th><th>Rip</th><th>Peso</th><th></th></tr></thead>
            <tbody>
              ${ex.sets.map((s, i) => `
                <tr class="${s.completed ? 'done' : 'skipped'}">
                  <td>#${i + 1}</td>
                  <td>${s.reps}</td>
                  <td>${s.weight} ${ex.unit || 'kg'}</td>
                  <td>${s.completed ? '✓' : '–'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${ex.notes ? `<p class="notes">Note: ${ex.notes}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Allenamento ${date}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 32px; font-size: 13px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 24px; display: flex; gap: 16px; }
  .meta span { display: flex; align-items: center; gap: 4px; }
  .block { margin-bottom: 24px; }
  .block-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #888; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 12px; }
  .exercise { margin-bottom: 16px; }
  .exercise-name { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; font-weight: 600; color: #999; text-transform: uppercase; padding: 3px 8px; border-bottom: 1px solid #f0f0f0; }
  td { padding: 4px 8px; font-size: 13px; }
  tr.done td { color: #1a1a1a; }
  tr.skipped td { color: #bbb; }
  tr.done td:last-child { color: #22c55e; font-weight: 700; }
  .notes { font-size: 11px; color: #888; margin-top: 4px; font-style: italic; }
  .footer { margin-top: 32px; border-top: 1px solid #e0e0e0; padding-top: 12px; font-size: 11px; color: #aaa; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
  <h1>Allenamento — ${date}</h1>
  <div class="meta">
    ${duration != null ? `<span>⏱ ${duration} min</span>` : ''}
    <span>💪 ${workout.exercises.length} esercizi</span>
    <span>✓ ${completedSets}/${totalSets} set completati</span>
  </div>
  ${blockHtml}
  ${workout.notes ? `<p class="notes" style="margin-top:8px">"${workout.notes}"</p>` : ''}
  <div class="footer">FitTracker Personal · ${date}</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

function WorkoutCard({ workout }) {
  const [expanded, setExpanded] = useState(false)
  const totalSets = workout.exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const completedSets = workout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)
  const duration = getDuration(workout)

  // Group exercises by block
  const blocks = {}
  for (const ex of workout.exercises) {
    const b = ex.block || null
    if (!blocks[b]) blocks[b] = []
    blocks[b].push(ex)
  }
  const blockEntries = Object.entries(blocks)
  const hasBlocks = blockEntries.some(([b]) => b !== null)

  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      {/* Header row */}
      <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setExpanded(!expanded)}>
        <div className="text-left">
          <p className="text-text font-semibold text-sm capitalize">{formatDate(workout.date)}</p>
          <p className="text-text-muted text-xs mt-0.5">
            {workout.exercises.length} esercizi · {completedSets}/{totalSets} set
            {duration != null && ` · ${duration} min`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {workout.completed
            ? <CheckCircle size={15} className="text-accent-green" />
            : <Clock size={15} className="text-accent-gold" />
          }
          <button
            onClick={e => { e.stopPropagation(); exportPDF(workout) }}
            className="p-1.5 text-text-muted active:text-accent-blue rounded-lg active:bg-surface2"
            title="Esporta PDF"
          >
            <FileDown size={15} />
          </button>
          {expanded ? <ChevronUp size={15} className="text-text-muted" /> : <ChevronDown size={15} className="text-text-muted" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {blockEntries.map(([block, exs]) => (
            <div key={block}>
              {hasBlocks && block && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-text-dim">{block}</p>
              )}
              {exs.map(ex => {
                const unit = ex.unit || 'kg'
                const bestSet = ex.sets.filter(s => s.completed).sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0]
                return (
                  <div key={ex.id} className="px-4 pt-3 pb-3 border-b border-border/50 last:border-b-0">
                    {/* Exercise name + best set */}
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-text text-sm font-semibold">{ex.name}</p>
                      {bestSet && (
                        <p className="text-text-dim text-[11px]">
                          max {bestSet.weight}{unit} × {bestSet.reps}
                        </p>
                      )}
                    </div>
                    {/* Sets table */}
                    <div className="grid grid-cols-[28px_1fr_1fr_20px] gap-x-2 gap-y-1">
                      <span className="text-[10px] text-text-dim font-semibold uppercase">Set</span>
                      <span className="text-[10px] text-text-dim font-semibold uppercase">Rip</span>
                      <span className="text-[10px] text-text-dim font-semibold uppercase">Peso</span>
                      <span />
                      {ex.sets.map((s, i) => (
                        <>
                          <span key={`n${i}`} className="text-xs text-text-dim">#{i + 1}</span>
                          <span key={`r${i}`} className={`text-xs font-medium ${s.completed ? 'text-text' : 'text-text-dim'}`}>{s.reps}</span>
                          <span key={`w${i}`} className={`text-xs font-medium ${s.completed ? 'text-text' : 'text-text-dim'}`}>{s.weight} {unit}</span>
                          <span key={`c${i}`} className={`text-xs ${s.completed ? 'text-accent-green' : 'text-border'}`}>{s.completed ? '✓' : '–'}</span>
                        </>
                      ))}
                    </div>
                    {ex.notes && <p className="text-text-dim text-xs mt-1.5 italic">"{ex.notes}"</p>}
                  </div>
                )
              })}
            </div>
          ))}
          {workout.notes && (
            <p className="px-4 py-3 text-text-muted text-xs italic">"{workout.notes}"</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkoutHistory({ workouts }) {
  if (workouts.length === 0) {
    return <div className="text-center py-8 text-text-muted text-sm">Nessuna sessione registrata</div>
  }
  return (
    <div className="space-y-3">
      {workouts.map(w => <WorkoutCard key={w.id} workout={w} />)}
    </div>
  )
}
