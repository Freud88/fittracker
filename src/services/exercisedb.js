// Free exercise DB for metadata (muscles, instructions)
const DB_URL  = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const GIF_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

// MuscleWiki video CDN — publicly accessible, no auth
const MW_VIDEO = 'https://media.musclewiki.com/media/uploads/videos/branded/male'

// [Italian keyword, free-db search term, musclewiki slug]
const NAME_MAP = [
  ['chest press',     'chest press',       'chest-press-machine'],
  ['pectoral fly',    'dumbbell flyes',    'pec-deck-fly'],
  ['pec fly',         'dumbbell flyes',    'pec-deck-fly'],
  [' fly',            'dumbbell flyes',    'cable-fly'],
  ['lat machine',     'lat pulldown',      'lat-pulldown'],
  ['lat pulldown',    'lat pulldown',      'lat-pulldown'],
  ['low row',         'seated cable row',  'seated-cable-row'],
  ['face pull',       'face pull',         'cable-face-pull'],
  ['hip thrust',      'hip thrust',        'barbell-hip-thrust'],
  ['stacco rumeno',   'romanian deadlift', 'romanian-deadlift'],
  ['romanian',        'romanian deadlift', 'romanian-deadlift'],
  ['leg press',       'leg press',         'leg-press'],
  ['leg extension',   'leg extension',     'leg-extension'],
  ['leg curl',        'leg curl',          'leg-curl'],
  ['polpacci',        'calf raise',        'calf-raise'],
  ['calf',            'calf raise',        'calf-raise'],
  ['alzate laterali', 'lateral raise',     'dumbbell-lateral-raise'],
  ['lateral raise',   'lateral raise',     'dumbbell-lateral-raise'],
  ['curl bilanciere', 'barbell curl',      'barbell-curl'],
  ['curl manubri',    'dumbbell curl',     'dumbbell-curl'],
  ['bicep curl',      'barbell curl',      'barbell-curl'],
  ['bicep',           'barbell curl',      'barbell-curl'],
  ['pushdown',        'tricep pushdown',   'cable-pushdown'],
  ['tricep',          'tricep',            'cable-pushdown'],
  ['crunch',          'crunch',            'crunch'],
  ['plank',           'plank',             'plank'],
  ['incline walking', 'treadmill',         null],
  ['squat',           'squat',             'barbell-squat'],
  ['stacco',          'deadlift',          'barbell-deadlift'],
  ['deadlift',        'deadlift',          'barbell-deadlift'],
  ['panca piana',     'bench press',       'barbell-bench-press'],
  ['bench press',     'bench press',       'barbell-bench-press'],
  ['lento avanti',    'shoulder press',    'barbell-shoulder-press'],
  ['shoulder press',  'shoulder press',    'barbell-shoulder-press'],
  ['pull up',         'pull-up',           'pull-up'],
  ['pullup',          'pull-up',           'pull-up'],
  ['trazioni',        'pull-up',           'pull-up'],
  ['dip',             'dip',               'dip'],
  ['affondi',         'lunge',             'barbell-lunge'],
  ['lunge',           'lunge',             'barbell-lunge'],
  ['rematore',        'barbell row',       'barbell-bent-over-row'],
  ['row',             'row',               'barbell-bent-over-row'],
  ['military press',  'military press',    'barbell-military-press'],
  ['arnold press',    'arnold press',      'arnold-press'],
]

function toTerms(name) {
  const cleaned = name.replace(/\s*\(.*?\)/g, '').trim().toLowerCase()
  for (const [it, en, mw] of NAME_MAP) {
    if (cleaned.includes(it)) return { searchTerm: en, mwSlug: mw }
  }
  return { searchTerm: cleaned, mwSlug: null }
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
  const { searchTerm, mwSlug } = toTerms(name)
  if (cache[searchTerm]) return cache[searchTerm]

  const db = await getDb()
  const words = searchTerm.split(' ').filter(Boolean)

  let best = null
  let bestScore = 0
  for (const ex of db) {
    const exName = ex.name.toLowerCase()
    const score = words.filter(w => exName.includes(w)).length
    if (score > bestScore) { bestScore = score; best = ex }
  }

  const result = {
    name:             best?.name ?? name,
    bodyPart:         best?.category ?? '',
    target:           best?.primaryMuscles?.[0] ?? '',
    equipment:        best?.equipment ?? '',
    secondaryMuscles: best?.secondaryMuscles ?? [],
    instructions:     best?.instructions ?? [],
    gifUrl:           best?.images?.[0] ? `${GIF_BASE}/${best.images[0]}` : null,
    gifUrl2:          best?.images?.[1] ? `${GIF_BASE}/${best.images[1]}` : null,
    videoUrl:         mwSlug ? `${MW_VIDEO}-${mwSlug}-front.mp4` : null,
  }
  cache[searchTerm] = result
  return result
}
