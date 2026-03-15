import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncStorage } from '../utils/syncStorage'

const defaultConfig = {
  targets: {
    calories: 2500,
    protein: 165,
    carbs: 280,
    fat: 80,
    maintenanceCalories: 0,
  },
  userInfo: {
    weight: 70,
    height: 170,
    age: 25,
    name: '',
    sex: 'male',
    activityLevel: 'moderate',
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
