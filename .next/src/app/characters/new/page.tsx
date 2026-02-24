"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NewCharacter() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    // Защита от двойного срабатывания в Strict Mode
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    // Генерируем уникальный ID
    const newId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Дефолтный персонаж — точно как у тебя в CharacterSheet
    const defaultChar = {
      id: newId,
      name: "Новый герой",
      avatar: "",
      race: "Человек",
      class: "Воин",
      level: 1,
      experience: 0,
      stats: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false, reaction: false },
      skills: Object.fromEntries(
        [
          "athletics", "acrobatics", "sleightOfHand", "stealth",
          "arcana", "history", "investigation", "nature", "religion",
          "animalHandling", "insight", "medicine", "perception", "survival",
          "deception", "intimidation", "performance", "persuasion"
        ].map(k => [k, "none"])
      ),
      ac: 10,
      shield: false,
      speed: 30,
      initiative: 0,
      hp: { max: 10, current: 10, temp: 0, bonusMax: 0 },
      hitDie: 10,
      hitDieSpent: 0,
      coins: { gp: 15, sp: 0, cp: 0, pp: 0, ep: 0 },
      features: [],
      inspiration: 0,
      exhaustion: 0,
      reactionProf: "none"
    };

    // Сохраняем только один раз
    localStorage.setItem(`character_${newId}`, JSON.stringify(defaultChar));

    // Переходим на лист персонажа
    router.replace(`/characters/${newId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-black text-yellow-400 mb-8 animate-pulse">
          СОЗДАЁТСЯ НОВЫЙ ГЕРОЙ...
        </p>
        <p className="text-4xl text-cyan-300">
          Царь Бимба благословляет рождение легенды
        </p>
      </div>
    </div>
  );
}