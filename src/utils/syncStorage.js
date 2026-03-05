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

// Adapter sincrono per Zustand persist — localStorage è la fonte di verità locale
export const syncStorage = {
  getItem: (key) => localStorage.getItem(key),

  setItem: (key, value) => {
    let parsed
    try { parsed = JSON.parse(value) } catch { parsed = value }
    // Salva in localStorage con timestamp per il confronto cloud
    localStorage.setItem(key, JSON.stringify({ ...parsed, _syncedAt: Date.now() }))
    // Push su Supabase in background (fire & forget)
    pushToCloud(key, parsed)
  },

  removeItem: (key) => {
    localStorage.removeItem(key)
  },
}
