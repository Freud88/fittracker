/**
 * Zustand custom storage adapter.
 * - getItem/setItem usano localStorage in modo SINCRONO (persistenza immediata)
 * - Il sync con Supabase avviene separatamente tramite pullFromCloud/pushToCloud
 */
import { supabase, isSupabaseReady } from '../services/supabase'

async function getUserId() {
  if (!isSupabaseReady()) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

async function pushToCloud(key, value) {
  const userId = await getUserId()
  if (!userId) return
  try {
    await supabase
      .from('user_data')
      .upsert(
        { user_id: userId, key, value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      )
  } catch { }
}

export async function pullFromCloud(key) {
  if (!isSupabaseReady()) return null
  const userId = await getUserId()
  if (!userId) return null
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('value, updated_at')
      .eq('user_id', userId)
      .eq('key', key)
      .single()
    if (error || !data) return null
    return { value: data.value, updatedAt: data.updated_at }
  } catch {
    return null
  }
}

// Adapter per Zustand persist (PersistStorage interface):
// getItem deve restituire l'oggetto parsato, setItem riceve già l'oggetto
export const syncStorage = {
  getItem: (key) => {
    const str = localStorage.getItem(key)
    if (!str) return null
    try { return JSON.parse(str) } catch { return null }
  },

  setItem: (key, value) => {
    // value è già un oggetto { state: {...}, version: 0 }
    localStorage.setItem(key, JSON.stringify({ ...value, _syncedAt: Date.now() }))
    // Push su Supabase in background (fire & forget)
    pushToCloud(key, value)
  },

  removeItem: (key) => {
    localStorage.removeItem(key)
  },
}
