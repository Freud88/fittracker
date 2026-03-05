import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { foodDatabase as initialFoodDB } from '../data/foodDatabase'
import { getToday } from '../utils/dateUtils'
import { syncStorage } from '../utils/syncStorage'

export const useFoodStore = create(
  persist(
    (set, get) => ({
      foodLog: {},
      foodDatabase: initialFoodDB,

      addMeal: (date, meal) =>
        set((state) => ({
          foodLog: {
            ...state.foodLog,
            [date]: [...(state.foodLog[date] || []), meal],
          },
        })),

      removeMeal: (date, mealId) =>
        set((state) => ({
          foodLog: {
            ...state.foodLog,
            [date]: (state.foodLog[date] || []).filter((m) => m.id !== mealId),
          },
        })),

      updateMeal: (date, mealId, updates) =>
        set((state) => ({
          foodLog: {
            ...state.foodLog,
            [date]: (state.foodLog[date] || []).map((m) =>
              m.id === mealId ? { ...m, ...updates } : m
            ),
          },
        })),

      addCustomFood: (food) =>
        set((state) => ({
          foodDatabase: [
            ...state.foodDatabase,
            { ...food, id: crypto.randomUUID(), custom: true },
          ],
        })),

      removeCustomFood: (foodId) =>
        set((state) => ({
          foodDatabase: state.foodDatabase.filter((f) => f.id !== foodId || !f.custom),
        })),

      getTodayLog: () => {
        const today = getToday()
        return get().foodLog[today] || []
      },

      getTodayTotals: () => {
        const log = get().getTodayLog()
        return log.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fat: acc.fat + (meal.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )
      },

      getLogForDate: (date) => get().foodLog[date] || [],

      getTotalsForDate: (date) => {
        const log = get().getLogForDate(date)
        return log.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fat: acc.fat + (meal.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )
      },
    }),
    { name: 'fittracker_food_log', storage: syncStorage }
  )
)
