const API_KEY  = import.meta.env.VITE_RAPIDAPI_KEY
const BASE_URL = 'https://exercisedb.p.rapidapi.com'

// Italian/mixed names → English search term for ExerciseDB
const NAME_MAP = [
  ['chest press',      'chest press machine'],
  ['pectoral fly',     'pec fly'],
  ['pec fly',          'pec fly'],
  ['lat machine',      'lat pulldown'],
  ['lat pulldown',     'lat pulldown'],
  ['low row',          'seated cable row'],
  ['face pull',        'face pull'],
  ['hip thrust',       'hip thrust'],
  ['stacco rumeno',    'romanian deadlift'],
  ['romanian',         'romanian deadlift'],
  ['leg curl',         'leg curl'],
  ['polpacci',         'calf raise'],
  ['calf',             'calf raise'],
  ['lateral raise',    'lateral raise'],
  ['curl bilanciere',  'barbell curl'],
  ['bicep curl',       'barbell curl'],
  ['pushdown',         'tricep pushdown'],
  ['tricep',           'tricep pushdown'],
  ['crunch',           'crunch'],
  ['palla medica',     'medicine ball'],
  ['medicine ball',    'medicine ball'],
  ['plank',            'plank'],
  ['incline walking',  'treadmill'],
  ['squat',            'squat'],
  ['deadlift',         'deadlift'],
  ['bench press',      'barbell bench press'],
  ['shoulder press',   'shoulder press'],
  ['pull up',          'pull up'],
  ['dip',              'tricep dip'],
  ['lunge',            'lunge'],
  ['row',              'barbell row'],
]

function toEnglish(name) {
  const lower = name.toLowerCase()
  for (const [it, en] of NAME_MAP) {
    if (lower.includes(it)) return en
  }
  return name // fallback: use as-is
}

const cache = {}

export async function searchExercise(name) {
  const searchTerm = toEnglish(name)
  if (cache[searchTerm]) return cache[searchTerm]

  const res = await fetch(
    `${BASE_URL}/exercises/name/${encodeURIComponent(searchTerm)}?limit=3&offset=0`,
    {
      headers: {
        'X-RapidAPI-Key':  API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    }
  )
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`)
  const data = await res.json()
  const result = data[0] || null
  cache[searchTerm] = result
  return result
}
