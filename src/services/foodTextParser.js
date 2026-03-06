const API_KEY  = import.meta.env.VITE_ANTHROPIC_API_KEY
const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL    = 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT = `Sei un nutrizionista esperto con conoscenza precisa dei valori nutrizionali degli alimenti.
L'utente descrive cosa ha mangiato. Calcola calorie e macronutrienti con precisione e rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo né backtick:

{
  "name": "nome breve del pasto in italiano",
  "calories": 450,
  "protein": 35,
  "carbs": 40,
  "fat": 12
}

Regole importanti:
- Quando si indica pasta, riso o cereali senza specificare, considera il PESO SECCO CRUDO (non cotto)
- Usa i valori nutrizionali reali per 100g di ogni alimento (es. pasta secca = ~350 kcal/100g, non 130 kcal/100g cotta)
- Stima le quantità in modo realistico se non specificate (porzione normale per un adulto)
- name: nome conciso (es. "Pasta al tonno", non "200g di pasta con tonno in scatola")
- Se ci sono più alimenti, uniscili in un nome breve (es. "Riso e pollo con verdure")
- Se non riesci a capire cosa ha mangiato, rispondi con: { "error": "descrizione non comprensibile" }`

export async function parseMealFromText(description) {
  if (!API_KEY) throw new Error('Chiave API Anthropic non configurata (VITE_ANTHROPIC_API_KEY)')

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.error) throw new Error(parsed.error)
    if (!parsed.name || parsed.calories == null) throw new Error('Risposta non valida')
    return parsed
  } catch {
    throw new Error('Non riesco a interpretare la descrizione. Prova a essere più specifico.')
  }
}
