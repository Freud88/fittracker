// Template allenamento pre-caricato — Full Body (Lun/Mer/Ven)
export const workoutTemplates = [
  {
    id: 'template-fullbody',
    name: 'Full Body',
    description: 'Lun / Mer / Ven',
    exercises: [
      // BLOCCO 1 — PETTO
      { name: 'Chest Press (macchina)', block: 'Petto', defaultSets: 3, defaultReps: 10, lastWeight: 77 },
      { name: 'Pectoral Fly (macchina)', block: 'Petto', defaultSets: 3, defaultReps: 10, lastWeight: 90 },
      // BLOCCO 2 — SCHIENA
      { name: 'Lat Machine presa stretta', block: 'Schiena', defaultSets: 3, defaultReps: 10, lastWeight: 70 },
      { name: 'Low Row ai cavi', block: 'Schiena', defaultSets: 3, defaultReps: 10, lastWeight: 55 },
      { name: 'Face Pull ai cavi', block: 'Schiena', defaultSets: 3, defaultReps: 15, lastWeight: 22 },
      // BLOCCO 3 — GAMBE/GLUTEI
      { name: 'Hip Thrust (macchina)', block: 'Gambe/Glutei', defaultSets: 3, defaultReps: 10, lastWeight: 110 },
      { name: 'Stacco Rumeno', block: 'Gambe/Glutei', defaultSets: 3, defaultReps: 10, lastWeight: 30 },
      { name: 'Leg Curl (macchina)', block: 'Gambe/Glutei', defaultSets: 3, defaultReps: 12, lastWeight: 40 },
      { name: 'Polpacci (macchina)', block: 'Gambe/Glutei', defaultSets: 3, defaultReps: 10, lastWeight: 120 },
      // BLOCCO 4 — SPALLE/BRACCIA
      { name: 'Lateral Raise', block: 'Spalle/Braccia', defaultSets: 3, defaultReps: 15, lastWeight: 8 },
      { name: 'Curl bilanciere', block: 'Spalle/Braccia', defaultSets: 3, defaultReps: 10, lastWeight: 30 },
      { name: 'Pushdown cavi', block: 'Spalle/Braccia', defaultSets: 3, defaultReps: 10, lastWeight: 36 },
      // BLOCCO 5 — CORE
      { name: 'Crunch declinato', block: 'Core', defaultSets: 3, defaultReps: 25, lastWeight: 0 },
      { name: 'Lanci palla medica', block: 'Core', defaultSets: 3, defaultReps: 20, lastWeight: 6 },
      { name: 'Plank', block: 'Core', defaultSets: 3, defaultReps: 45, lastWeight: 0, unit: 'sec' },
      // FINISHER
      { name: 'Incline Walking', block: 'Finisher', defaultSets: 1, defaultReps: 15, lastWeight: 0, unit: 'min', notes: '15% inclinazione, 6 km/h' },
    ]
  }
]
