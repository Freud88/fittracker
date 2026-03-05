const API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ENDPOINT = 'https://api.openai.com/v1/chat/completions'

const PROMPT = `Analizza questo pasto e fornisci una stima nutrizionale.
Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo né backtick, in questo formato:

{
  "dishes": [
    {
      "name": "nome alimento in italiano",
      "quantity_g": 300,
      "calories": 450,
      "protein_g": 35,
      "carbs_g": 40,
      "fat_g": 12,
      "confidence": "high|medium|low"
    }
  ],
  "total": {
    "calories": 450,
    "protein_g": 35,
    "carbs_g": 40,
    "fat_g": 12
  },
  "notes": "nota sulla stima se necessario, altrimenti stringa vuota"
}

Regole:
- Elenca ogni alimento separatamente in dishes
- Stima quantità realistiche per una porzione normale
- confidence: high = alimento chiaro, medium = porzione incerta, low = difficile da valutare
- Nomi sempre in italiano
- Se non riesci a identificare il cibo: dishes:[] e spiega in notes`

export async function estimateFoodFromPhoto(base64Image, mimeType = 'image/jpeg') {
  if (!API_KEY) throw new Error('Chiave API OpenAI non configurata (VITE_OPENAI_API_KEY)')

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'low' } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? ''

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed  = JSON.parse(cleaned)
    if (!parsed.dishes || !parsed.total) throw new Error('Formato risposta non valido')
    return parsed
  } catch {
    throw new Error('Risposta non interpretabile. Riprova con una foto più chiara.')
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function resizeImage(file, maxPx = 1024, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale   = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas  = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    img.src = URL.createObjectURL(file)
  })
}
