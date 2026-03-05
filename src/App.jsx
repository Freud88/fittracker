import { useState } from 'react'
import BottomNav from './components/layout/BottomNav'
import Today from './pages/Today'
import Food from './pages/Food'
import Plan from './pages/Plan'
import Workout from './pages/Workout'
import Stats from './pages/Stats'
import Settings from './pages/Settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState('today')

  const pages = {
    today:    <Today    onNavigate={setCurrentPage} />,
    food:     <Food />,
    plan:     <Plan />,
    workout:  <Workout />,
    stats:    <Stats />,
    settings: <Settings />,
  }

  // Settings non è in BottomNav — accessibile tramite icona in header
  const showBottomNav = currentPage !== 'settings'

  return (
    <div className="min-h-screen bg-bg font-body text-text">
      <div className={`max-w-md mx-auto ${showBottomNav ? 'pb-20' : 'pb-8'}`}>
        {pages[currentPage]}
      </div>
      {showBottomNav && (
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
    </div>
  )
}
