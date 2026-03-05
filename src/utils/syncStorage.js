/**
 * Zustand custom storage adapter.
 * Scrive su localStorage (immediato, offline-first) e sincronizza
 * in background su Supabase (cloud, multi-device, per-utente).
 */
import { supabase, isSupabaseReady } from '../services/supabase'

// --- Helper per l'utente corrente ---

async function getCurrentUserId() {
  if (!isSupabaseReady()) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// --- Supabase helpers ---

async function fetchFromCloud(key) {
  if (!isSupabaseReady()) return null
  const userId = await getCurrentUserId()
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

async function pushToCloud(key, value) {
  if (!isSupabaseReady()) return
  const userId = await getCurrentUserId()
  if (!userId) return
  try {
    await supabase
      .from('user_data')
      .upsert(
        { user_id: userId, key, value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      )
  } catch { /* silently fail — non bloccare l'app */ }
}

// --- Storage adapter compatibile con Zustand persist ---

export const syncStorage = {
  getItem: async (key) => {
    const local = localStorage.getItem(key)

    if (!isSupabaseReady()) return local

    try {
      const cloud = await fetchFromCloud(key)
      if (!cloud) return local

      if (local) {
        try {
          const localParsed = JSON.parse(local)
          const localTs = localParsed?._syncedAt ?? 0
          const cloudTs  = new Date(cloud.updatedAt).getTime()

          if (cloudTs > localTs) {
            const merged = JSON.stringify({ ...cloud.value, _syncedAt: cloudTs })
            localStorage.setItem(key, merged)
            return merged
          }
        } catch { /* json malformato, usa cloud */ }
      }

      const merged = JSON.stringify({ ...cloud.value, _syncedAt: new Date(cloud.updatedAt).getTime() })
      localStorage.setItem(key, merged)
      return merged
    } catch {
      return local
    }
  },

  setItem: (key, value) => {
    const now = Date.now()
    let parsed
    try { parsed = JSON.parse(value) } catch { parsed = value }

    const withTs = JSON.stringify({ ...parsed, _syncedAt: now })
    localStorage.setItem(key, withTs)

    const { _syncedAt, ...forCloud } = parsed ?? {}
    pushToCloud(key, forCloud)
  },

  removeItem: async (key) => {
    localStorage.removeItem(key)
    if (isSupabaseReady()) {
      const userId = await getCurrentUserId()
      if (userId) {
        supabase.from('user_data').delete().eq('user_id', userId).eq('key', key).then(() => {})
      }
    }
  },
}
