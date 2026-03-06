const API_KEY  = import.meta.env.VITE_RAPIDAPI_KEY
const BASE_URL = 'https://exercisedb.p.rapidapi.com'

// Italian/mixed names → English search term for ExerciseDB
const NAME_MAP = [
  ['chest press',      'chest press'],
  ['pectoral fly',     'pec deck'],
  ['pec fly',          'pec deck'],
  ['lat machine',      'lat pulldown'],
  ['lat pulldown',     'lat pulldown'],
  ['low row',          'seated cable row'],
  ['face pull',        'face pull'],
  ['hip thrust',       'hip thrust'],
  ['stacco rumeno',    'romanian deadlift'],
  ['romanian',         'romanian deadlift'],
  ['leg press',        'leg press'],
  ['leg extension',    'leg extension'],
  ['leg curl',         'leg curl'],
  ['polpacci',         'calf raise'],
  ['calf',             'calf raise'],
  ['alzate laterali',  'lateral raise'],
  ['lateral raise',    'lateral raise'],
  ['curl bilanciere',  'barbell curl'],
  ['curl manubri',     'dumbbell curl'],
  ['bicep curl',       'barbell curl'],
  ['bicep',            'barbell curl'],
  ['pushdown',         'tricep pushdown'],
  ['tricep',           'tricep pushdown'],
  ['crunch',           'crunch'],
  ['palla medica',     'medicine ball'],
  ['medicine ball',    'medicine ball'],
  ['plank',            'plank'],
  ['incline walking',  'walking'],
  ['squat',            'squat'],
  ['stacco',           'deadlift'],
  ['deadlift',         'deadlift'],
  ['panca piana',      'barbell bench press'],
  ['bench press',      'barbell bench press'],
  ['lento avanti',     'shoulder press'],
  ['shoulder press',   'shoulder press'],
  ['pull up',          'pull up'],
  ['pullup',           'pull up'],
  ['trazioni',         'pull up'],
  ['dip',              'tricep dip'],
  ['affondi',          'lunge'],
  ['lunge',            'lunge'],
  ['rematore',         'barbell row'],
  ['row',              'barbell row'],
  ['military press',   'military press'],
  ['arnold press',     'arnold press'],
]

function toEnglish(name) {
  // strip parenthetical suffixes like "(macchina)", "(cavi)", etc.
  const cleaned = name.replace(/\s*\(.*?\)/g, '').trim()
  const lower = cleaned.toLowerCase()
  for (const [it, en] of NAME_MAP) {
    if (lower.includes(it)) return en
  }
  return cleaned // fallback: use cleaned name
}

const cache = {}
const gifBlobCache = {}

const HEADERS = {
  'X-RapidAPI-Key':  API_KEY,
  'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
}

export async function searchExercise(name) {
  const searchTerm = toEnglish(name)
  if (cache[searchTerm]) return cache[searchTerm]

  const res = await fetch(
    `${BASE_URL}/exercises/name/${encodeURIComponent(searchTerm)}?limit=3&offset=0`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`)
  const data = await res.json()
  const result = data[0] || null
  cache[searchTerm] = result
  return result
}

export async function fetchGifBlob(gifUrl) {
  if (!gifUrl) return null
  if (gifBlobCache[gifUrl]) return gifBlobCache[gifUrl]
  try {
    const res = await fetch(gifUrl, { headers: HEADERS })
    if (!res.ok) return null
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    gifBlobCache[gifUrl] = objectUrl
    return objectUrl
  } catch {
    return null
  }
}
