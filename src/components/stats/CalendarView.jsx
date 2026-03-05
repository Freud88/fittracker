import { getDaysInMonth, getFirstDayOfMonth, getToday } from '../../utils/dateUtils'
import { Dumbbell, UtensilsCrossed } from 'lucide-react'

const DAYS = ['D', 'L', 'M', 'M', 'G', 'V', 'S']

export default function CalendarView({ year, month, foodLog, workouts, onDayClick }) {
  const today = getToday()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const blanks = Array.from({ length: firstDay })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function dateStr(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-text-dim text-xs py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((day) => {
          const ds = dateStr(day)
          const hasFood = (foodLog[ds] || []).length > 0
          const hasWorkout = !!workouts[ds]
          const isToday = ds === today

          return (
            <button
              key={day}
              onClick={() => onDayClick?.(ds)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                isToday ? 'bg-accent-blue/30 border border-accent-blue' : 'bg-surface2'
              }`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-accent-blue' : 'text-text'}`}>
                {day}
              </span>
              {(hasFood || hasWorkout) && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasWorkout && <div className="w-1 h-1 rounded-full bg-accent-green" />}
                  {hasFood && <div className="w-1 h-1 rounded-full bg-accent-gold" />}
                </div>
              )}
            </button>
          )
        })}
      </div>
      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-green" />
          <span className="text-text-muted text-xs">Allenamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-gold" />
          <span className="text-text-muted text-xs">Diario cibo</span>
        </div>
      </div>
    </div>
  )
}
