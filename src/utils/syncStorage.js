/**
 * Zustand custom storage adapter.
 * Scrive su localStorage (immediato, offline-first) e sincronizza
 * in background su Supabase (cloud, multi-device).
 */
import { supabase, isSupabaseReady } from '../services/supabase'

// --- Supabase helpers ---

async function fetchFromCloud(key) {
  if (!isSupabaseReady()) return null
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('value, updated_at')
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
  try {
    await supabase
      .from('user_data')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  } catch { /* silently fail — non bloccare l'app */ }
}

// --- Storage adapter compatibile con Zustand persist ---

export const syncStorage = {
  /**
   * Legge: localStorage prima (veloce), poi controlla Supabase.
   * Se Supabase è più recente, aggiorna localStorage e ritorna il valore cloud.
   */
  getItem: async (key) => {
    const local = localStorage.getItem(key)

    // Se Supabase non è configurato, usa solo localStorage
    if (!isSupabaseReady()) return local

    try {
      const cloud = await fetchFromCloud(key)
      if (!cloud) return local

      // Confronta timestamp: usa il più recente
      if (local) {
        try {
          const localParsed = JSON.parse(local)
          const localTs = localParsed?._syncedAt ?? 0
          const cloudTs  = new Date(cloud.updatedAt).getTime()

          if (cloudTs > localTs) {
            // Cloud più recente → aggiorna localStorage
            const merged = JSON.stringify({ ...cloud.value, _syncedAt: cloudTs })
            localStorage.setItem(key, merged)
            return merged
          }
        } catch { /* json malformato, usa cloud */ }
      }

      // Nessun dato locale → usa cloud
      const merged = JSON.stringify({ ...cloud.value, _syncedAt: new Date(cloud.updatedAt).getTime() })
      localStorage.setItem(key, merged)
      return merged
    } catch {
      return local
    }
  },

  /**
   * Scrive su localStorage (sincrono) e poi su Supabase (asincrono).
   */
  setItem: (key, value) => {
    const now = Date.now()
    let parsed
    try { parsed = JSON.parse(value) } catch { parsed = value }

    // Salva localmente con timestamp di sync
    const withTs = JSON.stringify({ ...parsed, _syncedAt: now })
    localStorage.setItem(key, withTs)

    // Push asincrono al cloud (non blocca l'UI)
    const { _syncedAt, ...forCloud } = parsed ?? {}
    pushToCloud(key, forCloud)
  },

  removeItem: (key) => {
    localStorage.removeItem(key)
    if (isSupabaseReady()) {
      supabase.from('user_data').delete().eq('key', key).then(() => {})
    }
  },
}
