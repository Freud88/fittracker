import { Home, UtensilsCrossed, Calendar, Dumbbell, BarChart2 } from 'lucide-react'

const tabs = [
  { id: 'today',   label: 'Oggi',    Icon: Home },
  { id: 'food',    label: 'Cibo',    Icon: UtensilsCrossed },
  { id: 'plan',    label: 'Piano',   Icon: Calendar },
  { id: 'workout', label: 'Palestra',Icon: Dumbbell },
  { id: 'stats',   label: 'Stats',   Icon: BarChart2 },
]

export default function BottomNav({ currentPage, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-surface flex items-stretch">
      {tabs.map(({ id, label, Icon }) => {
        const active = currentPage === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? 'text-accent-blue' : 'text-text-muted'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
