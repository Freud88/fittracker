// Library pasti pianificabili — porzioni calibrate per target 2500 kcal/giorno
// Colazione ~500 kcal | Pranzo ~875 kcal | Spuntino ~250 kcal | Cena ~875 kcal
export const MEAL_LIBRARY_SEED = [

  // ── COLAZIONE ──────────────────────────────────────────────────────────────
  {
    id: 'm01',
    name: 'Uova strapazzate + pane integrale + pomodori',
    category: 'breakfast',
    ingredients: [
      { name: 'Uovo intero',      grams: 150 }, // 3 uova
      { name: 'Pane integrale',   grams: 80  },
      { name: 'Burro',            grams: 10  },
      { name: 'Pomodori',         grams: 100 },
    ],
    calories: 505, protein: 27, carbs: 46, fat: 25,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm02',
    name: 'Yogurt greco + avena + banana + mandorle',
    category: 'breakfast',
    ingredients: [
      { name: 'Yogurt greco 0%',     grams: 200 },
      { name: 'Fiocchi d\'avena',    grams: 50  },
      { name: 'Banana',              grams: 100 },
      { name: 'Mandorle',            grams: 15  },
      { name: 'Miele',               grams: 10  },
    ],
    calories: 510, protein: 30, carbs: 71, fat: 12,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm03',
    name: 'Pancakes d\'avena + frutti di bosco + miele',
    category: 'breakfast',
    ingredients: [
      { name: 'Uovo intero',         grams: 100 }, // 2 uova
      { name: 'Fiocchi d\'avena',    grams: 80  },
      { name: 'Frutti di bosco',     grams: 100 },
      { name: 'Miele',               grams: 10  },
    ],
    calories: 515, protein: 24, carbs: 73, fat: 15,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },

  // ── PRANZO ─────────────────────────────────────────────────────────────────
  {
    id: 'm04',
    name: 'Pollo al forno + riso integrale + verdure + pane',
    category: 'lunch',
    ingredients: [
      { name: 'Petto di pollo',      grams: 180 },
      { name: 'Riso integrale cotto',grams: 150 },
      { name: 'Verdure grigliate',   grams: 200 },
      { name: 'Olio EVO',            grams: 25  },
      { name: 'Pane integrale',      grams: 80  },
    ],
    calories: 860, protein: 56, carbs: 91, fat: 30,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm05',
    name: 'Pasta integrale al tonno + pomodori + olio + pane',
    category: 'lunch',
    ingredients: [
      { name: 'Pasta integrale (secca)',  grams: 80  },
      { name: 'Tonno al naturale',        grams: 150 },
      { name: 'Pomodori freschi',         grams: 200 },
      { name: 'Olio EVO',                 grams: 20  },
      { name: 'Pane integrale',           grams: 80  },
    ],
    calories: 875, protein: 57, carbs: 105, fat: 26,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm06',
    name: 'Salmone + patate + broccoli + olio + pane',
    category: 'lunch',
    ingredients: [
      { name: 'Salmone',            grams: 160 },
      { name: 'Patate',             grams: 200 },
      { name: 'Broccoli',           grams: 150 },
      { name: 'Olio EVO',           grams: 15  },
      { name: 'Pane integrale',     grams: 80  },
    ],
    calories: 865, protein: 49, carbs: 87, fat: 37,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm07',
    name: 'Pollo + quinoa + avocado + insalata + pane',
    category: 'lunch',
    ingredients: [
      { name: 'Petto di pollo',     grams: 180 },
      { name: 'Quinoa cotta',       grams: 150 },
      { name: 'Avocado',            grams: 80  },
      { name: 'Insalata mista',     grams: 200 },
      { name: 'Olio EVO',           grams: 15  },
      { name: 'Pane integrale',     grams: 60  },
    ],
    calories: 830, protein: 58, carbs: 75, fat: 33,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },

  // ── SPUNTINO ───────────────────────────────────────────────────────────────
  {
    id: 'm08',
    name: 'Shake proteico + banana',
    category: 'snack',
    ingredients: [
      { name: 'Whey protein (scoop)', grams: 30  },
      { name: 'Banana',               grams: 130 },
    ],
    calories: 255, protein: 25, carbs: 33, fat: 2,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm09',
    name: 'Yogurt greco + fragole + granola',
    category: 'snack',
    ingredients: [
      { name: 'Yogurt greco 0%', grams: 200 },
      { name: 'Fragole',         grams: 100 },
      { name: 'Granola',         grams: 25  },
    ],
    calories: 250, protein: 23, carbs: 30, fat: 4,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm10',
    name: 'Ricotta + mandorle + miele',
    category: 'snack',
    ingredients: [
      { name: 'Ricotta',   grams: 150 },
      { name: 'Mandorle',  grams: 10  },
      { name: 'Miele',     grams: 5   },
    ],
    calories: 270, protein: 12, carbs: 9, fat: 20,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },

  // ── CENA ───────────────────────────────────────────────────────────────────
  {
    id: 'm11',
    name: 'Pollo + zucchine + riso + olio + pane',
    category: 'dinner',
    ingredients: [
      { name: 'Petto di pollo',      grams: 180 },
      { name: 'Zucchine',            grams: 200 },
      { name: 'Riso basmati cotto',  grams: 150 },
      { name: 'Olio EVO',            grams: 25  },
      { name: 'Pane integrale',      grams: 80  },
    ],
    calories: 850, protein: 55, carbs: 90, fat: 29,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm12',
    name: 'Uova + spinaci + patate + olio + pane',
    category: 'dinner',
    ingredients: [
      { name: 'Uovo intero',      grams: 150 }, // 3 uova
      { name: 'Spinaci freschi',  grams: 200 },
      { name: 'Patate',           grams: 200 },
      { name: 'Olio EVO',         grams: 20  },
      { name: 'Pane integrale',   grams: 80  },
    ],
    calories: 800, protein: 36, carbs: 84, fat: 38,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm13',
    name: 'Tonno + pasta + pomodori + olio + capperi',
    category: 'dinner',
    ingredients: [
      { name: 'Tonno al naturale',       grams: 150 },
      { name: 'Pasta integrale (secca)', grams: 80  },
      { name: 'Pomodori freschi',        grams: 150 },
      { name: 'Olio EVO',                grams: 20  },
      { name: 'Pane integrale',          grams: 60  },
    ],
    calories: 815, protein: 54, carbs: 93, fat: 25,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm14',
    name: 'Salmone + broccoli + riso + olio + pane',
    category: 'dinner',
    ingredients: [
      { name: 'Salmone',            grams: 130 },
      { name: 'Broccoli',           grams: 250 },
      { name: 'Riso integrale cotto', grams: 100 },
      { name: 'Olio EVO',           grams: 20  },
      { name: 'Pane integrale',     grams: 80  },
    ],
    calories: 855, protein: 38, carbs: 72, fat: 30,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm15',
    name: 'Tacchino + zucchine + riso + olio + pane',
    category: 'dinner',
    ingredients: [
      { name: 'Fesa di tacchino',    grams: 200 },
      { name: 'Zucchine',            grams: 150 },
      { name: 'Riso integrale cotto',grams: 150 },
      { name: 'Olio EVO',            grams: 25  },
      { name: 'Pane integrale',      grams: 80  },
    ],
    calories: 830, protein: 56, carbs: 86, fat: 24,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
]
