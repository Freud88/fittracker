import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncStorage } from '../utils/syncStorage'

export const useMeasurementsStore = create(
  persist(
    (set) => ({
      entries: [], // [{ id, date, weight, vita, fianchi, petto, braccio, coscia, plica_* }]

      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, { ...entry, id: Date.now().toString() }]
            .sort((a, b) => a.date.localeCompare(b.date)),
        })),

      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'fittracker_measurements', storage: syncStorage }
  )
)
