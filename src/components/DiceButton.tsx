"use client";

import { useState } from "react";

export default function DiceButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [results, setResults] = useState<number[]>([]);
  const [total, setTotal] = useState(0);

  const dice = [4, 6, 8, 10, 12, 20, 100];

  const addDie = (sides: number) => {
    setSelected(prev => [...prev, sides]);
  };

  const rollDice = () => {
    const rolls = selected.map(sides => Math.floor(Math.random() * sides) + 1);
    const sum = rolls.reduce((a, b) => a + b, 0);
    setResults(rolls);
    setTotal(sum);
  };

  const clear = () => {
    setSelected([]);
    setResults([]);
    setTotal(0);
  };

  return (
    <>
      {/* Кнопка d20 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-amber-600 hover:bg-amber-500 text-black font-bold w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        {open ? "✕" : "d20"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
          <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-amber-400">Бросок кубиков</h3>
              <div className="flex gap-2">
                <button onClick={clear} className="text-amber-400 hover:text-amber-200 text-sm px-3 py-1 rounded bg-stone-700">
                  Очистить
                </button>
                <button onClick={() => setOpen(false)} className="text-3xl">×</button>
              </div>
            </div>

            {/* Кнопки кубиков */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {dice.map(sides => {
                const count = selected.filter(s => s === sides).length;
                return (
                  <button
                    key={sides}
                    onClick={() => addDie(sides)}
                    className="bg-stone-700 hover:bg-stone-600 p-4 rounded-xl font-bold text-amber-100 border-2 border-transparent hover:border-amber-500 transition-all flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">d{sides}</span>
                    <span className="text-sm bg-amber-600 px-2 py-1 rounded-full text-black">
                      {count}x
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Выбранные кубики */}
            {selected.length > 0 && (
              <div className="mb-6 p-4 bg-stone-700 rounded-xl">
                <p className="text-amber-300 text-lg mb-2">Выбрано: {selected.length}</p>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(selected)].map(sides => {
                    const count = selected.filter(s => s === sides).length;
                    return (
                      <span key={sides} className="bg-amber-500 text-black px-3 py-1 rounded-lg font-bold">
                        d{sides} ×{count}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Кнопка бросить */}
            {selected.length > 0 && (
              <button
                onClick={rollDice}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-black font-bold p-6 rounded-xl mb-6 text-xl shadow-xl"
              >
                🎲 Бросить! ({selected.map(s => `d${s}`).join(" + ")})
              </button>
            )}

            {/* Результат */}
            {results.length > 0 && (
              <div className="text-center p-8 bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl border-4 border-green-500">
                <h3 className="text-amber-300 mb-4 text-xl">Результат:</h3>
                <div className="text-7xl font-black text-green-400 mb-4">{total}</div>
                <div className="text-sm text-amber-200 space-y-1">
                  {results.map((roll, i) => (
                    <div key={i}>Кубик {i + 1}: {roll}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}