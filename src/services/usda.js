const BASE = 'https://api.nal.usda.gov/fdc/v1'
const KEY  = import.meta.env.VITE_USDA_API_KEY

// Mappa IT → EN: frasi prima, poi parole singole (ordinate per lunghezza desc)
const IT_EN_MAP = {
  // Frasi multi-parola (priorità alta)
  'fesa di tacchino':       'turkey breast',
  'petto di pollo':         'chicken breast raw',
  'albume d\'uovo':         'egg white raw',
  'uova intere':            'eggs whole raw',
  'latte scremato':         'skim milk',
  'latte intero':           'whole milk',
  'riso integrale':         'brown rice cooked',
  'riso bianco':            'white rice cooked',
  'pasta integrale':        'whole wheat pasta cooked',
  'pasta di riso':          'rice pasta cooked',
  'pane integrale':         'whole wheat bread',
  'pane bianco':            'white bread',
  'olio di oliva':          'olive oil',
  'olio evo':               'olive oil extra virgin',
  'burro di mandorle':      'almond butter',
  'burro di arachidi':      'peanut butter',
  'yogurt greco':           'greek yogurt plain',
  'yogurt bianco':          'plain yogurt',
  'tonno al naturale':      'tuna canned water',
  'tonno in scatola':       'tuna canned water',
  'salmone affumicato':     'salmon smoked',
  'filetto di salmone':     'salmon fillet raw',
  'insalata mista':         'mixed greens salad',
  'insalata verde':         'romaine lettuce raw',
  'fagioli neri':           'black beans cooked',
  'fagioli bianchi':        'white beans cooked',
  'ceci cotti':             'chickpeas cooked',
  'farro soffiato':         'spelt puffed',
  'orzo soffiato':          'barley puffed',
  'fiocchi di avena':       'oat flakes',
  'whey protein':           'whey protein powder',
  'proteine del siero':     'whey protein powder',
  'patate dolci':           'sweet potato raw',
  'patata dolce':           'sweet potato raw',
  'petto di tacchino':      'turkey breast raw',
  'carne macinata':         'ground beef lean',
  'manzo macinato':         'ground beef lean',
  'bistecca di manzo':      'beef steak raw',
  'filetto di manzo':       'beef tenderloin raw',
  'bresaola':               'beef bresaola',
  'prosciutto cotto':       'ham cooked',
  'prosciutto crudo':       'prosciutto',
  'mozzarella di bufala':   'buffalo mozzarella',
  'fiocchi di latte':       'cottage cheese low fat',
  'frutta secca':           'mixed nuts',
  'noci miste':             'mixed nuts',

  // Parole singole
  'pollo':      'chicken breast',
  'tacchino':   'turkey breast',
  'uova':       'eggs whole raw',
  'uovo':       'egg whole raw',
  'riso':       'rice cooked',
  'pasta':      'pasta cooked',
  'salmone':    'salmon atlantic raw',
  'tonno':      'tuna canned water',
  'latte':      'whole milk',
  'pane':       'bread whole wheat',
  'spinaci':    'spinach raw',
  'zucchine':   'zucchini raw',
  'zucchina':   'zucchini raw',
  'broccoli':   'broccoli raw',
  'banana':     'banana raw',
  'mela':       'apple raw',
  'arancia':    'orange raw',
  'yogurt':     'greek yogurt plain',
  'ricotta':    'ricotta cheese',
  'farro':      'spelt cooked',
  'avena':      'oats rolled',
  'mandorle':   'almonds raw',
  'mandorla':   'almonds raw',
  'noci':       'walnuts raw',
  'noce':       'walnuts raw',
  'anacardi':   'cashews raw',
  'pistacchi':  'pistachios raw',
  'rucola':     'arugula raw',
  'lattuga':    'lettuce romaine raw',
  'pomodoro':   'tomato raw',
  'pomodori':   'tomatoes raw',
  'cetriolo':   'cucumber raw',
  'carota':     'carrots raw',
  'carote':     'carrots raw',
  'patate':     'potatoes raw',
  'patata':     'potato raw',
  'aglio':      'garlic raw',
  'cipolla':    'onion raw',
  'mirtilli':   'blueberries raw',
  'fragole':    'strawberries raw',
  'fragola':    'strawberry raw',
  'kiwi':       'kiwi raw',
  'pera':       'pear raw',
  'pere':       'pears raw',
  'cachi':      'persimmon raw',
  'figs':       'figs raw',
  'fichi':      'figs raw',
  'limone':     'lemon raw',
  'manzo':      'beef raw',
  'vitello':    'veal raw',
  'maiale':     'pork raw',
  'bresaola':   'beef bresaola',
  'mozzarella': 'mozzarella cheese',
  'parmigiano': 'parmesan cheese',
  'pecorino':   'pecorino cheese',
  'grana':      'grana padano cheese',
  'burro':      'butter',
  'olio':       'olive oil',
  'aceto':      'vinegar',
  'ceci':       'chickpeas cooked',
  'lenticchie': 'lentils cooked',
  'fagioli':    'beans cooked',
  'piselli':    'peas cooked',
  'tofu':       'tofu raw',
  'tempeh':     'tempeh',
  'soia':       'soy',
  'cioccolato': 'dark chocolate',
  'miele':      'honey',
  'zucchero':   'sugar',
  'farina':     'flour wheat',
  'quinoa':     'quinoa cooked',
  'mais':       'corn raw',
  'polenta':    'cornmeal',
}

// ID nutrienti USDA
const NID = { calories: 1008, protein: 1003, carbs: 1005, fat: 1004 }

// Mappa EN → IT per tradurre i nomi dei risultati
const EN_IT_DISPLAY = {
  'chicken breast':        'Petto di pollo',
  'turkey breast':         'Fesa di tacchino',
  'egg':                   'Uovo',
  'eggs':                  'Uova',
  'whole milk':            'Latte intero',
  'skim milk':             'Latte scremato',
  'brown rice':            'Riso integrale',
  'white rice':            'Riso bianco',
  'pasta':                 'Pasta',
  'whole wheat bread':     'Pane integrale',
  'white bread':           'Pane bianco',
  'olive oil':             'Olio EVO',
  'almond butter':         'Burro di mandorle',
  'greek yogurt':          'Yogurt greco',
  'tuna':                  'Tonno',
  'salmon':                'Salmone',
  'spinach':               'Spinaci',
  'zucchini':              'Zucchine',
  'broccoli':              'Broccoli',
  'banana':                'Banana',
  'apple':                 'Mela',
  'orange':                'Arancia',
  'ricotta':               'Ricotta',
  'spelt':                 'Farro',
  'oats':                  'Avena',
  'almonds':               'Mandorle',
  'walnuts':               'Noci',
  'mozzarella':            'Mozzarella',
  'parmesan':              'Parmigiano',
  'chickpeas':             'Ceci',
  'lentils':               'Lenticchie',
  'sweet potato':          'Patata dolce',
  'whey protein':          'Proteine del siero (Whey)',
  'cottage cheese':        'Fiocchi di latte',
  'peanut butter':         'Burro di arachidi',
  'beef':                  'Manzo',
  'pork':                  'Maiale',
  'ham':                   'Prosciutto cotto',
  'strawberries':          'Fragole',
  'blueberries':           'Mirtilli',
  'quinoa':                'Quinoa',
  'tofu':                  'Tofu',
}

/** Traduce query italiana → inglese.
 *  Prima cerca frasi (più specifiche), poi parole singole. */
function translateQuery(query) {
  const q = query.toLowerCase().trim()

  // Ordina le chiavi per lunghezza decrescente (frasi prima di parole)
  const keys = Object.keys(IT_EN_MAP).sort((a, b) => b.length - a.length)

  // Cerca la corrispondenza più lunga contenuta nella query
  for (const key of keys) {
    if (q.includes(key)) return IT_EN_MAP[key]
  }

  return q // nessuna traduzione trovata, usa la query originale
}

/** Prova a tradurre in italiano il nome inglese USDA */
function italianizeName(engName) {
  const lower = engName.toLowerCase()
  for (const [eng, ita] of Object.entries(EN_IT_DISPLAY)) {
    if (lower.includes(eng.toLowerCase())) {
      // Mantieni eventuali dettagli aggiuntivi tra parentesi
      const extra = engName.replace(new RegExp(eng, 'i'), '').trim()
      return extra ? `${ita} (${extra})` : ita
    }
  }
  return engName
}

function getNutrient(foodNutrients, id) {
  return foodNutrients?.find((n) => n.nutrientId === id)?.value ?? 0
}

function mapFood(item, originalQuery) {
  return {
    id: `usda-${item.fdcId}`,
    fdcId: item.fdcId,
    name: italianizeName(item.description),
    nameEn: item.description,
    per100g: {
      calories: Math.round(getNutrient(item.foodNutrients, NID.calories)),
      protein:  Math.round(getNutrient(item.foodNutrients, NID.protein)  * 10) / 10,
      carbs:    Math.round(getNutrient(item.foodNutrients, NID.carbs)    * 10) / 10,
      fat:      Math.round(getNutrient(item.foodNutrients, NID.fat)      * 10) / 10,
    },
    source: 'usda',
  }
}

export async function searchFoods(query) {
  if (!KEY) throw new Error('USDA API key non configurata')

  const cached = getCache(query)
  if (cached) return cached

  const translated = translateQuery(query)
  const url = `${BASE}/foods/search?query=${encodeURIComponent(translated)}&api_key=${KEY}&pageSize=10&dataType=Foundation,SR%20Legacy`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`USDA error: ${res.status}`)

  const data    = await res.json()
  const results = (data.foods ?? []).map((f) => mapFood(f, query))
  setCache(query, results)
  return results
}

// --- Cache locale (7 giorni, max 100 voci) ---
const CACHE_KEY = 'fittracker_usda_cache'

function getCache(query) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
    const entry = cache[query.toLowerCase()]
    if (!entry) return null
    if (Date.now() - entry.ts > 7 * 24 * 60 * 60 * 1000) return null
    return entry.data
  } catch {
    return null
  }
}

function setCache(query, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
    const keys  = Object.keys(cache)
    if (keys.length >= 100) delete cache[keys[0]]
    cache[query.toLowerCase()] = { ts: Date.now(), data }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch { /* storage pieno */ }
}
