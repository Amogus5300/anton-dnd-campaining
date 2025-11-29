"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SimpleChar {
  id: string;
  name: string;
}

interface FullChar {
  id: string;
  name: string;
  level: number;
  hp: { current: number; max: number; bonusMax: number };
  class?: string;
  ac?: number;
  stats: Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>;
  reactionProf: "none" | "prof" | "expert";
}

const statEmoji = { str: "💪", dex: "🏹", con: "❤️", int: "🧠", wis: "👁", cha: "🎭" };
const statNames = { str: "Сил", dex: "Лов", con: "Тел", int: "Инт", wis: "Муд", cha: "Хар" };

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const password = searchParams.get("password") || "";

  const [characters, setCharacters] = useState<SimpleChar[]>([]);
  const [fullData, setFullData] = useState<Record<string, FullChar>>({});

  useEffect(() => {
    if (!password) {
      router.replace("/players");
      return;
    }

    const listKey = `characters_${password}`;
    const savedList = localStorage.getItem(listKey);
    if (savedList) {
      const list: SimpleChar[] = JSON.parse(savedList);
      setCharacters(list);

      // Загружаем полные данные всех персонажей
      const data: Record<string, FullChar> = {};
      list.forEach(char => {
        const key = `char_${char.id}_${password}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            data[char.id] = parsed;
          } catch (e) { /* игнорируем битые */ }
        }
      });
      setFullData(data);
    }
  }, [password, router]);

  const createCharacter = () => {
    const id = Date.now().toString();
    const newChar: SimpleChar = { id, name: "Новый персонаж" };

    const updated = [...characters, newChar];
    localStorage.setItem(`characters_${password}`, JSON.stringify(updated));
    setCharacters(updated);

    router.push(`/players/sheet/${id}?id=${id}&password=${password}`);
  };

  const openCharacter = (id: string) => {
    router.push(`/players/sheet/${id}?id=${id}&password=${password}`);
  };

  const deleteCharacter = (id: string) => {
    if (!confirm("Удалить этого персонажа навсегда?")) return;

    // Удаляем из списка
    const updated = characters.filter(c => c.id !== id);
    localStorage.setItem(`characters_${password}`, JSON.stringify(updated));
    setCharacters(updated);

    // Удаляем сам лист
    localStorage.removeItem(`char_${id}_${password}`);
    setFullData(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const mod = (v: number) => Math.floor((v - 10) / 2);

  if (!password) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center text-4xl">Доступ запрещён</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* КНОПКИ НАВИГАЦИИ */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between">
        <button onClick={() => router.back()} className="bg-gray-800 px-6 py-3 rounded-full text-lg">
          ← Назад
        </button>
        <button onClick={() => router.push("/")} className="bg-purple-600 px-6 py-3 rounded-full text-lg">
          На главную
        </button>
      </div>

      <h1 className="text-5xl font-bold text-center mt-20 mb-10 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Твои герои
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* КНОПКА СОЗДАНИЯ */}
        <button
          onClick={createCharacter}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-8 rounded-3xl text-3xl font-bold hover:scale-105 transition shadow-2xl"
        >
          + Создать нового персонажа
        </button>

        {/* СПИСОК ПЕРСОНАЖЕЙ */}
        {characters.length === 0 ? (
          <p className="text-center text-gray-400 text-xl">Пока нет персонажей. Создай первого!</p>
        ) : (
          characters.map(char => {
            const data = fullData[char.id];
            if (!data) return null;

            const reactionValue = Math.floor((data.stats.dex + data.stats.int + data.stats.wis) / 3);
            const reactionBonus = mod(reactionValue) +
              (data.reactionProf === "prof" ? 2 + Math.floor((data.level - 1) / 4)
               : data.reactionProf === "expert" ? (2 + Math.floor((data.level - 1) / 4)) * 2 : 0);

            return (
              <div
                key={char.id}
                className="bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-700 hover:border-purple-500 transition cursor-pointer"
                onClick={() => openCharacter(char.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-bold">{data.name || "Без имени"}</h3>
                    <p className="text-xl text-purple-400">
                      {data.class || "Класс не выбран"} • Уровень {data.level}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCharacter(char.id);
                    }}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                  >
                    Удалить
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-red-900/50 rounded-xl p-4">
                    <div className="text-3xl font-bold">{data.hp.current}</div>
                    <div className="text-sm opacity-70">из {data.hp.max + data.hp.bonusMax} HP</div>
                  </div>
                  <div className="bg-blue-900/50 rounded-xl p-4">
                    <div className="text-3xl font-bold">{data.ac || "?"}</div>
                    <div className="text-sm opacity-70">Класс защиты</div>
                  </div>
                  <div className="bg-purple-900/50 rounded-xl p-4">
                    <div className="text-2xl font-bold">{reactionValue}</div>
                    <div className="text-sm opacity-70">Реакция +{reactionBonus}</div>
                  </div>
                  <div className="bg-green-900/50 rounded-xl p-4">
                    <div className="text-2xl font-bold">→</div>
                    <div className="text-sm opacity-70">Открыть лист</div>
                  </div>
                </div>

                {/* ХАРАКТЕРИСТИКИ */}
                <div className="mt-6 grid grid-cols-6 gap-3 text-center text-sm">
                  {(["str", "dex", "con", "int", "wis", "cha"] as const).map(stat => (
                    <div key={stat} className="bg-gray-700 rounded-xl p-3">
                      <div className="text-2xl">{statEmoji[stat]}</div>
                      <div className="font-bold">{data.stats[stat]}</div>
                      <div className={mod(data.stats[stat]) >= 0 ? "text-green-400" : "text-red-400"}>
                        {mod(data.stats[stat]) >= 0 ? "+" : ""}{mod(data.stats[stat])}
                      </div>
                      <div className="text-xs opacity-70">{statNames[stat]}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}