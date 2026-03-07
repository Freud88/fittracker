// Free exercise DB for metadata (muscles, instructions)
const DB_URL  = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const GIF_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

// MuscleWiki video CDN — publicly accessible, no auth
const MW_VIDEO = 'https://media.musclewiki.com/media/uploads/videos/branded/male'

// [Italian keyword, free-db search term, musclewiki slug (verified working)]
const NAME_MAP = [
  ['chest press',     'chest press',       'Machine-machine-chest-press'],
  ['pectoral fly',    'dumbbell flyes',    'cable-pec-fly'],
  ['pec fly',         'dumbbell flyes',    'cable-pec-fly'],
  [' fly',            'dumbbell flyes',    'cable-pec-fly'],
  ['lat machine',     'lat pulldown',      null],
  ['lat pulldown',    'lat pulldown',      null],
  ['low row',         'seated cable row',  null],
  ['face pull',       'face pull',         'Band-band-face-pull'],
  ['hip thrust',      'hip thrust',        'Barbell-barbell-hip-thrust'],
  ['stacco rumeno',   'romanian deadlift', 'Vitruvian-romanian-deadlift'],
  ['romanian',        'romanian deadlift', 'Vitruvian-romanian-deadlift'],
  ['leg press',       'leg press',         'Machine-machine-leg-press'],
  ['leg extension',   'leg extension',     'machine-leg-extension'],
  ['leg curl',        'leg curl',          'machine-hamstring-curl'],
  ['polpacci',        'calf raise',        'Vitruvian-standing-calf-raise'],
  ['calf',            'calf raise',        'Vitruvian-standing-calf-raise'],
  ['alzate laterali', 'lateral raise',     'Dumbbells-dumbbell-lateral-raise'],
  ['lateral raise',   'lateral raise',     'Dumbbells-dumbbell-lateral-raise'],
  ['curl bilanciere', 'barbell curl',      'Barbell-barbell-curl'],
  ['curl manubri',    'dumbbell curl',     'Dumbbells-dumbbell-curl'],
  ['bicep curl',      'barbell curl',      'Barbell-barbell-curl'],
  ['bicep',           'barbell curl',      'Barbell-barbell-curl'],
  ['pushdown',        'tricep pushdown',   null],
  ['tricep',          'tricep',            null],
  ['crunch',          'crunch',            'Vitruvian-crunch'],
  ['plank',           'plank',             'Medicine-Ball-plank'],
  ['incline walking', 'treadmill',         null],
  ['squat',           'squat',             'Barbell-barbell-squat'],
  ['stacco',          'deadlift',          'Barbell-barbell-deadlift'],
  ['deadlift',        'deadlift',          'Barbell-barbell-deadlift'],
  ['panca piana',     'bench press',       'barbell-bench-press'],
  ['bench press',     'bench press',       'barbell-bench-press'],
  ['lento avanti',    'shoulder press',    'Barbell-barbell-overhead-press'],
  ['shoulder press',  'shoulder press',    'Barbell-barbell-overhead-press'],
  ['pull up',         'pull-up',           null],
  ['pullup',          'pull-up',           null],
  ['trazioni',        'pull-up',           null],
  ['dip',             'dip',               null],
  ['affondi',         'lunge',             'Medicine-Ball-reverse-lunge'],
  ['lunge',           'lunge',             'Medicine-Ball-reverse-lunge'],
  ['rematore',        'barbell row',       'barbell-bent-over-row'],
  ['row',             'row',               'barbell-bent-over-row'],
  ['military press',  'military press',    'Barbell-barbell-overhead-press'],
  ['arnold press',    'arnold press',      'Vitruvian-arnold-press'],
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
