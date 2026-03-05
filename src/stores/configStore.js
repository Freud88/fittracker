import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncStorage } from '../utils/syncStorage'

const defaultConfig = {
  targets: {
    calories: 2500,
    protein: 165,
    carbs: 280,
    fat: 80,
  },
  userInfo: {
    weight: 80.8,
    height: 186,
    age: 37,
    name: 'Luca',
  },
}

export const useConfigStore = create(
  persist(
    (set) => ({
      ...defaultConfig,
      updateTargets: (targets) => set({ targets }),
      updateUserInfo: (info) =>
        set((state) => ({ userInfo: { ...state.userInfo, ...info } })),
    }),
    { name: 'fittracker_config', storage: syncStorage }
  )
)
