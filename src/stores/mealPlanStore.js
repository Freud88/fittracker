import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MEAL_LIBRARY_SEED } from '../data/mealLibrary'
import { syncStorage } from '../utils/syncStorage'
import {
  generateWeekPlan,
  regenerateDay as regenDay,
  regenerateMeal as regenMeal,
  markMealEaten as markEaten,
  recordActualMeal as recordActual,
} from '../utils/mealPlanner'

export const useMealPlanStore = create(
  persist(
    (set, get) => ({
      plan: null,
      mealLibrary: MEAL_LIBRARY_SEED,
      bannedMeals: [],

      // --- Plan generation ---
      generatePlan: (dailyTarget) => {
        const { mealLibrary, bannedMeals } = get()
        set({ plan: generateWeekPlan(dailyTarget, mealLibrary, bannedMeals) })
      },

      regenerateDay: (date) => {
        const { plan, mealLibrary, bannedMeals } = get()
        if (!plan) return
        const eatenCats = Object.entries(plan.days[date]?.meals ?? {})
          .filter(([, m]) => m?.eaten)
          .map(([cat]) => cat)
        set({ plan: regenDay(plan, date, mealLibrary, bannedMeals, eatenCats) })
      },

      regenerateMeal: (date, category) => {
        const { plan, mealLibrary, bannedMeals } = get()
        if (!plan) return
        set({ plan: regenMeal(plan, date, category, mealLibrary, bannedMeals) })
      },

      markMealEaten: (date, category) => {
        const { plan } = get()
        if (!plan) return
        set({ plan: markEaten(plan, date, category) })
      },

      recordActualMeal: (date, category, actualMeal, dailyTarget) => {
        const { plan } = get()
        if (!plan) return
        set({ plan: recordActual(plan, date, category, actualMeal, dailyTarget) })
      },

      // --- Ban system ---
      banMeal: (mealId) =>
        set((state) => ({
          bannedMeals: state.bannedMeals.includes(mealId)
            ? state.bannedMeals
            : [...state.bannedMeals, mealId],
        })),

      unbanMeal: (mealId) =>
        set((state) => ({
          bannedMeals: state.bannedMeals.filter((id) => id !== mealId),
        })),

      // --- Custom meal library ---
      addCustomMeal: (meal) =>
        set((state) => ({
          mealLibrary: [
            ...state.mealLibrary,
            {
              ...meal,
              id: crypto.randomUUID(),
              custom: true,
              banned: false,
              timesServed: 0,
              lastServed: null,
            },
          ],
        })),

      removeCustomMeal: (mealId) =>
        set((state) => ({
          mealLibrary: state.mealLibrary.filter((m) => m.id !== mealId || !m.custom),
        })),
    }),
    { name: 'fittracker_meal_plan', storage: syncStorage }
  )
)
