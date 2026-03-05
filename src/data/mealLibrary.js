// Library pasti pianificabili — seed built-in (PRD Addendum sez.2.2)
export const MEAL_LIBRARY_SEED = [
  // COLAZIONE
  {
    id: 'm01',
    name: 'Uova strapazzate + pane integrale',
    category: 'breakfast',
    ingredients: [
      { name: 'Uovo intero', grams: 150 },
      { name: 'Pane integrale', grams: 60 },
    ],
    calories: 420, protein: 24, carbs: 38, fat: 18,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm02',
    name: 'Yogurt greco + banana + noci',
    category: 'breakfast',
    ingredients: [
      { name: 'Yogurt greco 0%', grams: 200 },
      { name: 'Banana', grams: 100 },
      { name: 'Mandorle', grams: 20 },
    ],
    calories: 340, protein: 22, carbs: 38, fat: 10,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm03',
    name: 'Latte + orzo/farro soffiato',
    category: 'breakfast',
    ingredients: [
      { name: 'Latte intero', grams: 300 },
      { name: 'Orzo soffiato', grams: 50 },
    ],
    calories: 320, protein: 18, carbs: 48, fat: 6,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  // PRANZO
  {
    id: 'm04',
    name: 'Pollo + riso integrale',
    category: 'lunch',
    ingredients: [
      { name: 'Petto di pollo', grams: 300 },
      { name: 'Riso integrale cotto', grams: 150 },
      { name: 'Olio EVO', grams: 10 },
    ],
    calories: 520, protein: 68, carbs: 34, fat: 13,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm05',
    name: 'Pasta integrale + tonno + pomodori',
    category: 'lunch',
    ingredients: [
      { name: 'Pasta integrale cotta', grams: 200 },
      { name: 'Tonno al naturale', grams: 150 },
      { name: 'Pomodori', grams: 100 },
    ],
    calories: 490, protein: 42, carbs: 58, fat: 8,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm06',
    name: 'Salmone + patate al forno',
    category: 'lunch',
    ingredients: [
      { name: 'Salmone', grams: 200 },
      { name: 'Pane bianco', grams: 80 },
    ],
    calories: 510, protein: 44, carbs: 38, fat: 16,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm07',
    name: 'Insalata di pollo + verdure + pane',
    category: 'lunch',
    ingredients: [
      { name: 'Petto di pollo', grams: 250 },
      { name: 'Insalata mista', grams: 100 },
      { name: 'Pane integrale', grams: 60 },
    ],
    calories: 440, protein: 52, carbs: 28, fat: 12,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  // SPUNTINO
  {
    id: 'm08',
    name: 'Shake proteico + banana',
    category: 'snack',
    ingredients: [
      { name: 'Whey protein (scoop 30g)', grams: 30 },
      { name: 'Banana', grams: 120 },
    ],
    calories: 218, protein: 26, carbs: 28, fat: 2,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm09',
    name: 'Yogurt greco + frutta',
    category: 'snack',
    ingredients: [
      { name: 'Yogurt greco 0%', grams: 200 },
      { name: 'Mela', grams: 150 },
    ],
    calories: 190, protein: 20, carbs: 24, fat: 1,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm10',
    name: 'Ricotta + frutta secca',
    category: 'snack',
    ingredients: [
      { name: 'Ricotta', grams: 150 },
      { name: 'Mandorle', grams: 20 },
    ],
    calories: 260, protein: 18, carbs: 14, fat: 14,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  // CENA
  {
    id: 'm11',
    name: 'Pollo + verdure grigliate',
    category: 'dinner',
    ingredients: [
      { name: 'Petto di pollo', grams: 250 },
      { name: 'Zucchine', grams: 200 },
      { name: 'Olio EVO', grams: 10 },
    ],
    calories: 380, protein: 58, carbs: 16, fat: 10,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm12',
    name: 'Uova + spinaci saltati',
    category: 'dinner',
    ingredients: [
      { name: 'Uovo intero', grams: 200 },
      { name: 'Spinaci', grams: 200 },
      { name: 'Olio EVO', grams: 10 },
    ],
    calories: 340, protein: 30, carbs: 8, fat: 20,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm13',
    name: 'Tonno + insalata + pane',
    category: 'dinner',
    ingredients: [
      { name: 'Tonno al naturale', grams: 150 },
      { name: 'Insalata mista', grams: 100 },
      { name: 'Pane integrale', grams: 60 },
    ],
    calories: 360, protein: 44, carbs: 28, fat: 8,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm14',
    name: 'Salmone + broccoli al vapore',
    category: 'dinner',
    ingredients: [
      { name: 'Salmone', grams: 200 },
      { name: 'Broccoli', grams: 250 },
    ],
    calories: 420, protein: 46, carbs: 12, fat: 22,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
  {
    id: 'm15',
    name: 'Tacchino + zucchine + riso',
    category: 'dinner',
    ingredients: [
      { name: 'Tacchino (fesa)', grams: 250 },
      { name: 'Zucchine', grams: 150 },
      { name: 'Riso bianco cotto', grams: 100 },
    ],
    calories: 480, protein: 52, carbs: 36, fat: 10,
    banned: false, timesServed: 0, lastServed: null, custom: false,
  },
]
