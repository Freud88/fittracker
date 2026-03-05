import { useState, useEffect, useRef } from 'react'
import { searchFoods } from '../services/usda'
import { SEED_FOODS } from '../data/foodDatabase'

export function useFoodSearch(query, debounceMs = 400) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchFoods(query)
        setResults(data)
        setOffline(false)
      } catch {
        // Fallback: filtra il seed locale
        const lower = query.toLowerCase()
        setResults(SEED_FOODS.filter((f) => f.name.toLowerCase().includes(lower)))
        setOffline(true)
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer.current)
  }, [query, debounceMs])

  return { results, loading, offline }
}
