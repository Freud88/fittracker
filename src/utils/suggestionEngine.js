import { MEAL_SUGGESTIONS } from '../data/mealSuggestions'

function getTimeSlot(hour) {
  if (hour < 12) return 'morning'
  if (hour < 15) return 'lunch'
  if (hour < 19) return 'afternoon'
  return 'evening'
}

function isTimeAppropriate(meal, timeSlot) {
  return meal.timeSlots.includes(timeSlot)
}

function calcScore(meal, remaining) {
  const proteinScore = remaining.protein > 0
    ? (meal.protein / remaining.protein) * 3
    : 0
  const carbScore = remaining.carbs > 0
    ? meal.carbs / remaining.carbs
    : 0
  const calScore = remaining.calories > 0
    ? 1 - Math.abs(meal.calories - remaining.calories * 0.4) / remaining.calories
    : 0
  return proteinScore + carbScore + calScore
}

export function getSuggestions(remaining, hour = new Date().getHours()) {
  const timeSlot = getTimeSlot(hour)
  const maxCal = remaining.calories * 1.1

  return MEAL_SUGGESTIONS
    .filter(meal => remaining.calories <= 0 || meal.calories <= maxCal)
    .filter(meal => isTimeAppropriate(meal, timeSlot))
    .map(meal => ({
      ...meal,
      score: calcScore(meal, remaining)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
