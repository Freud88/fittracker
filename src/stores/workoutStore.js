import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { workoutTemplates as initialTemplates } from '../data/workoutTemplates'
import { getToday } from '../utils/dateUtils'
import { syncStorage } from '../utils/syncStorage'

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      workouts: {},
      templates: initialTemplates,
      activeWorkoutDate: null,

      startWorkout: (date = getToday()) =>
        set((state) => {
          if (state.workouts[date]) {
            return { activeWorkoutDate: date }
          }
          return {
            workouts: {
              ...state.workouts,
              [date]: {
                id: crypto.randomUUID(),
                date,
                startTime: new Date().toISOString(),
                exercises: [],
                notes: '',
                completed: false,
              },
            },
            activeWorkoutDate: date,
          }
        }),

      addExercise: (date, exercise) =>
        set((state) => ({
          workouts: {
            ...state.workouts,
            [date]: {
              ...state.workouts[date],
              exercises: [...(state.workouts[date]?.exercises || []), exercise],
            },
          },
        })),

      removeExercise: (date, exerciseId) =>
        set((state) => ({
          workouts: {
            ...state.workouts,
            [date]: {
              ...state.workouts[date],
              exercises: state.workouts[date].exercises.filter(
                (e) => e.id !== exerciseId
              ),
            },
          },
        })),

      updateSet: (date, exerciseId, setIndex, setData) =>
        set((state) => {
          const workout = state.workouts[date]
          if (!workout) return state
          const exercises = workout.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex
            const sets = [...ex.sets]
            sets[setIndex] = { ...sets[setIndex], ...setData }
            return { ...ex, sets }
          })
          return {
            workouts: {
              ...state.workouts,
              [date]: { ...workout, exercises },
            },
          }
        }),

      updateExerciseNotes: (date, exerciseId, notes) =>
        set((state) => {
          const workout = state.workouts[date]
          if (!workout) return state
          const exercises = workout.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, notes } : ex
          )
          return {
            workouts: { ...state.workouts, [date]: { ...workout, exercises } },
          }
        }),

      completeWorkout: (date) =>
        set((state) => ({
          workouts: {
            ...state.workouts,
            [date]: {
              ...state.workouts[date],
              completed: true,
              endTime: new Date().toISOString(),
            },
          },
          activeWorkoutDate: null,
        })),

      cancelWorkout: (date) =>
        set((state) => {
          const workouts = { ...state.workouts }
          delete workouts[date]
          return { workouts, activeWorkoutDate: null }
        }),

      updateWorkoutNotes: (date, notes) =>
        set((state) => ({
          workouts: {
            ...state.workouts,
            [date]: { ...state.workouts[date], notes },
          },
        })),

      loadTemplate: (templateId, date = getToday()) => {
        const template = get().templates.find((t) => t.id === templateId)
        if (!template) return
        const exercises = template.exercises.map((ex) => ({
          id: crypto.randomUUID(),
          name: ex.name,
          block: ex.block || '',
          unit: ex.unit || 'kg',
          sets: Array.from({ length: ex.defaultSets || 3 }, () => ({
            reps: ex.defaultReps || 10,
            weight: ex.lastWeight || 0,
            completed: false,
          })),
          notes: ex.notes || '',
        }))
        set((state) => ({
          workouts: {
            ...state.workouts,
            [date]: {
              id: crypto.randomUUID(),
              date,
              startTime: new Date().toISOString(),
              templateId,
              exercises,
              notes: '',
              completed: false,
            },
          },
          activeWorkoutDate: date,
        }))
      },

      saveAsTemplate: (date, name) => {
        const workout = get().workouts[date]
        if (!workout) return
        const template = {
          id: crypto.randomUUID(),
          name,
          description: 'Template personalizzato',
          exercises: workout.exercises.map((ex) => ({
            name: ex.name,
            block: ex.block || '',
            defaultSets: ex.sets.length,
            defaultReps: ex.sets[0]?.reps || 10,
            lastWeight: ex.sets[0]?.weight || 0,
            unit: ex.unit || 'kg',
          })),
        }
        set((state) => ({ templates: [...state.templates, template] }))
      },

      getWorkoutHistory: () =>
        Object.values(get().workouts).sort((a, b) =>
          b.date.localeCompare(a.date)
        ),

      getExerciseHistory: (exerciseName) =>
        Object.values(get().workouts)
          .filter((w) => w.exercises.some((e) => e.name === exerciseName))
          .map((w) => ({
            date: w.date,
            exercise: w.exercises.find((e) => e.name === exerciseName),
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
    }),
    { name: 'fittracker_workouts', storage: syncStorage }
  )
)
