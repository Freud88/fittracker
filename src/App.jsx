import { useState, useEffect } from 'react'
import { supabase, isSupabaseReady } from './services/supabase'
import BottomNav from './components/layout/BottomNav'
import Today from './pages/Today'
import Food from './pages/Food'
import Plan from './pages/Plan'
import Workout from './pages/Workout'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import Auth from './pages/Auth'

export default function App() {
  const [currentPage, setCurrentPage] = useState('today')
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    if (!isSupabaseReady()) {
      setSession(null) // Supabase non configurato, accesso libero
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Caricamento iniziale
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-muted text-sm">Caricamento...</div>
      </div>
    )
  }

  // Non loggato
  if (!session) {
    return <Auth />
  }

  const pages = {
    today:    <Today    onNavigate={setCurrentPage} />,
    food:     <Food />,
    plan:     <Plan />,
    workout:  <Workout />,
    stats:    <Stats />,
    settings: <Settings session={session} />,
  }

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
