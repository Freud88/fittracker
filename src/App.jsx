import { useState, useEffect } from 'react'
import { supabase, isSupabaseReady } from './services/supabase'
import { useConfigStore } from './stores/configStore'
import { useFoodStore } from './stores/foodStore'
import { useWorkoutStore } from './stores/workoutStore'
import { useMealPlanStore } from './stores/mealPlanStore'
import { useMeasurementsStore } from './stores/measurementsStore'
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
      setSession(null)
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

  // Quando l'utente si autentica, re-idrata gli store dal cloud (Supabase)
  useEffect(() => {
    if (!session) return
    // Re-fetch da Supabase ora che l'utente è autenticato
    useConfigStore.persist.rehydrate()
    useFoodStore.persist.rehydrate()
    useWorkoutStore.persist.rehydrate()
    useMealPlanStore.persist.rehydrate()
    useMeasurementsStore.persist.rehydrate()

    // Auto-popola il nome se non è ancora impostato
    setTimeout(() => {
      const { userInfo, updateUserInfo } = useConfigStore.getState()
      if (!userInfo.name && session.user.user_metadata?.name) {
        updateUserInfo({ name: session.user.user_metadata.name })
      }
    }, 500) // piccolo delay per lasciare che la re-idratazione completi
  }, [session?.user?.id])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-muted text-sm">Caricamento...</div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  const pages = {
    today:    <Today    onNavigate={setCurrentPage} />,
    food:     <Food />,
    plan:     <Plan />,
    workout:  <Workout />,
    stats:    <Stats />,
    settings: <Settings session={session} onNavigate={setCurrentPage} />,
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
