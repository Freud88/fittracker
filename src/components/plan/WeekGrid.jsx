import { useState } from 'react'
import MealActionSheet from './MealActionSheet'
import { getToday } from '../../utils/dateUtils'
import { Check, Edit3, RefreshCw } from 'lucide-react'
import { formatIngredient } from '../../utils/formatIngredient'

const CATEGORIES = ['breakfast', 'lunch', 'snack', 'dinner']
const DAY_LABELS  = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const CAT_LABELS  = { breakfast: 'Colazione', lunch: 'Pranzo', snack: 'Spuntino', dinner: 'Cena' }

function StatusBadge({ meal }) {
  if (!meal) return null
  if (meal.skipped) return <span className="text-[9px] text-text-dim font-medium uppercase tracking-wide">Saltato</span>
  if (meal.eaten && !meal.actual) return <Check size={13} className="text-accent-green" />
  if (meal.actual) return <Edit3 size={13} className="text-accent-gold" />
  if (meal.adjusted) return <RefreshCw size={13} className="text-accent-blue" />
  return null
}

export default function WeekGrid({
  plan, dailyTarget,
  onMarkEaten, onSkip, onRecordActual, onRegenerate, onBan, onRegenerateDay,
}) {
  const today      = getToday()
  const sortedDays = Object.keys(plan.days).sort()
  const todayIdx   = sortedDays.indexOf(today)

  const [selectedIdx, setSelectedIdx] = useState(todayIdx >= 0 ? todayIdx : 0)
  const [selectedMeal, setSelectedMeal] = useState(null)

  const selectedDate = sortedDays[selectedIdx]
  const dayMeals     = plan.days[selectedDate]?.meals ?? {}
  const dayTarget    = plan.adjustedTargets?.[selectedDate] ?? dailyTarget
  const dayTotal     = Object.values(dayMeals).reduce((s, m) => s + (m?.calories ?? 0), 0)

  return (
    <>
      {/* ── Day tab bar ── */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {sortedDays.map((date, i) => {
          const isToday    = date === today
          const isSelected = i === selectedIdx
          const tot = Object.values(plan.days[date]?.meals ?? {})
            .reduce((s, m) => s + (m?.calories ?? 0), 0)

          return (
            <button
              key={date}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-colors
                ${isSelected
                  ? 'bg-accent-blue text-white'
                  : isToday
                    ? 'bg-accent-blue/15 text-accent-blue'
                    : 'bg-surface2 text-text-muted'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide">{DAY_LABELS[i]}</span>
              <span className="text-[13px] font-semibold leading-tight">
                {new Date(date + 'T00:00:00').getDate()}
              </span>
              <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-text-dim'}`}>
                {Math.round(tot)}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Selected day header ── */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-text font-semibold text-sm">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('it-IT', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
            {selectedDate === today && (
              <span className="ml-2 bg-accent-blue/20 text-accent-blue text-[10px] px-1.5 py-0.5 rounded-md">oggi</span>
            )}
          </p>
          <p className="text-text-dim text-xs">
            {Math.round(dayTotal)} / {dayTarget.calories} kcal
          </p>
        </div>
        <button
          onClick={() => onRegenerateDay?.(selectedDate)}
          className="text-xs text-text-muted bg-surface2 px-3 py-1.5 rounded-lg active:bg-border"
        >
          Rigenera giorno
        </button>
      </div>

      {/* ── Meal cards ── */}
      <div className="space-y-2.5">
        {CATEGORIES.map((cat) => {
          const meal = dayMeals[cat]
          return (
            <button
              key={cat}
              onClick={() => meal && setSelectedMeal({ date: selectedDate, category: cat })}
              className={`w-full text-left rounded-2xl p-4 transition-colors
                ${meal?.skipped ? 'bg-surface2 opacity-50' :
                  meal?.eaten   ? 'bg-accent-green/10 border border-accent-green/20' :
                  meal?.actual  ? 'bg-accent-gold/10  border border-accent-gold/20'  :
                                  'bg-surface2'}
                ${!meal ? 'opacity-40 cursor-default' : 'active:brightness-110'}`}
            >
              {/* top row */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-text-dim text-[10px] uppercase tracking-wider font-medium">
                  {CAT_LABELS[cat]}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge meal={meal} />
                  <span className="text-accent-red text-xs font-bold">
                    {meal ? `${meal.calories} kcal` : '—'}
                  </span>
                </div>
              </div>

              {/* name */}
              <p className="text-text text-sm font-semibold leading-snug">
                {meal?.name ?? '—'}
              </p>

              {/* macros */}
              {meal && (
                <div className="flex gap-4 mt-1.5">
                  <span className="text-text-dim text-xs">P <span className="text-text-muted font-medium">{Math.round(meal.protein)}g</span></span>
                  <span className="text-text-dim text-xs">C <span className="text-text-muted font-medium">{Math.round(meal.carbs)}g</span></span>
                  <span className="text-text-dim text-xs">G <span className="text-text-muted font-medium">{Math.round(meal.fat)}g</span></span>
                </div>
              )}

              {/* ingredients */}
              {meal?.ingredients?.length > 0 && (
                <p className="text-text-dim text-[11px] mt-2 leading-relaxed">
                  {meal.ingredients.map((ing) => formatIngredient(ing)).join(' · ')}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Action sheet ── */}
      {selectedMeal && (
        <MealActionSheet
          meal={plan.days[selectedMeal.date]?.meals[selectedMeal.category]}
          date={selectedMeal.date}
          category={selectedMeal.category}
          dailyTarget={dailyTarget}
          onMarkEaten={(d, c) => { onMarkEaten(d, c); setSelectedMeal(null) }}
          onSkip={(d, c) => { onSkip?.(d, c); setSelectedMeal(null) }}
          onRecordActual={onRecordActual}
          onRegenerate={(d, c) => { onRegenerate(d, c); setSelectedMeal(null) }}
          onBan={(id) => { onBan(id); setSelectedMeal(null) }}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </>
  )
}
