"use client";

import { useState } from "react";

interface DiceButtonProps {
  size?: "normal" | "large";
  className?: string;
}

export default function DiceButton({ 
  size = "normal", 
  className = "" 
}: DiceButtonProps) {
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

  // Размеры кнопки
  const buttonSize = size === "large" 
    ? "w-24 h-24 text-5xl" 
    : "w-16 h-16 text-3xl";

  return (
    <>
      {/* Главная кнопка d20 */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 bg-amber-600 hover:bg-amber-500 text-black font-bold 
                   rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 
                   hover:scale-110 active:scale-95 ${buttonSize} ${className}`}
      >
        {open ? "Close" : "d20"}
      </button>

      {/* Модальное окно */}
      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-6"
             onClick={() => setOpen(false)}>
          <div className="bg-stone-900 border-4 border-amber-600 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
               onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-black text-amber-400">Бросок кубов</h3>
              <button onClick={() => setOpen(false)} className="text-5xl hover:text-amber-300">×</button>
            </div>

            {/* Выбор кубиков */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {dice.map(sides => {
                const count = selected.filter(s => s === sides).length;
                return (
                  <button
                    key={sides}
                    onClick={() => addDie(sides)}
                    className="bg-stone-800 hover:bg-amber-600 hover:text-black p-6 rounded-2xl font-black text-2xl border-2 border-amber-700 hover:border-amber-400 transition-all"
                  >
                    <div>d{sides}</div>
                    {count > 0 && <div className="text-sm mt-1">{count}x</div>}
                  </button>
                );
              })}
            </div>

            {/* Выбранные кубы */}
            {selected.length > 0 && (
              <div className="mb-6 p-4 bg-amber-900/50 rounded-2xl border-2 border-amber-600">
                <div className="text-amber-300 font-bold mb-3">Готово к броску:</div>
                <div className="flex flex-wrap gap-3">
                  {selected.map((sides, i) => (
                    <span key={i} className="bg-amber-600 text-black px-4 py-2 rounded-full font-bold text-lg">
                      d{sides}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопка бросить */}
            {selected.length > 0 && (
              <button
                onClick={rollDice}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-black font-black py-6 rounded-2xl text-3xl shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                БРОСИТЬ!
              </button>
            )}

            {/* Результат */}
            {results.length > 0 && (
              <div className="mt-8 p-8 bg-gradient-to-br from-emerald-900 to-green-900 rounded-3xl border-4 border-emerald-500 text-center">
                <div className="text-8xl font-black text-white mb-4">{total}</div>
                <div className="text-amber-300 space-y-1">
                  {results.map((roll, i) => (
                    <div key={i} className="text-2xl">d{selected[i]} → {roll}</div>
                  ))}
                </div>
                <button onClick={clear} className="mt-6 text-amber-400 hover:text-white underline text-lg">
                  Очистить
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}