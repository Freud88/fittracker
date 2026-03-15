import { useState } from 'react'
import { ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react'
import { useFoodStore } from '../../stores/foodStore'
import { useConfigStore } from '../../stores/configStore'
import { getToday, formatDate, formatDateShort } from '../../utils/dateUtils'

function localStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return localStr(d)
}

function getMondayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return localStr(d)
}

function getMonthStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function getDaysInMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function shiftMonth(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setMonth(d.getMonth() + delta)
  return localStr(d)
}

export default function FoodReport() {
  const today = getToday()
  const [mode, setMode] = useState('week')
  const [anchor, setAnchor] = useState(today)
  const [copied, setCopied] = useState(false)

  const { getLogForDate, getTotalsForDate } = useFoodStore()
  const { targets } = useConfigStore()
  const maintenance = targets.maintenanceCalories || 0

  // Build dates array and label
  let dates = []
  let label = ''
  let nextDisabled = false

  if (mode === 'week') {
    const monday = getMondayOf(anchor)
    dates = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
    label = `${formatDateShort(dates[0])} – ${formatDateShort(dates[6])}`
    nextDisabled = addDays(monday, 7) > today
  } else {
    const monthStart = getMonthStart(anchor)
    dates = Array.from({ length: getDaysInMonth(anchor) }, (_, i) => addDays(monthStart, i))
    const d = new Date(anchor + 'T00:00:00')
    label = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
    nextDisabled = shiftMonth(getMonthStart(anchor), 1).slice(0, 7) > today.slice(0, 7)
  }

  function prev() {
    if (mode === 'week') setAnchor(addDays(anchor, -7))
    else setAnchor(shiftMonth(anchor, -1))
  }

  function next() {
    if (nextDisabled) return
    if (mode === 'week') setAnchor(addDays(anchor, 7))
    else setAnchor(shiftMonth(anchor, 1))
  }

  function switchMode(m) {
    setMode(m)
    setAnchor(today)
  }

  const visibleDates = dates.filter(d => d <= today)

  // Period summary
  const trackedDays = visibleDates.filter(d => getLogForDate(d).length > 0)
  const periodTotals = trackedDays.reduce((acc, d) => {
    const t = getTotalsForDate(d)
    return { calories: acc.calories + t.calories, protein: acc.protein + t.protein, carbs: acc.carbs + t.carbs, fat: acc.fat + t.fat }
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  const n = trackedDays.length || 1
  const avg = { calories: periodTotals.calories / n, protein: periodTotals.protein / n, carbs: periodTotals.carbs / n, fat: periodTotals.fat / n }
  const deficitPerDay = maintenance > 0 ? maintenance - avg.calories : null

  function buildExportText() {
    const defLine = deficitPerDay !== null
      ? `   Deficit medio vs TDEE (${maintenance} kcal): ${deficitPerDay >= 0 ? '−' : '+'}${Math.round(Math.abs(deficitPerDay))} kcal/gg\n`
      : ''
    const summary =
      `📈 Riepilogo (${trackedDays.length} giorni tracciati)\n` +
      `   Media kcal: ${Math.round(avg.calories)} | Prot: ${Math.round(avg.protein)}g · Carb: ${Math.round(avg.carbs)}g · Grassi: ${Math.round(avg.fat)}g\n` +
      defLine +
      `${'─'.repeat(32)}\n`
    const title = `📊 Report alimentare — ${label}\n${summary}`
    const body = visibleDates.map(date => {
      const meals = getLogForDate(date)
      const totals = getTotalsForDate(date)
      const header = `📅 ${formatDate(date).charAt(0).toUpperCase() + formatDate(date).slice(1)}`
      if (meals.length === 0) return `${header}\n   Nessun pasto registrato`
      const mealLines = meals.map(m =>
        `   • ${m.name} (${m.category}) — ${Math.round(m.calories)} kcal | P${Math.round(m.protein)}·C${Math.round(m.carbs)}·G${Math.round(m.fat)}`
      ).join('\n')
      const footer = `   Totale: ${Math.round(totals.calories)} kcal | Prot ${Math.round(totals.protein)}g · Carb ${Math.round(totals.carbs)}g · Grassi ${Math.round(totals.fat)}g`
      return `${header}\n${mealLines}\n${footer}`
    }).join('\n\n')
    return title + body
  }

  async function handleExport() {
    const text = buildExportText()
    if (navigator.share) {
      await navigator.share({ title: `Report alimentare — ${label}`, text })
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-3">
      {/* Mode selector */}
      <div className="flex gap-1">
        {['week', 'month'].map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${mode === m ? 'bg-accent-blue text-white' : 'bg-surface text-text-muted'}`}
          >
            {m === 'week' ? 'Settimana' : 'Mese'}
          </button>
        ))}
      </div>

      {/* Period navigator */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="p-1.5 rounded-lg bg-surface text-text-muted active:bg-surface2">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-text capitalize">{label}</span>
        <button onClick={next} disabled={nextDisabled}
          className="p-1.5 rounded-lg bg-surface text-text-muted active:bg-surface2 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Period summary card */}
      {trackedDays.length > 0 && (
        <div className="bg-surface rounded-xl p-3 space-y-2">
          <p className="text-text-muted text-[10px] uppercase tracking-wider">
            Riepilogo · {trackedDays.length} {trackedDays.length === 1 ? 'giorno tracciato' : 'giorni tracciati'}
          </p>
          <div className="grid grid-cols-4 gap-1 text-center">
            {[
              { label: 'Media kcal', value: Math.round(avg.calories), color: 'text-accent-red' },
              { label: 'Prot media', value: `${Math.round(avg.protein)}g`, color: 'text-accent-blue' },
              { label: 'Carb media', value: `${Math.round(avg.carbs)}g`, color: 'text-accent-gold' },
              { label: 'Grassi med', value: `${Math.round(avg.fat)}g`, color: 'text-accent-green' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-surface2 rounded-lg py-2 px-1">
                <p className={`text-sm font-bold ${color}`}>{value}</p>
                <p className="text-[9px] text-text-dim leading-tight mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {deficitPerDay !== null && (
            <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${deficitPerDay >= 0 ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}>
              <span className="text-[10px] text-text-muted">Deficit medio vs TDEE ({maintenance} kcal/gg)</span>
              <span className={`text-sm font-bold ${deficitPerDay >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {deficitPerDay >= 0 ? '−' : '+'}{Math.round(Math.abs(deficitPerDay))} kcal/gg
              </span>
            </div>
          )}
        </div>
      )}

      {/* Export button */}
      <button onClick={handleExport}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface border border-border text-text-muted text-xs font-medium active:bg-surface2 transition-colors"
      >
        {copied
          ? <><Check size={14} className="text-accent-green" /> Copiato negli appunti!</>
          : <><Share2 size={14} /> Esporta / Condividi</>
        }
      </button>

      {/* Day cards */}
      {visibleDates.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8">Nessun dato disponibile</p>
      )}

      {visibleDates.map(date => {
        const meals = getLogForDate(date)
        const totals = getTotalsForDate(date)
        const isEmpty = meals.length === 0

        return (
          <div key={date} className="bg-surface rounded-xl overflow-hidden">
            {/* Day header */}
            <div className="flex justify-between items-center px-3 py-2 bg-surface2">
              <span className="text-xs font-semibold text-text capitalize">{formatDate(date)}</span>
              {!isEmpty && (
                <span className="text-xs font-bold text-accent-gold">{Math.round(totals.calories)} kcal</span>
              )}
            </div>

            {isEmpty ? (
              <p className="text-xs text-text-muted px-3 py-2 italic">Nessun pasto registrato</p>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {meals.map(meal => (
                    <div key={meal.id} className="flex justify-between items-center px-3 py-2">
                      <div>
                        <p className="text-xs text-text font-medium leading-tight">{meal.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{meal.time} · {meal.category}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs font-bold text-text">{Math.round(meal.calories)} kcal</p>
                        <p className="text-[10px] text-text-muted">
                          P{Math.round(meal.protein)}·C{Math.round(meal.carbs)}·G{Math.round(meal.fat)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day totals footer */}
                <div className="flex gap-4 px-3 py-2 border-t border-border bg-surface2">
                  <span className="text-[10px] text-text-muted">Prot: <span className="text-text font-semibold">{Math.round(totals.protein)}g</span></span>
                  <span className="text-[10px] text-text-muted">Carb: <span className="text-text font-semibold">{Math.round(totals.carbs)}g</span></span>
                  <span className="text-[10px] text-text-muted">Grassi: <span className="text-text font-semibold">{Math.round(totals.fat)}g</span></span>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
