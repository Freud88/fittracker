import { Settings, ChevronLeft } from 'lucide-react'
import { formatDate, getToday } from '../../utils/dateUtils'

const pageTitles = {
  food:     'Diario Alimentare',
  plan:     'Piano Settimana',
  workout:  'Palestra',
  stats:    'Statistiche',
  settings: 'Impostazioni',
}

export default function Header({ currentPage, userName, onNavigate }) {
  if (currentPage === 'today') {
    const dateStr = formatDate(getToday())
    return (
      <header className="px-4 pt-5 pb-3 flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm capitalize">{dateStr}</p>
          <h1 className="font-title text-3xl text-text leading-tight">
            Ciao, {userName || 'Utente'}
          </h1>
        </div>
        <button
          onClick={() => onNavigate?.('settings')}
          className="mt-1 p-2 text-text-muted active:text-text"
        >
          <Settings size={20} />
        </button>
      </header>
    )
  }

  if (currentPage === 'settings') {
    return (
      <header className="px-4 pt-5 pb-3 flex items-center gap-2">
        <button
          onClick={() => onNavigate?.('today')}
          className="p-1 -ml-1 text-text-muted active:text-text"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-title text-3xl text-text">{pageTitles.settings}</h1>
      </header>
    )
  }

  return (
    <header className="px-4 pt-5 pb-3">
      <h1 className="font-title text-3xl text-text">{pageTitles[currentPage] ?? ''}</h1>
    </header>
  )
}
