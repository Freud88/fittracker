import { useState, useEffect } from 'react'
import { supabase, isSupabaseReady } from './services/supabase'
import { pullFromCloud } from './utils/syncStorage'
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

  // Quando l'utente si autentica, sincronizza dal cloud se i dati cloud sono più recenti
  useEffect(() => {
    if (!session) return

    const STORE_KEYS = [
      'fittracker_config',
      'fittracker_food',
      'fittracker_workout',
      'fittracker_mealplan',
      'fittracker_measurements',
    ]
    const stores = [useConfigStore, useFoodStore, useWorkoutStore, useMealPlanStore, useMeasurementsStore]

    ;(async () => {
      let anyUpdated = false
      for (const key of STORE_KEYS) {
        const cloud = await pullFromCloud(key)
        if (!cloud) continue
        const localRaw = localStorage.getItem(key)
        const localTs = localRaw ? (JSON.parse(localRaw)?._syncedAt ?? 0) : 0
        const cloudTs = new Date(cloud.updatedAt).getTime()
        if (cloudTs > localTs) {
          localStorage.setItem(key, JSON.stringify({ ...cloud.value, _syncedAt: cloudTs }))
          anyUpdated = true
        }
      }
      // Rehydrata solo se almeno uno store è stato aggiornato dal cloud
      if (anyUpdated) {
        stores.forEach((s) => s.persist.rehydrate())
      }

      // Auto-popola il nome se non è ancora impostato
      const { userInfo, updateUserInfo } = useConfigStore.getState()
      if (!userInfo.name && session.user.user_metadata?.name) {
        updateUserInfo({ name: session.user.user_metadata.name })
      }
    })()
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
