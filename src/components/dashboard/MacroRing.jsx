// SVG circular progress ring for each macro
const RADIUS = 38
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const colorMap = {
  'accent-blue': '#3498DB',
  'accent-gold': '#F9A825',
  'accent-green': '#2ECC71',
  'accent-red': '#F4522A',
}

export default function MacroRing({ label, current, target, color, unit = 'g' }) {
  const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0)
  const stroke = colorMap[color] || color
  const dashOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE
  const remaining = Math.max(0, target - current)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          {/* Track */}
          <circle
            cx="44" cy="44" r={RADIUS}
            fill="none"
            stroke="#2A3040"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="44" cy="44" r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-text leading-none">
            {Math.round(current)}
          </span>
          <span className="text-[9px] text-text-muted">{unit}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-text">{label}</p>
        <p className="text-[10px] text-text-muted">
          {Math.round(remaining)} rimasti
        </p>
      </div>
    </div>
  )
}
