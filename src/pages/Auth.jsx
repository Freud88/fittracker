import { useState } from 'react'
import { supabase } from '../services/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) throw error
        setInfo('Controlla la tua email per confermare la registrazione.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // App.jsx reagisce automaticamente all'evento onAuthStateChange
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Logo / Titolo */}
        <div className="text-center mb-10">
          <h1 className="font-title text-5xl text-text tracking-widest">FITTRACKER</h1>
          <p className="text-text-muted text-sm mt-1">Il tuo allenamento, ogni giorno.</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl p-6 space-y-4">
          <h2 className="text-text font-bold text-lg">
            {mode === 'login' ? 'Accedi' : 'Crea account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-text-muted text-xs uppercase tracking-wider">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Il tuo nome"
                  required
                  className="w-full mt-1 bg-surface2 rounded-xl px-4 py-3 text-text placeholder-text-dim outline-none text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@esempio.com"
                required
                className="w-full mt-1 bg-surface2 rounded-xl px-4 py-3 text-text placeholder-text-dim outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caratteri"
                required
                minLength={6}
                className="w-full mt-1 bg-surface2 rounded-xl px-4 py-3 text-text placeholder-text-dim outline-none text-sm"
              />
            </div>

            {error && (
              <p className="text-accent-red text-sm bg-accent-red/10 rounded-xl px-4 py-3">{error}</p>
            )}
            {info && (
              <p className="text-accent-green text-sm bg-accent-green/10 rounded-xl px-4 py-3">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent-blue text-white font-bold rounded-xl text-base disabled:opacity-50 mt-2"
            >
              {loading ? 'Caricamento...' : mode === 'login' ? 'Accedi' : 'Registrati'}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-text-muted text-sm mt-6">
          {mode === 'login' ? 'Non hai un account?' : 'Hai già un account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null) }}
            className="text-accent-blue font-medium"
          >
            {mode === 'login' ? 'Registrati' : 'Accedi'}
          </button>
        </p>
      </div>
    </div>
  )
}
