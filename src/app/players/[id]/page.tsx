"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DiceButton from "@/components/DiceButton";

type Stat = "str" | "dex" | "con" | "int" | "wis" | "cha";
type SkillKey =
  | "athletics" | "acrobatics" | "sleightOfHand" | "stealth"
  | "arcana" | "history" | "investigation" | "nature" | "religion"
  | "animalHandling" | "insight" | "medicine" | "perception" | "survival"
  | "deception" | "intimidation" | "performance" | "persuasion";

interface Character {
  id: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  proficiencyBonus: number;
  stats: Record<Stat, number>;
  saves: Record<Stat, boolean>;
  reactionProf: "none" | "prof" | "expert";
  skills: Record<SkillKey, "none" | "prof" | "expert">;
  hp: { max: number; current: number; temp: number; bonusMax: number };
}

const statLabels: Record<Stat, string> = { str: "СИЛА", dex: "ЛОВК", con: "ТЕЛ", int: "ИНТ", wis: "МУД", cha: "ХАР" };
const skillLabels: Record<SkillKey, string> = {
  athletics: "Атлетика", acrobatics: "Акробатика", sleightOfHand: "Ловкость рук", stealth: "Скрытность",
  arcana: "Магия", history: "История", investigation: "Анализ", nature: "Природа", religion: "Религия",
  animalHandling: "Животные", insight: "Прониц.", medicine: "Медицина", perception: "Восприятие", survival: "Выживание",
  deception: "Обман", intimidation: "Запугивание", performance: "Выступление", persuasion: "Убеждение"
};

const skillMap: Record<Stat, SkillKey[]> = {
  str: ["athletics"],
  dex: ["acrobatics", "sleightOfHand", "stealth"],
  con: [],
  int: ["arcana", "history", "investigation", "nature", "religion"],
  wis: ["animalHandling", "insight", "medicine", "perception", "survival"],
  cha: ["deception", "intimidation", "performance", "persuasion"]
};

const statOrder: Stat[] = ["str", "dex", "con", "int", "wis", "cha"];

export default function CharacterSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const password = searchParams.get("password");

  // Защита от пустых параметров
  useEffect(() => {
    if (!id || !password) {
      router.replace("/players");
    }
  }, [id, password, router]);

  const [char, setChar] = useState<Character | null>(null);

  useEffect(() => {
    if (!id || !password) return;

    const key = `char_${id}_${password}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        setChar(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Ошибка загрузки персонажа", e);
      }
    }

    const newChar: Character = {
      id,
      name: "Новый персонаж",
      avatar: "",
      level: 1,
      experience: 0,
      proficiencyBonus: 2,
      stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
      reactionProf: "none",
      skills: {
        athletics: "none", acrobatics: "none", sleightOfHand: "none", stealth: "none",
        arcana: "none", history: "none", investigation: "none", nature: "none", religion: "none",
        animalHandling: "none", insight: "none", medicine: "none", perception: "none", survival: "none",
        deception: "none", intimidation: "none", performance: "none", persuasion: "none"
      },
      hp: { max: 10, current: 10, temp: 0, bonusMax: 0 }
    };

    localStorage.setItem(key, JSON.stringify(newChar));
    setChar(newChar);
  }, [id, password]);

  useEffect(() => {
    if (char && id && password) {
      localStorage.setItem(`char_${id}_${password}`, JSON.stringify(char));
    }
  }, [char, id, password]);

  if (!id || !password || !char) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-4xl text-purple-500 animate-pulse">Загрузка персонажа...</div>
      </div>
    );
  }

  const mod = (v: number) => Math.floor((v - 10) / 2);
  const getBonus = (stat: Stat, type: "stat" | "save" | "skill", skill?: SkillKey): number => {
    const base = mod(char.stats[stat]);
    if (type === "save" && char.saves[stat]) return base + char.proficiencyBonus;
    if (type === "skill" && skill && char.skills[skill] === "prof") return base + char.proficiencyBonus;
    if (type === "skill" && skill && char.skills[skill] === "expert") return base + char.proficiencyBonus * 2;
    return base;
  };

  const [roll, setRoll] = useState<{ val: number; total: number; text: string } | null>(null);
  const rollD20 = (bonus: number, text: string) => {
    const r = Math.floor(Math.random() * 20) + 1;
    setRoll({ val: r, total: r + bonus, text });
    setTimeout(() => setRoll(null), 4000);
  };

  const toggleSkill = (skill: SkillKey) => {
    setChar(p => ({
      ...p!,
      skills: { ...p!.skills, [skill]: p!.skills[skill] === "none" ? "prof" : p!.skills[skill] === "prof" ? "expert" : "none" }
    }));
  };

  const reactionValue = Math.floor((char.stats.dex + char.stats.int + char.stats.wis) / 3);
  const reactionBonus = mod(reactionValue) + (char.reactionProf === "prof" ? char.proficiencyBonus : char.reactionProf === "expert" ? char.proficiencyBonus * 2 : 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-32">
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between">
        <button onClick={() => router.back()} className="bg-gray-800 px-5 py-3 rounded-full">Назад</button>
        <button onClick={() => router.push(`/players/dashboard?password=${password}`)} className="bg-purple-600 px-5 py-3 rounded-full">Персонажи</button>
      </div>

      <div className="p-6 pt-20 text-center">
        <input value={char.name} onChange={e => setChar(p => ({ ...p!, name: e.target.value }))} className="text-4xl font-bold bg-transparent border-b-4 border-purple-500 outline-none w-full" />
        <div className="text-2xl mt-4">Уровень {char.level} • {char.experience} XP</div>
        <div className="text-5xl mt-6 text-red-500 font-bold">HP: {char.hp.current} / {char.hp.max + char.hp.bonusMax}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 px-4">
        {statOrder.map(s => (
          <div key={s} className="bg-gray-800 rounded-2xl p-4">
            <div className="text-center">
              <div className="text-xs opacity-70">{statLabels[s]}</div>
              <input type="number" value={char.stats[s]} onChange={e => setChar(p => ({ ...p!, stats: { ...p!.stats, [s]: +e.target.value || 10 } }))} className="text-3xl font-bold bg-transparent w-full text-center" />
              <div className={`text-2xl ${getBonus(s, "stat") >= 0 ? "text-green-400" : "text-red-400"}`}>{getBonus(s, "stat") >= 0 ? "+" : ""}{getBonus(s, "stat")}</div>
              <button onClick={() => setChar(p => ({ ...p!, saves: { ...p!.saves, [s]: !p!.saves[s] } }))} className={`mt-2 w-full py-2 rounded text-sm ${char.saves[s] ? "bg-green-600" : "bg-gray-700"}`}>
                Спас: {char.saves[s] ? "Вл" : "—"} +{getBonus(s, "save")}
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {skillMap[s].map(sk => (
                <div key={sk} className="flex justify-between items-center bg-gray-700 hover:bg-gray-600 rounded px-3 py-2">
                  <button onClick={() => rollD20(getBonus(s, "skill", sk), skillLabels[sk])} className="text-left flex-1">{skillLabels[sk]}</button>
                  <button onClick={() => toggleSkill(sk)} className={`font-bold ${char.skills[sk] === "expert" ? "text-purple-400" : char.skills[sk] === "prof" ? "text-green-400" : "text-gray-500"}`}>
                    {char.skills[sk] === "expert" ? "2×" : char.skills[sk] === "prof" ? "Вл" : "—"}
                  </button>
                  <span className="ml-2 w-10 text-right">+{getBonus(s, "skill", sk)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-5 border-4 border-purple-500">
          <div className="text-center text-lg">РЕАКЦИЯ</div>
          <div className="text-4xl font-bold">{reactionValue}</div>
          <button onClick={() => rollD20(reactionBonus, "Реакция")} className="mt-3 w-full py-3 rounded text-lg bg-purple-600">
            {char.reactionProf === "expert" ? "2×" : char.reactionProf === "prof" ? "Вл" : "—"} +{reactionBonus}
          </button>
        </div>
      </div>

      {roll && (
        <div className="fixed bottom-6 left-6 bg-black/90 border-4 border-amber-500 rounded-2xl p-5 text-center animate-bounce z-50">
          <div className="text-6xl font-black text-amber-400">{roll.val}</div>
          <div className="text-4xl text-green-400">→ {roll.total}</div>
          <div className="text-sm text-amber-300">{roll.text}</div>
        </div>
      )}

      <DiceButton />
    </div>
  );
}