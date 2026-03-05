/**
 * Formatta un ingrediente per la visualizzazione.
 * Per le uova mostra il conteggio invece dei grammi.
 */
export function formatIngredient(ing) {
  const name = ing.name.toLowerCase()
  if (name.includes('uovo') || name.includes('uova')) {
    const count = Math.max(1, Math.round(ing.grams / 50))
    return `${ing.name} ×${count}`
  }
  return `${ing.name} ${ing.grams}g`
}
