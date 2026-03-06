const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Sei un nutrizionista esperto. L'utente descrive cosa ha mangiato in linguaggio naturale.
Stima calorie e macronutrienti e rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo né backtick:

{
  "name": "nome breve del pasto in italiano",
  "calories": 450,
  "protein": 35,
  "carbs": 40,
  "fat": 12
}

Regole:
- Stima le quantità in modo realistico se non specificate (porzione normale per un adulto)
- name: nome conciso (es. "Pasta al tonno", non "200g di pasta con tonno in scatola")
- Se ci sono più alimenti, uniscili in un nome breve (es. "Riso e pollo con verdure")
- Se non riesci a capire cosa ha mangiato, rispondi con: { "error": "descrizione non comprensibile" }`

export async function parseMealFromText(description) {
  if (!API_KEY) throw new Error('Chiave API Groq non configurata (VITE_GROQ_API_KEY)')

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 256,
      temperature: 0.1,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? ''

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
