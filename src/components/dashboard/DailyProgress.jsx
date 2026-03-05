import MacroRing from './MacroRing'

export default function DailyProgress({ totals, targets }) {
  const calPct = targets.calories > 0
    ? Math.min(100, Math.round((totals.calories / targets.calories) * 100))
    : 0

  const calColor = calPct >= 100 ? '#F4522A' : calPct >= 85 ? '#F9A825' : '#2ECC71'

  return (
    <div className="px-4 mb-4">
      {/* Calories big bar */}
      <div className="bg-surface rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-text-muted text-xs mb-0.5">Calorie</p>
            <p className="font-title text-4xl text-text leading-none">
              {Math.round(totals.calories)}
              <span className="text-xl text-text-muted font-body font-normal"> / {targets.calories}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: calColor }}>{calPct}%</p>
            <p className="text-text-muted text-xs">
              {Math.max(0, targets.calories - Math.round(totals.calories))} rimaste
            </p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${calPct}%`, backgroundColor: calColor }}
          />
        </div>
      </div>

      {/* Macro rings */}
      <div className="grid grid-cols-3 gap-2">
        <MacroRing
          label="Proteine"
          current={totals.protein}
          target={targets.protein}
          color="accent-blue"
        />
        <MacroRing
          label="Carboidrati"
          current={totals.carbs}
          target={targets.carbs}
          color="accent-gold"
        />
        <MacroRing
          label="Grassi"
          current={totals.fat}
          target={targets.fat}
          color="accent-green"
        />
      </div>
    </div>
  )
}
