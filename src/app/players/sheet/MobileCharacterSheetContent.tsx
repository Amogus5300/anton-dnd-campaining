// src/app/players/sheet/MobileCharacterSheetContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DiceButton from "@/components/DiceButton";

const mod = (v: number) => Math.floor((v - 10) / 2);

interface Props {
  id: string;
  password: string;
}

export default function MobileCharacterSheetContent({ id, password }: Props) {
  const router = useRouter();
  const [char, setChar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = `char_${id}_${password}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setChar(JSON.parse(saved));
      } catch (e) {
        console.error("Ошибка загрузки персонажа");
      }
    }
    setLoading(false);
  }, [id, password]);

  if (loading || !char) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-4xl text-purple-400 animate-pulse">ВОСКРЕШЕНИЕ ЦАРЯ...</div>
      </div>
    );
  }

  const reaction = Math.floor((char.stats.dex + char.stats.int + char.stats.wis) / 3);
  const reactionBonus = mod(reaction) +
    (char.reactionProf === "expert" ? 12 : char.reactionProf === "prof" ? 6 : 0);

  const profBonus = char.level >= 17 ? 6 : char.level >= 13 ? 5 : char.level >= 9 ? 4 : char.level >= 5 ? 3 : 2;
  const totalGold = char.coins.gp + char.coins.sp * 0.1 + char.coins.cp * 0.01 + char.coins.pp * 10 + char.coins.ep * 0.5;

  return (
    <>
      {/* Красная плашка — чтобы ты точно видел, что это мобильная версия */}
      <div className="fixed top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full z-[9999] font-bold text-sm shadow-lg">
        МОБИЛЬНАЯ ВЕРСИЯ
      </div>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white pb-32">
        {/* ВЕСЬ ТВОЙ КРАСИВЫЙ ДИЗАЙН — ВСТАВЛЯЙ СЮДА */}
        {/* (всё, что у тебя было в return раньше — хедер, кнопки, d20 и т.д.) */}
        {/* Я просто скопирую сюда твой код из предыдущего сообщения: */}

        {/* ВЕРХНЯЯ ЧАСТЬ */}
        <div className="relative pt-4 pb-2 px-4 border-b-4 border-yellow-600 bg-black/50 backdrop-blur-xl">
          <button onClick={() => router.push("/players")} className="absolute left-4 top-4 z-50 bg-black/80 border-2 border-yellow-600 rounded-xl w-12 h-12 flex items-center justify-center hover:bg-yellow-600 hover:text-black transition-all">
            Back
          </button>

          <div className="absolute right-4 top-4 z-50">
            <button onClick={() => alert("Меню скоро будет!")} className="w-14 h-14 rounded-full overflow-hidden border-4 border-yellow-600 shadow-2xl ring-2 ring-yellow-400/50">
              {char.avatar ? <img src={char.avatar} alt="Царь" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-purple-800 to-pink-900 flex items-center justify-center text-2xl font-black">ЦБ</div>}
            </button>
          </div>

          <div className="text-center pt-4">
            <h1 className="text-2xl font-black text-yellow-400 leading-tight">{char.name || "Царь Бимба"}</h1>
            <p className="text-sm text-purple-300">{char.race || "Хобол"} — {char.class || "96"} {char.subclass ? `(${char.subclass})` : ""}</p>
          </div>

          <div className="mx-4 mt-3">
            <div className="h-10 bg-black/80 rounded-full overflow-hidden border-2 border-yellow-600 shadow-inner relative">
              <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 transition-all duration-1000" style={{ width: `${char.level >= 20 ? 100 : (char.experience % 355000) / 3550}%` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white drop-shadow-lg">Уровень {char.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 кнопок */}
        <div className="grid grid-cols-6 gap-3 px-4 py-5 bg-black/30">
          <button className="bg-red-900/80 rounded-xl p-3 text-center border-2 border-red-700 hover:scale-110 transition"><div className="text-xs text-red-300">КЗ</div><div className="text-2xl font-black">{char.ac + (char.shield ? 2 : 0)}</div></button>
          <button className="bg-blue-900/80 rounded-xl p-3 text-center border-2 border-blue-700 hover:scale-110 transition"><div className="text-xs text-blue-300">Скор.</div><div className="text-2xl font-black">{char.speed}</div></button>
          <button className="bg-green-900/80 rounded-xl p-3 text-center border-2 border-green-700 hover:scale-110 transition"><div className="text-xs text-green-300">Влад.</div><div className="text-2xl font-black">+{profBonus}</div></button>
          <button className="bg-yellow-900/80 rounded-xl p-3 text-center border-2 border-yellow-700 hover:scale-110 transition"><div className="text-xs text-yellow-300">Золото</div><div className="text-xl font-black">{totalGold.toFixed(0)}</div></button>
          <button className="bg-orange-900/80 rounded-xl p-3 text-center border-2 border-orange-700 hover:scale-110 transition"><div className="text-2xl">Sun Moon</div></button>
          <button className="bg-red-950/90 rounded-xl p-3 text-center border-4 border-red-800 hover:scale-110 transition"><div className="text-xs text-red-300">HP</div><div className="text-xl font-black">{char.hp.current}/{char.hp.max + (char.hp.bonusMax || 0)}</div></button>
        </div>

        {/* 4 большие кнопки */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4">
          <button className="bg-purple-900/70 rounded-2xl py-6 text-xl font-bold border-2 border-purple-600 hover:bg-purple-800 transition">Атаки</button>
          <button className="bg-cyan-900/70 rounded-2xl py-6 text-xl font-bold border-2 border-cyan-600 hover:bg-cyan-800 transition">Навыки</button>
          <button className="bg-emerald-900/70 rounded-2xl py-6 text-xl font-bold border-2 border-emerald-600 hover:bg-emerald-800 transition">Заклинания</button>
          <button className="bg-pink-900/70 rounded-2xl py-6 text-xl font-bold border-2 border-pink-600 hover:bg-pink-800 transition">Инвентарь</button>
        </div>

        <div className="px-6 py-10 text-center text-gray-500 text-lg">Скоро здесь будет всё...</div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <DiceButton size="large" />
        </div>

        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40">
          <a href={`/players/sheet/desktop/${id}?id=${id}&password=${password}`} className="bg-purple-800/90 hover:bg-purple-700 px-6 py-3 rounded-full text-sm font-bold border-2 border-purple-500 backdrop-blur">
            Полная версия (ПК)
          </a>
        </div>
      </div>
    </>
  );
}