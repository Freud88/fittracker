// Free exercise database — no API key needed, GIFs hosted on GitHub
const DB_URL  = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const GIF_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

// Italian/mixed → English keywords for matching
const NAME_MAP = [
  ['chest press',     'chest press'],
  ['pectoral fly',    'dumbbell flyes'],
  ['pec fly',         'dumbbell flyes'],
  [' fly',            'dumbbell flyes'],
  ['lat machine',     'lat pulldown'],
  ['lat pulldown',    'lat pulldown'],
  ['low row',         'seated cable row'],
  ['face pull',       'face pull'],
  ['hip thrust',      'hip thrust'],
  ['stacco rumeno',   'romanian deadlift'],
  ['romanian',        'romanian deadlift'],
  ['leg press',       'leg press'],
  ['leg extension',   'leg extension'],
  ['leg curl',        'leg curl'],
  ['polpacci',        'calf raise'],
  ['calf',            'calf raise'],
  ['alzate laterali', 'lateral raise'],
  ['lateral raise',   'lateral raise'],
  ['curl bilanciere', 'barbell curl'],
  ['curl manubri',    'dumbbell curl'],
  ['bicep curl',      'barbell curl'],
  ['bicep',           'barbell curl'],
  ['pushdown',        'tricep pushdown'],
  ['tricep',          'tricep'],
  ['crunch',          'crunch'],
  ['plank',           'plank'],
  ['incline walking', 'treadmill'],
  ['squat',           'squat'],
  ['stacco',          'deadlift'],
  ['deadlift',        'deadlift'],
  ['panca piana',     'bench press'],
  ['bench press',     'bench press'],
  ['lento avanti',    'shoulder press'],
  ['shoulder press',  'shoulder press'],
  ['pull up',         'pull-up'],
  ['pullup',          'pull-up'],
  ['trazioni',        'pull-up'],
  ['dip',             'dip'],
  ['affondi',         'lunge'],
  ['lunge',           'lunge'],
  ['rematore',        'barbell row'],
  ['row',             'row'],
  ['military press',  'military press'],
  ['arnold press',    'arnold press'],
]

function toSearchTerm(name) {
  const cleaned = name.replace(/\s*\(.*?\)/g, '').trim().toLowerCase()
  for (const [it, en] of NAME_MAP) {
    if (cleaned.includes(it)) return en
  }
  return cleaned
}

let _db = null

async function getDb() {
  if (_db) return _db
  const res = await fetch(DB_URL)
  if (!res.ok) throw new Error('Impossibile caricare il database esercizi')
  _db = await res.json()
  return _db
}

const cache = {}

export async function searchExercise(name) {
  const term = toSearchTerm(name)
  if (cache[term]) return cache[term]

  const db = await getDb()
  const words = term.split(' ').filter(Boolean)

  // Score each exercise by how many keywords match
  let best = null
  let bestScore = 0
  for (const ex of db) {
    const exName = ex.name.toLowerCase()
    const score = words.filter(w => exName.includes(w)).length
    if (score > bestScore) { bestScore = score; best = ex }
  }

  if (!best || bestScore === 0) { cache[term] = null; return null }

  const result = {
    name:             best.name,
    bodyPart:         best.category,
    target:           best.primaryMuscles?.[0] || '',
    equipment:        best.equipment,
    secondaryMuscles: best.secondaryMuscles || [],
    instructions:     best.instructions || [],
    gifUrl:           best.images?.[0] ? `${GIF_BASE}/${best.images[0]}` : null,
  }
  cache[term] = result
  return result
}
