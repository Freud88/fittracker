// Database alimenti — valori per 100g
// SEED_FOODS è usato come fallback offline dalla hook useFoodSearch
export const SEED_FOODS = [
  { id: 'food-001', name: 'Petto di pollo', per100g: { calories: 110, protein: 21, carbs: 0, fat: 2.5 }, custom: false },
  { id: 'food-002', name: 'Tacchino (fesa)', per100g: { calories: 109, protein: 22, carbs: 0, fat: 2 }, custom: false },
  { id: 'food-003', name: 'Uovo intero', per100g: { calories: 143, protein: 13, carbs: 0.7, fat: 10 }, custom: false },
  { id: 'food-004', name: 'Latte intero', per100g: { calories: 64, protein: 3.3, carbs: 4.8, fat: 3.5 }, custom: false },
  { id: 'food-005', name: 'Latte scremato', per100g: { calories: 35, protein: 3.5, carbs: 5, fat: 0.1 }, custom: false },
  { id: 'food-006', name: 'Riso bianco cotto', per100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }, custom: false },
  { id: 'food-007', name: 'Riso integrale cotto', per100g: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 }, custom: false },
  { id: 'food-008', name: 'Pasta cotta', per100g: { calories: 131, protein: 5, carbs: 25, fat: 1.1 }, custom: false },
  { id: 'food-009', name: 'Pasta integrale cotta', per100g: { calories: 124, protein: 5.3, carbs: 23.2, fat: 1.2 }, custom: false },
  { id: 'food-010', name: 'Pane bianco', per100g: { calories: 265, protein: 9, carbs: 49, fat: 3.2 }, custom: false },
  { id: 'food-011', name: 'Pane integrale', per100g: { calories: 247, protein: 9, carbs: 44, fat: 3.5 }, custom: false },
  { id: 'food-012', name: 'Farro soffiato', per100g: { calories: 340, protein: 13, carbs: 67, fat: 2.5 }, custom: false },
  { id: 'food-013', name: 'Orzo soffiato', per100g: { calories: 355, protein: 10, carbs: 75, fat: 2 }, custom: false },
  { id: 'food-014', name: 'Olio EVO', per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 }, custom: false },
  { id: 'food-015', name: 'Burro di mandorle', per100g: { calories: 614, protein: 21, carbs: 20, fat: 53 }, custom: false },
  { id: 'food-016', name: 'Banana', per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 }, custom: false },
  { id: 'food-017', name: 'Mela', per100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 }, custom: false },
  { id: 'food-018', name: 'Arancia', per100g: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 }, custom: false },
  { id: 'food-019', name: 'Spinaci', per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }, custom: false },
  { id: 'food-020', name: 'Zucchine', per100g: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 }, custom: false },
  { id: 'food-021', name: 'Pomodori', per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 }, custom: false },
  { id: 'food-022', name: 'Insalata mista', per100g: { calories: 15, protein: 1.3, carbs: 2.5, fat: 0.2 }, custom: false },
  { id: 'food-023', name: 'Broccoli', per100g: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 }, custom: false },
  { id: 'food-024', name: 'Salmone', per100g: { calories: 208, protein: 20, carbs: 0, fat: 13 }, custom: false },
  { id: 'food-025', name: 'Tonno al naturale', per100g: { calories: 116, protein: 26, carbs: 0, fat: 1 }, custom: false },
  { id: 'food-026', name: 'Whey protein (scoop 30g)', per100g: { calories: 400, protein: 80, carbs: 10, fat: 6.7 }, custom: false },
  { id: 'food-027', name: 'Ricotta', per100g: { calories: 174, protein: 11, carbs: 3.5, fat: 13 }, custom: false },
  { id: 'food-028', name: 'Yogurt greco 0%', per100g: { calories: 57, protein: 10, carbs: 4, fat: 0.4 }, custom: false },
  { id: 'food-029', name: 'Avena', per100g: { calories: 389, protein: 17, carbs: 66, fat: 7 }, custom: false },
  { id: 'food-030', name: 'Mandorle', per100g: { calories: 579, protein: 21, carbs: 22, fat: 50 }, custom: false },
  { id: 'food-031', name: 'Mozzarella', per100g: { calories: 254, protein: 18, carbs: 2.2, fat: 20 }, custom: false },
  { id: 'food-032', name: 'Parmigiano', per100g: { calories: 392, protein: 33, carbs: 0, fat: 28 }, custom: false },
]

// Alias per compatibilità con i vecchi store (foodStore inizializza con questo)
export const foodDatabase = SEED_FOODS
