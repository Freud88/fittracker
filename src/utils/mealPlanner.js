const MEAL_TARGETS = {
  breakfast: 0.20,
  lunch:     0.35,
  snack:     0.10,
  dinner:    0.35,
}

// --- Public API ---

export function generateWeekPlan(dailyTarget, mealLibrary, bannedIds = []) {
  const available = mealLibrary.filter((m) => !bannedIds.includes(m.id))
  const weekStart  = getMonday(new Date())
  const usedThisWeek = {}
  const days = {}

  for (let i = 0; i < 7; i++) {
    const dateStr = toISODate(addDays(weekStart, i))
    days[dateStr] = { meals: {}, status: 'planned' }

    for (const cat of ['breakfast', 'lunch', 'snack', 'dinner']) {
      const targetKcal = dailyTarget.calories * MEAL_TARGETS[cat]
      const meal = pickMeal(available, cat, targetKcal, usedThisWeek)
      if (meal) {
        days[dateStr].meals[cat] = { ...meal, mealId: meal.id }
        usedThisWeek[meal.id] = (usedThisWeek[meal.id] ?? 0) + 1
      }
    }
  }

  return {
    weekStart: toISODate(weekStart),
    adjustedTargets: buildAdjustedTargets(dailyTarget, weekStart),
    days,
    weeklyDelta: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  }
}

export function regenerateDay(plan, date, mealLibrary, bannedIds, eatenCategories = [], alreadyEatenCalories = null) {
  const available    = mealLibrary.filter((m) => !bannedIds.includes(m.id))
  const target       = plan.adjustedTargets[date]
  const usedThisWeek = countWeeklyUsage(plan)
  const updatedMeals = { ...plan.days[date].meals }

  const toRegen = ['breakfast', 'lunch', 'snack', 'dinner'].filter(cat => !eatenCategories.includes(cat))
  const eatenCalories = alreadyEatenCalories ?? eatenCategories.reduce((sum, cat) => sum + (plan.days[date]?.meals[cat]?.calories ?? 0), 0)
  const remainingCal  = Math.max(0, target.calories - eatenCalories)
  const regenPropSum  = toRegen.reduce((sum, cat) => sum + MEAL_TARGETS[cat], 0)

  for (const cat of toRegen) {
    const targetKcal = regenPropSum > 0 ? remainingCal * (MEAL_TARGETS[cat] / regenPropSum) : target.calories * MEAL_TARGETS[cat]
    const meal = pickMeal(available, cat, targetKcal, usedThisWeek)
    if (meal) updatedMeals[cat] = { ...meal, mealId: meal.id }
  }

  return {
    ...plan,
    days: { ...plan.days, [date]: { ...plan.days[date], meals: updatedMeals } },
  }
}

export function regenerateMeal(plan, date, category, mealLibrary, bannedIds, alreadyEatenCalories = null) {
  const available    = mealLibrary.filter((m) => !bannedIds.includes(m.id))
  const target       = plan.adjustedTargets[date]
  const usedThisWeek = countWeeklyUsage(plan)
  const currentMealId = plan.days[date]?.meals[category]?.id

  // Account for already eaten meals (excluding the one being regenerated)
  const allCats = ['breakfast', 'lunch', 'snack', 'dinner']
  const eatenCats = allCats.filter(cat => cat !== category && plan.days[date]?.meals[cat]?.eaten)
  const eatenCalories = alreadyEatenCalories ?? eatenCats.reduce((sum, cat) => sum + (plan.days[date]?.meals[cat]?.calories ?? 0), 0)
  const remainingCal  = Math.max(0, target.calories - eatenCalories)
  const uneatenCats   = allCats.filter(cat => !eatenCats.includes(cat))
  const propSum       = uneatenCats.reduce((sum, cat) => sum + MEAL_TARGETS[cat], 0)
  const targetKcal    = propSum > 0 ? remainingCal * (MEAL_TARGETS[category] / propSum) : target.calories * MEAL_TARGETS[category]

  // Exclude current meal from pool
  const pool = available.filter((m) => m.id !== currentMealId)
  const meal = pickMeal(pool, category, targetKcal, usedThisWeek)
  if (!meal) return plan

  return {
    ...plan,
    days: {
      ...plan.days,
      [date]: {
        ...plan.days[date],
        meals: {
          ...plan.days[date].meals,
          [category]: { ...meal, mealId: meal.id },
        },
      },
    },
  }
}

export function markMealEaten(plan, date, category) {
  return {
    ...plan,
    days: {
      ...plan.days,
      [date]: {
        ...plan.days[date],
        meals: {
          ...plan.days[date].meals,
          [category]: { ...plan.days[date].meals[category], eaten: true, actual: false },
        },
      },
    },
  }
}

export function recordActualMeal(plan, date, category, actualMeal, dailyTarget) {
  // Step 1: sostituisci il pasto nel piano
  const updatedPlan = {
    ...plan,
    days: {
      ...plan.days,
      [date]: {
        ...plan.days[date],
        meals: {
          ...plan.days[date].meals,
          [category]: { ...actualMeal, mealId: actualMeal.id ?? 'custom', actual: true, eaten: true },
        },
      },
    },
  }

  // Step 2: compensa nel giorno
  const compensated = compensateInDay(updatedPlan, date, category, plan.days[date]?.meals[category])

  // Step 3: redistribuisci il delta della settimana
  return redistributeWeeklyDelta(compensated, date, dailyTarget)
}

// --- Private helpers ---

function pickMeal(available, category, targetKcal, usedThisWeek) {
  const byCat = available.filter((m) => m.category === category)
  if (byCat.length === 0) return null

  // Priorità ai pasti usati meno di 2 volte questa settimana
  const underLimit = byCat.filter((m) => (usedThisWeek[m.id] ?? 0) < 2)
  const pool = underLimit.length > 0 ? underLimit : byCat

  // Sceglie il pasto con varietà casuale
  const picked = pool
    .map((m) => ({ m, score: Math.random() }))
    .sort((a, b) => a.score - b.score)[0].m

  // Scala le porzioni al target calorico dell'utente
  const scale = targetKcal / picked.calories
  return {
    ...picked,
    calories: Math.round(targetKcal),
    protein:  Math.round(picked.protein  * scale * 10) / 10,
    carbs:    Math.round(picked.carbs    * scale * 10) / 10,
    fat:      Math.round(picked.fat      * scale * 10) / 10,
    ingredients: (picked.ingredients ?? []).map((ing) => ({
      ...ing,
      grams: Math.round(ing.grams * scale),
    })),
  }
}

function compensateInDay(plan, date, changedCategory, plannedMeal) {
  const order     = ['breakfast', 'lunch', 'snack', 'dinner']
  const idx       = order.indexOf(changedCategory)
  const remaining = order
    .slice(idx + 1)
    .filter((cat) => !plan.days[date].meals[cat]?.eaten && !plan.days[date].meals[cat]?.actual)

  if (remaining.length === 0) return plan

  const actualMeal = plan.days[date].meals[changedCategory]
  const dKcal = (actualMeal?.calories ?? 0) - (plannedMeal?.calories ?? 0)
  const dP    = (actualMeal?.protein  ?? 0) - (plannedMeal?.protein  ?? 0)
  const dC    = (actualMeal?.carbs    ?? 0) - (plannedMeal?.carbs    ?? 0)
  const dF    = (actualMeal?.fat      ?? 0) - (plannedMeal?.fat      ?? 0)

  const perMeal = {
    calories: -dKcal / remaining.length,
    protein:  -dP    / remaining.length,
    carbs:    -dC    / remaining.length,
    fat:      -dF    / remaining.length,
  }

  const updatedMeals = { ...plan.days[date].meals }
  for (const cat of remaining) {
    const m = updatedMeals[cat]
    if (m) {
      updatedMeals[cat] = {
        ...m,
        calories: Math.max(100, Math.round(m.calories + perMeal.calories)),
        protein:  Math.max(0,   Math.round((m.protein  + perMeal.protein)  * 10) / 10),
        carbs:    Math.max(0,   Math.round((m.carbs    + perMeal.carbs)    * 10) / 10),
        fat:      Math.max(0,   Math.round((m.fat      + perMeal.fat)      * 10) / 10),
        adjusted: true,
      }
    }
  }

  return { ...plan, days: { ...plan.days, [date]: { ...plan.days[date], meals: updatedMeals } } }
}

function redistributeWeeklyDelta(plan, fromDate, dailyTarget) {
  const allDays    = Object.keys(plan.days).sort()
  const futureDays = allDays.filter((d) => d > fromDate)
  if (futureDays.length === 0) return plan

  const dayMeals  = Object.values(plan.days[fromDate].meals)
  const dayTotals = dayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m?.calories ?? 0),
      protein:  acc.protein  + (m?.protein  ?? 0),
      carbs:    acc.carbs    + (m?.carbs    ?? 0),
      fat:      acc.fat      + (m?.fat      ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const delta = {
    calories: dayTotals.calories - dailyTarget.calories,
    protein:  dayTotals.protein  - dailyTarget.protein,
    carbs:    dayTotals.carbs    - dailyTarget.carbs,
    fat:      dayTotals.fat      - dailyTarget.fat,
  }

  const perDay = {
    calories: -delta.calories / futureDays.length,
    protein:  -delta.protein  / futureDays.length,
    carbs:    -delta.carbs    / futureDays.length,
    fat:      -delta.fat      / futureDays.length,
  }

  const updatedTargets = { ...plan.adjustedTargets }
  for (const day of futureDays) {
    updatedTargets[day] = {
      calories: Math.max(1500, Math.round(updatedTargets[day].calories + perDay.calories)),
      protein:  Math.max(80,   Math.round((updatedTargets[day].protein  + perDay.protein)  * 10) / 10),
      carbs:    Math.max(100,  Math.round((updatedTargets[day].carbs    + perDay.carbs)    * 10) / 10),
      fat:      Math.max(40,   Math.round((updatedTargets[day].fat      + perDay.fat)      * 10) / 10),
    }
  }

  return { ...plan, adjustedTargets: updatedTargets, weeklyDelta: delta }
}

export function getWeekDelta(plan) {
  return plan?.weeklyDelta ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
}

export function getFutureDaysCount(plan) {
  if (!plan) return 0
  const today = new Date().toISOString().split('T')[0]
  return Object.keys(plan.days).filter((d) => d > today).length
}

// --- Date utils ---
function getMonday(date) {
  const d   = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toISODate(date) {
  return date.toISOString().split('T')[0]
}

function buildAdjustedTargets(target, weekStart) {
  const targets = {}
  for (let i = 0; i < 7; i++) {
    targets[toISODate(addDays(weekStart, i))] = { ...target }
  }
  return targets
}

function countWeeklyUsage(plan) {
  const counts = {}
  for (const day of Object.values(plan.days)) {
    for (const meal of Object.values(day.meals ?? {})) {
      if (meal?.mealId) counts[meal.mealId] = (counts[meal.mealId] ?? 0) + 1
    }
  }
  return counts
}
