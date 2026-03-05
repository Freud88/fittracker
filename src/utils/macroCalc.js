export function calcRemaining(targets, totals) {
  return {
    calories: Math.max(0, targets.calories - totals.calories),
    protein: Math.max(0, targets.protein - totals.protein),
    carbs: Math.max(0, targets.carbs - totals.carbs),
    fat: Math.max(0, targets.fat - totals.fat),
  }
}

export function calcPercentage(current, target) {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function calcMacroFromFood(food, quantity) {
  const factor = quantity / 100
  return {
    calories: Math.round(food.per100g.calories * factor * 10) / 10,
    protein: Math.round(food.per100g.protein * factor * 10) / 10,
    carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
    fat: Math.round(food.per100g.fat * factor * 10) / 10,
  }
}

export function getMostDeficientMacro(remaining, targets) {
  const macros = [
    { name: 'protein', pct: remaining.protein / targets.protein },
    { name: 'carbs', pct: remaining.carbs / targets.carbs },
    { name: 'fat', pct: remaining.fat / targets.fat },
  ]
  return macros.sort((a, b) => b.pct - a.pct)[0].name
}

export function getStatusColor(percentage) {
  if (percentage >= 100) return 'accent-red'
  if (percentage >= 80) return 'accent-gold'
  return 'accent-green'
}
