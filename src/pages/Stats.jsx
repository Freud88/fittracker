import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react'
import { useFoodStore } from '../stores/foodStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { useConfigStore } from '../stores/configStore'
import { useMeasurementsStore } from '../stores/measurementsStore'
import { getLast30Days, formatDateShort } from '../utils/dateUtils'

const PERIODS = [
  { id: '7d',   label: 'Settimana', days: 7   },
  { id: '30d',  label: 'Mese',      days: 30  },
  { id: '365d', label: 'Anno',      days: 365 },
]

function getLastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}
import Header from '../components/layout/Header'
import CalendarView from '../components/stats/CalendarView'
import ProgressChart from '../components/stats/ProgressChart'
import AddMeasurementModal from '../components/stats/AddMeasurementModal'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const BODY_LABELS  = { vita: 'Vita', fianchi: 'Fianchi', petto: 'Petto', braccio: 'Braccio', coscia: 'Coscia' }
const PLICA_LABELS = { plica_tricipite: 'Tricipite', plica_sottoscapolare: 'Sottoscapolare', plica_soprailliaca: 'Soprailliaca', plica_addome: 'Addome', plica_coscia: 'Coscia' }
const COLORS = ['#3498DB', '#2ECC71', '#F4522A', '#9B59B6', '#F39C12']

function MeasTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}{unit}</p>)}
    </div>
  )
}

export default function Stats() {
  const now = new Date()
  const [calYear,  setCalYear]  = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [showAddMeas, setShowAddMeas] = useState(false)
  const [measTab, setMeasTab] = useState('peso')
  const [period, setPeriod] = useState('7d')

  const { foodLog }  = useFoodStore()
  const { workouts } = useWorkoutStore()
  const { targets }  = useConfigStore()
  const { entries, addEntry, removeEntry } = useMeasurementsStore()

  function getTotalsForDate(date) {
    const meals = foodLog[date] || []
    return meals.reduce(
      (acc, m) => ({ calories: acc.calories+(m.calories||0), protein: acc.protein+(m.protein||0), carbs: acc.carbs+(m.carbs||0), fat: acc.fat+(m.fat||0) }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const periodDays = PERIODS.find(p => p.id === period).days
  const allDays    = useMemo(() => getLastNDays(periodDays), [periodDays])

  // Chart data: daily for 7/30d, monthly aggregated for 365d
  const chartData = useMemo(() => {
    if (period !== '365d') {
      return allDays.map((date) => ({ date, ...getTotalsForDate(date) }))
    }
    // Group by month
    const byMonth = {}
    allDays.forEach((date) => {
      const key = date.slice(0, 7)
      if (!byMonth[key]) byMonth[key] = []
      byMonth[key].push(date)
    })
    return Object.entries(byMonth).map(([key, days]) => {
      const tot = days.reduce((acc, d) => {
        const t = getTotalsForDate(d)
        return { calories: acc.calories+t.calories, protein: acc.protein+t.protein, carbs: acc.carbs+t.carbs, fat: acc.fat+t.fat }
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
      return { date: key + '-01', ...tot }
    })
  }, [period, allDays, foodLog])

  // Period totals
  const periodTotals = useMemo(() => allDays.reduce((acc, d) => {
    const t = getTotalsForDate(d)
    return { calories: acc.calories+t.calories, protein: acc.protein+t.protein, carbs: acc.carbs+t.carbs, fat: acc.fat+t.fat }
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }), [allDays, foodLog])

  const avgCal  = periodTotals.calories / periodDays
  const avgProt = periodTotals.protein  / periodDays
  const targetCal = targets.calories * periodDays
  const deficit = targetCal - periodTotals.calories // positivo = deficit, negativo = surplus
  const maintenance = targets.maintenanceCalories || 0
  const realDeficit = maintenance > 0 ? maintenance * periodDays - periodTotals.calories : null

  const last30 = getLast30Days()
  const workoutDays30 = last30.filter((d) => !!workouts[d]).length

  const monthNames = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
  function prevMonth() { if (calMonth === 0) { setCalYear(y=>y-1); setCalMonth(11) } else setCalMonth(m=>m-1) }
  function nextMonth() { if (calMonth === 11) { setCalYear(y=>y+1); setCalMonth(0)  } else setCalMonth(m=>m+1) }

  const lastEntry   = entries.length > 0 ? entries[entries.length-1] : null
  const prevEntry   = entries.length > 1 ? entries[entries.length-2] : null
  const weightDelta = lastEntry && prevEntry ? +(lastEntry.weight - prevEntry.weight).toFixed(1) : null

  const weightData = entries.map((e) => ({ date: formatDateShort(e.date), peso: e.weight }))
  const bodyKeys   = Object.keys(BODY_LABELS).filter((k) => entries.some((e) => e[k]))
  const plicaKeys  = Object.keys(PLICA_LABELS).filter((k) => entries.some((e) => e[k]))
  const bodyData   = entries.map((e) => ({ date: formatDateShort(e.date), ...Object.fromEntries(bodyKeys.map(k=>[k,e[k]])) }))
  const plicaData  = entries.map((e) => ({ date: formatDateShort(e.date), ...Object.fromEntries(plicaKeys.map(k=>[k,e[k]])) }))

  const availTabs = [
    { id: 'peso', label: 'Peso' },
    ...(bodyKeys.length  > 0 ? [{ id: 'misure', label: 'Misure' }] : []),
    ...(plicaKeys.length > 0 ? [{ id: 'plica',  label: 'Plica'  }] : []),
  ]

  return (
    <div>
      <Header currentPage="stats" />
      <div className="px-4 space-y-4 pb-6">

        {/* Period selector */}
        <div className="flex gap-1.5">
          {PERIODS.map(({ id, label }) => (
            <button key={id} onClick={() => setPeriod(id)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${period === id ? 'bg-accent-blue text-white' : 'bg-surface text-text-muted'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: `Media kcal/giorno`, value: Math.round(avgCal),       color: '#F4522A' },
            { label: `Media prot/giorno`, value: `${Math.round(avgProt)}g`, color: '#3498DB' },
            { label: 'Sessioni (30gg)',   value: workoutDays30,             color: '#2ECC71' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface rounded-xl p-3 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-text-dim text-[10px] leading-tight mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Deficit / Surplus card */}
        <div className={`rounded-xl p-4 border ${deficit >= 0 ? 'bg-accent-green/10 border-accent-green/30' : 'bg-accent-red/10 border-accent-red/30'}`}>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-3">
            Bilancio calorico — {PERIODS.find(p => p.id === period)?.label}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-text-dim text-[10px] mb-0.5">Target</p>
              <p className="text-text font-bold text-lg">{Math.round(targetCal)}</p>
              <p className="text-text-dim text-[10px]">kcal totali</p>
            </div>
            <div>
              <p className="text-text-dim text-[10px] mb-0.5">Consumato</p>
              <p className="text-text font-bold text-lg">{Math.round(periodTotals.calories)}</p>
              <p className="text-text-dim text-[10px]">kcal totali</p>
            </div>
            <div>
              <p className="text-text-dim text-[10px] mb-0.5">{deficit >= 0 ? 'Deficit' : 'Surplus'}</p>
              <p className={`font-bold text-lg ${deficit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {deficit >= 0 ? '' : '+'}{Math.round(Math.abs(deficit))}
              </p>
              <p className="text-text-dim text-[10px]">kcal · {deficit >= 0 ? '−' : '+'}{Math.round(Math.abs(deficit / periodDays))}/gg</p>
            </div>
          </div>

          {realDeficit !== null && (
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-text-dim text-[10px]">Deficit reale dal mantenimento</p>
                <p className="text-text-dim text-[10px]">TDEE {maintenance} kcal/gg</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-base ${realDeficit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {realDeficit >= 0 ? '−' : '+'}{Math.round(Math.abs(realDeficit))} kcal
                </p>
                <p className="text-text-dim text-[10px]">{realDeficit >= 0 ? '−' : '+'}{Math.round(Math.abs(realDeficit / periodDays))} kcal/gg</p>
              </div>
            </div>
          )}
        </div>

        <ProgressChart data={chartData} title={`Calorie — ${PERIODS.find(p=>p.id===period)?.label.toLowerCase()}`}
          lines={[{ key: 'calories', name: 'Calorie', color: '#F4522A' }]} />

        <ProgressChart data={chartData} title={`Macronutrienti — ${PERIODS.find(p=>p.id===period)?.label.toLowerCase()}`}
          lines={[
            { key: 'protein', name: 'Proteine',    color: '#3498DB' },
            { key: 'carbs',   name: 'Carboidrati', color: '#F9A825' },
            { key: 'fat',     name: 'Grassi',      color: '#2ECC71' },
          ]} />

        {/* ── Misure corporee ── */}
        <div className="bg-surface rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-text-muted text-xs uppercase tracking-wider">Misure corporee</p>
            <button onClick={() => setShowAddMeas(true)} className="flex items-center gap-1 text-accent-blue text-xs">
              <Plus size={13} /> Aggiungi
            </button>
          </div>

          {lastEntry ? (
            <div className="flex items-end gap-3 mb-4">
              <div>
                <p className="font-title text-4xl text-text">{lastEntry.weight}</p>
                <p className="text-text-dim text-xs">kg · {formatDateShort(lastEntry.date)}</p>
              </div>
              {weightDelta !== null && (
                <div className={`flex items-center gap-1 pb-1 text-sm font-semibold ${weightDelta < 0 ? 'text-accent-green' : weightDelta > 0 ? 'text-accent-red' : 'text-text-muted'}`}>
                  {weightDelta < 0 ? <TrendingDown size={16}/> : weightDelta > 0 ? <TrendingUp size={16}/> : <Minus size={16}/>}
                  {weightDelta > 0 ? '+' : ''}{weightDelta} kg
                </div>
              )}
            </div>
          ) : (
            <p className="text-text-dim text-sm text-center py-4">Nessuna misurazione ancora.</p>
          )}

          {entries.length > 0 && (
            <>
              <div className="flex gap-1.5 mb-3">
                {availTabs.map(({ id, label }) => (
                  <button key={id} onClick={() => setMeasTab(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${measTab===id ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {measTab === 'peso' && weightData.length > 1 && (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={weightData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill:'#7A8499', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#7A8499', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto','auto']} />
                    <Tooltip content={<MeasTooltip unit=" kg" />} />
                    <Line type="monotone" dataKey="peso" name="Peso" stroke="#3498DB" strokeWidth={2} dot={{ r:3, fill:'#3498DB' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {measTab === 'misure' && bodyData.length > 1 && (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={bodyData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill:'#7A8499', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#7A8499', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto','auto']} />
                    <Tooltip content={<MeasTooltip unit=" cm" />} />
                    {bodyKeys.map((k,i) => <Line key={k} type="monotone" dataKey={k} name={BODY_LABELS[k]} stroke={COLORS[i%5]} strokeWidth={2} dot={false} />)}
                  </LineChart>
                </ResponsiveContainer>
              )}

              {measTab === 'plica' && plicaData.length > 1 && (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={plicaData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill:'#7A8499', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#7A8499', fontSize:10 }} axisLine={false} tickLine={false} domain={['auto','auto']} />
                    <Tooltip content={<MeasTooltip unit=" mm" />} />
                    {plicaKeys.map((k,i) => <Line key={k} type="monotone" dataKey={k} name={PLICA_LABELS[k]} stroke={COLORS[i%5]} strokeWidth={2} dot={false} />)}
                  </LineChart>
                </ResponsiveContainer>
              )}

              <div className="mt-4 space-y-2">
                <p className="text-text-muted text-[10px] uppercase tracking-wider">Storico</p>
                {[...entries].reverse().slice(0,5).map((e) => (
                  <div key={e.id} className="flex justify-between items-start bg-surface2 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-text text-sm font-medium">{e.weight} kg</p>
                      <p className="text-text-dim text-xs">{formatDateShort(e.date)}</p>
                      {(bodyKeys.some(k=>e[k]) || plicaKeys.some(k=>e[k])) && (
                        <p className="text-text-dim text-[10px] mt-0.5 leading-relaxed">
                          {[...bodyKeys.filter(k=>e[k]).map(k=>`${BODY_LABELS[k]} ${e[k]}cm`),
                             ...plicaKeys.filter(k=>e[k]).map(k=>`${PLICA_LABELS[k]} ${e[k]}mm`)].join(' · ')}
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeEntry(e.id)} className="text-text-dim p-1.5"><Trash2 size={13}/></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Calendario */}
        <div className="bg-surface rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 text-text-muted"><ChevronLeft size={20} /></button>
            <p className="text-text font-semibold">{monthNames[calMonth]} {calYear}</p>
            <button onClick={nextMonth} className="p-1 text-text-muted"><ChevronRight size={20} /></button>
          </div>
          <CalendarView year={calYear} month={calMonth} foodLog={foodLog} workouts={workouts} />
        </div>
      </div>

      {showAddMeas && (
        <AddMeasurementModal onAdd={addEntry} onClose={() => setShowAddMeas(false)} />
      )}
    </div>
  )
}
