import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2, WifiOff } from 'lucide-react'
import { useFoodSearch } from '../../hooks/useFoodSearch'

export default function FoodSearch({ onSelect, autoFocus = false }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const { results, loading, offline } = useFoodSearch(query)

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-surface2 rounded-xl px-3 py-2 border border-border">
        {loading
          ? <Loader2 size={16} className="text-text-muted shrink-0 animate-spin" />
          : <Search size={16} className="text-text-muted shrink-0" />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca alimento (es. pollo, riso, uova…)"
          className="flex-1 bg-transparent text-text placeholder:text-text-dim text-sm outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')}>
            <X size={16} className="text-text-muted" />
          </button>
        )}
      </div>

      {offline && query.length >= 2 && (
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <WifiOff size={12} className="text-accent-gold" />
          <span className="text-accent-gold text-[10px]">Offline — database locale</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-surface2 border border-border rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto">
          {results.map((food) => (
            <button
              key={food.id ?? food.fdcId}
              onClick={() => { onSelect(food); setQuery('') }}
              className="w-full flex justify-between items-center px-3 py-2.5 text-left active:bg-border transition-colors border-b border-border last:border-0"
            >
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-text text-sm truncate">{food.name}</p>
                {food.source === 'usda' && (
                  <span className="text-[10px] text-accent-blue">USDA</span>
                )}
                {food.custom && (
                  <span className="text-[10px] text-accent-gold">custom</span>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-text-muted text-xs">{food.per100g.calories} kcal</p>
                <p className="text-text-dim text-[10px]">
                  P{food.per100g.protein} C{food.per100g.carbs} G{food.per100g.fat}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
