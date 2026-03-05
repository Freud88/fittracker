import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFoodStore } from '../stores/foodStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { useConfigStore } from '../stores/configStore'
import { getLast7Days, getLast30Days, formatDateShort } from '../utils/dateUtils'
import Header from '../components/layout/Header'
import CalendarView from '../components/stats/CalendarView'
import ProgressChart from '../components/stats/ProgressChart'

export default function Stats() {
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const { foodLog } = useFoodStore()
  const { workouts } = useWorkoutStore()
  const { targets } = useConfigStore()

  function getTotalsForDate(date) {
    const meals = foodLog[date] || []
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const last7 = getLast7Days().map((date) => ({
    date,
    ...getTotalsForDate(date),
  }))

  const last30 = getLast30Days()
  const workoutDays30 = last30.filter((d) => !!workouts[d]).length
  const avgCal7 = last7.reduce((a, d) => a + d.calories, 0) / 7
  const avgProt7 = last7.reduce((a, d) => a + d.protein, 0) / 7

  const monthNames = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  return (
    <div>
      <Header currentPage="stats" />

      <div className="px-4 space-y-4 pb-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Media kcal (7gg)', value: Math.round(avgCal7), color: '#F4522A' },
            { label: 'Media prot (7gg)', value: `${Math.round(avgProt7)}g`, color: '#3498DB' },
            { label: 'Sessioni (30gg)', value: workoutDays30, color: '#2ECC71' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface rounded-xl p-3 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-text-dim text-[10px] leading-tight mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Calorie chart */}
        <ProgressChart
          data={last7}
          title="Calorie ultimi 7 giorni"
          lines={[
            { key: 'calories', name: 'Calorie', color: '#F4522A' },
          ]}
        />

        {/* Macro chart */}
        <ProgressChart
          data={last7}
          title="Macronutrienti ultimi 7 giorni"
          lines={[
            { key: 'protein', name: 'Proteine', color: '#3498DB' },
            { key: 'carbs', name: 'Carboidrati', color: '#F9A825' },
            { key: 'fat', name: 'Grassi', color: '#2ECC71' },
          ]}
        />

        {/* Calendar */}
        <div className="bg-surface rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 text-text-muted">
              <ChevronLeft size={20} />
            </button>
            <p className="text-text font-semibold">
              {monthNames[calMonth]} {calYear}
            </p>
            <button onClick={nextMonth} className="p-1 text-text-muted">
              <ChevronRight size={20} />
            </button>
          </div>
          <CalendarView
            year={calYear}
            month={calMonth}
            foodLog={foodLog}
            workouts={workouts}
          />
        </div>
      </div>
    </div>
  )
}
