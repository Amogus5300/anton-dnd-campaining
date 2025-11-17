'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

export default function DiceButton() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [result, setResult] = useState<number | null>(null)

  // Добавили d100!
  const dice = [4, 6, 8, 10, 12, 20, 100]

  const roll = () => {
    const rolls = selected.map(d => Math.floor(Math.random() * d) + 1)
    const sum = rolls.reduce((a, b) => a + b, 0)
    setResult(sum)
  }

  const clearSelection = () => {
    setSelected([])
    setResult(null)
  }

  return (
    <>
      {/* Фиксированная кнопка d20 внизу */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-amber-600 hover:bg-amber-500 text-black font-bold w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        {open ? (
          <X size={32} />
        ) : (
          <span className="text-2xl">d20</span> 
        )}
      </button>

      {/* Модальное меню кубиков */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
          <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-amber-400">Бросок кубиков</h3>
              <div className="flex gap-2">
                <button 
                  onClick={clearSelection}
                  className="text-amber-400 hover:text-amber-200 text-sm px-2 py-1 rounded bg-stone-700"
                >
                  Очистить
                </button>
                <button onClick={() => setOpen(false)} className="text-2xl">×</button>
              </div>
            </div>

            {/* Кнопки кубиков — 7 штук! */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {dice.map(d => (
                <button
                  key={d}
                  onClick={() => setSelected(prev => [...prev, d])}
                  className="bg-stone-700 hover:bg-stone-600 p-4 rounded-lg font-bold text-amber-100 border-2 border-transparent hover:border-amber-500 transition-all flex flex-col items-center"
                >
                  <span className="text-2xl mb-1">d{d}</span>
                  <span className="text-sm bg-amber-600 px-2 py-1 rounded-full text-black">
                    {selected.filter(x => x === d).length || 0}x
                  </span>
                </button>
              ))}
            </div>

            {/* Выбранные кубики */}
            {selected.length > 0 && (
              <div className="mb-4 p-3 bg-stone-700 rounded-lg">
                <p className="text-amber-300 text-sm mb-2">Выбрано: {selected.length} кубиков</p>
                <div className="flex flex-wrap gap-1">
                  {[...new Set(selected)].map(d => 
                    <span key={d} className="bg-amber-500 text-black px-2 py-1 rounded text-xs font-bold">
                      d{d} x{selected.filter(x => x === d).length}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Кнопка бросить */}
            {selected.length > 0 && (
              <button
                onClick={roll}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-bold p-4 rounded-lg mb-4 text-lg shadow-lg"
              >
                🎲 Бросить! ({selected.map(d => `d${d}`).join(' + ')})
              </button>
            )}

            {/* Результат */}
            {result !== null && (
              <div className="text-center p-6 bg-gradient-to-r from-green-900 to-emerald-900 rounded-xl border-2 border-green-500">
                <h4 className="text-amber-300 mb-2">Результат броска:</h4>
                <div className="text-4xl font-bold text-green-400 mb-3">{result}</div>
                <details className="text-sm text-amber-200">
                  <summary>Подробно</summary>
                  <ul className="mt-2 text-left text-xs">
                    {selected.map((d, i) => (
                      <li key={i}>d{d}: {Math.floor(Math.random() * d) + 1}</li> // Показываем breakdown
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}