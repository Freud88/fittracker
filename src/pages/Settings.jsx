import { useState, useEffect } from 'react'
import { Save, Download, Upload, Trash2, Ban, Plus, ChevronLeft, LogOut, Calculator } from 'lucide-react'
import { supabase, isSupabaseReady } from '../services/supabase'
import { forceSyncToCloud } from '../utils/syncStorage'
import { useConfigStore } from '../stores/configStore'
import { useFoodStore } from '../stores/foodStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { useMealPlanStore } from '../stores/mealPlanStore'
import Header from '../components/layout/Header'
import TargetEditor from '../components/settings/TargetEditor'
import AddCustomMealModal from '../components/plan/AddCustomMealModal'

const catLabels = { breakfast: 'Colazione', lunch: 'Pranzo', snack: 'Spuntino', dinner: 'Cena' }

export default function Settings({ session, onNavigate }) {
  const { targets, userInfo, updateTargets, updateUserInfo } = useConfigStore()
  const { foodLog } = useFoodStore()
  const { workouts } = useWorkoutStore()
  const { mealLibrary, bannedMeals, plan, generatePlan, unbanMeal, removeCustomMeal, addCustomMeal } = useMealPlanStore()
  const [localTargets, setLocalTargets] = useState({ ...targets })
  const [localUser, setLocalUser] = useState({ ...userInfo })

  // Sync local state when store rehydrates from cloud
  useEffect(() => { setLocalTargets({ ...targets }) }, [JSON.stringify(targets)])
  useEffect(() => { setLocalUser({ ...userInfo }) }, [JSON.stringify(userInfo)])
  const [saved, setSaved] = useState(false)
  const [showAddMeal, setShowAddMeal] = useState(false)

  const bannedItems  = mealLibrary.filter((m) => bannedMeals.includes(m.id))
  const customMeals  = mealLibrary.filter((m) => m.custom)

  function handleEstimateTargets() {
    const { weight, height, age, sex, activityLevel } = localUser
    if (!weight || !height || !age) return
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }
    const sexOffset = (sex || 'male') === 'male' ? 5 : -161
    const bmr = 10 * weight + 6.25 * height - 5 * age + sexOffset
    const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.55))
    const protein = Math.round(weight * 2)
    const fat = Math.round(tdee * 0.25 / 9)
    const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4)
    setLocalTargets({ calories: tdee, protein, carbs, fat })
  }

  function handleSave() {
    updateTargets(localTargets)
    updateUserInfo(localUser)
    if (plan) generatePlan(localTargets)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExport() {
    const data = { config: { targets, userInfo }, foodLog, workouts, exportDate: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `fittracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    const input    = document.createElement('input')
    input.type     = 'file'
    input.accept   = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          if (data.config?.targets)  updateTargets(data.config.targets)
          if (data.config?.userInfo) updateUserInfo(data.config.userInfo)
          alert('Import completato!')
        } catch { alert('File non valido') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function handleClearAll() {
    if (confirm('Eliminare tutti i dati? Questa azione non è reversibile.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div>
      <Header currentPage="settings" onNavigate={onNavigate} />
      <div className="px-4 space-y-6 pb-8">

        {/* User info */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Dati personali</p>
          <div className="space-y-2">
            {[
              { key: 'name',   label: 'Nome',           type: 'text' },
              { key: 'weight', label: 'Peso (kg)',       type: 'number' },
              { key: 'height', label: 'Altezza (cm)',    type: 'number' },
              { key: 'age',    label: 'Età',             type: 'number' },
            ].map(({ key, label, type }) => (
              <div key={key} className="bg-surface2 rounded-xl px-4 py-3 flex justify-between items-center">
                <label className="text-text-muted text-sm">{label}</label>
                <input
                  type={type}
                  value={localUser[key]}
                  onChange={(e) => setLocalUser({
                    ...localUser,
                    [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                  })}
                  className="bg-transparent text-text text-right w-24 outline-none font-medium"
                />
              </div>
            ))}
            <div className="bg-surface2 rounded-xl px-4 py-3 flex justify-between items-center">
              <label className="text-text-muted text-sm">Sesso</label>
              <select
                value={localUser.sex || 'male'}
                onChange={(e) => setLocalUser({ ...localUser, sex: e.target.value })}
                className="bg-transparent text-text text-right outline-none font-medium"
              >
                <option value="male">Maschio</option>
                <option value="female">Femmina</option>
              </select>
            </div>
            <div className="bg-surface2 rounded-xl px-4 py-3 flex justify-between items-center">
              <label className="text-text-muted text-sm">Attività fisica</label>
              <select
                value={localUser.activityLevel || 'moderate'}
                onChange={(e) => setLocalUser({ ...localUser, activityLevel: e.target.value })}
                className="bg-transparent text-text text-right outline-none font-medium"
              >
                <option value="sedentary">Sedentario</option>
                <option value="light">Leggero</option>
                <option value="moderate">Moderato</option>
                <option value="active">Attivo</option>
                <option value="very_active">Molto attivo</option>
              </select>
            </div>
            <button
              onClick={handleEstimateTargets}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface2 text-text-muted text-sm border border-border active:bg-surface"
            >
              <Calculator size={15} className="text-accent-blue" />
              Stima target dai dati biometrici
            </button>
          </div>
        </div>

        {/* Targets */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Target giornalieri</p>
          <TargetEditor targets={localTargets} onChange={setLocalTargets} />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${
            saved ? 'bg-accent-green text-white' : 'bg-accent-blue text-white'
          }`}
        >
          <Save size={18} />
          {saved ? 'Salvato!' : 'Salva modifiche'}
        </button>

        {/* I miei pasti */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-text-muted text-xs uppercase tracking-wider">I miei pasti custom</p>
            <button
              onClick={() => setShowAddMeal(true)}
              className="flex items-center gap-1 text-accent-blue text-xs"
            >
              <Plus size={13} /> Aggiungi
            </button>
          </div>

          {customMeals.length === 0 ? (
            <p className="text-text-dim text-sm text-center py-3">Nessun pasto personalizzato</p>
          ) : (
            <div className="space-y-2">
              {customMeals.map((m) => (
                <div key={m.id} className="bg-surface2 rounded-xl px-3 py-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-text text-sm">{m.name}</p>
                    <p className="text-text-dim text-xs">{catLabels[m.category]} · {m.calories}kcal P{m.protein}g</p>
                  </div>
                  <button onClick={() => removeCustomMeal(m.id)} className="text-text-dim p-1.5">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pasti bannati */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-3">
            Pasti nascosti ({bannedItems.length})
          </p>

          {bannedItems.length === 0 ? (
            <p className="text-text-dim text-sm text-center py-3">Nessun pasto nascosto</p>
          ) : (
            <div className="space-y-2">
              {bannedItems.map((m) => (
                <div key={m.id} className="bg-surface2 rounded-xl px-3 py-2.5 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Ban size={12} className="text-accent-red" />
                      <p className="text-text text-sm">{m.name}</p>
                    </div>
                    <p className="text-text-dim text-xs ml-5">{catLabels[m.category]} · {m.calories}kcal</p>
                  </div>
                  <button
                    onClick={() => unbanMeal(m.id)}
                    className="text-accent-blue text-xs px-3 py-1.5 rounded-lg bg-accent-blue/10 active:bg-accent-blue/20"
                  >
                    Ripristina
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data management */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Gestione dati</p>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-text text-sm"
            >
              <Download size={18} className="text-accent-blue" />
              Esporta dati (JSON)
            </button>
            <button
              onClick={handleImport}
              className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-text text-sm"
            >
              <Upload size={18} className="text-accent-gold" />
              Importa backup
            </button>
            <button
              onClick={handleClearAll}
              className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-accent-red text-sm"
            >
              <Trash2 size={18} />
              Cancella tutti i dati
            </button>
          </div>
        </div>

        {/* Account */}
        {isSupabaseReady() && session && (
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Account</p>
            <div className="bg-surface2 rounded-xl px-4 py-3 flex justify-between items-center mb-2">
              <div>
                <p className="text-text text-sm font-medium">{session.user.user_metadata?.name || 'Utente'}</p>
                <p className="text-text-dim text-xs">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                // Prima salva tutto su Supabase, poi pulisci localStorage
                await forceSyncToCloud()
                ;['fittracker_config','fittracker_food_log','fittracker_workouts','fittracker_meal_plan','fittracker_measurements']
                  .forEach(k => localStorage.removeItem(k))
                await supabase.auth.signOut()
                window.location.reload()
              }}
              className="w-full flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3 text-accent-red text-sm"
            >
              <LogOut size={18} />
              Esci dall'account
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-text-dim text-xs">FitTracker Personal v1.0</p>
        </div>
      </div>

      {showAddMeal && (
        <AddCustomMealModal onAdd={addCustomMeal} onClose={() => setShowAddMeal(false)} />
      )}
    </div>
  )
}
