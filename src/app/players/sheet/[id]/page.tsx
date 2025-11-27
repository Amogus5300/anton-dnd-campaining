"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DiceButton from "@/components/DiceButton";
import Image from "next/image";

const mod = (v: number) => Math.floor((v - 10) / 2);

type Stat = "str" | "dex" | "con" | "int" | "wis" | "cha";
type SkillKey =
  | "athletics"
  | "acrobatics"
  | "sleightOfHand"
  | "stealth"
  | "arcana"
  | "history"
  | "investigation"
  | "nature"
  | "religion"
  | "animalHandling"
  | "insight"
  | "medicine"
  | "perception"
  | "survival"
  | "deception"
  | "intimidation"
  | "performance"
  | "persuasion";

interface Character {
  deathSaves?: {
  success: number;
  fail: number;
  };
  id: string;
  name: string;
  avatar: string;
  race?: string;
  class?: string;
  subclass?: string;
  level: number;
  experience: number;
  proficiencyBonus: number;
  stats: Record<Stat, number>;
  saves: Record<Stat | "reaction", boolean>;
  skills: Record<SkillKey, "none" | "prof" | "expert">;
  ac: number;
  shield: boolean;
  shieldValue?: number | null;
  profBonusDelta?: number | null;
  speed: number;
  initiative: number;
  hp: { max: number; current: number; temp: number; bonusMax: number };
  hitDie?: 6 | 8 | 10 | 12;
  coins: { gp: number; sp: number; cp: number; pp: number; ep: number };
  reactionProf?: "none" | "prof" | "expert";
  gold?: number;
  attacks?: any[];
  spells?: any[];
  inventory?: any[];
  features?: string[];
  personality?: string;
}

const skillStatMap = {
  athletics: "str",
  acrobatics: "dex",
  sleightOfHand: "dex",
  stealth: "dex",
  arcana: "int",
  history: "int",
  investigation: "int",
  nature: "int",
  religion: "int",
  animalHandling: "wis",
  insight: "wis",
  medicine: "wis",
  perception: "wis",
  survival: "wis",
  deception: "cha",
  intimidation: "cha",
  performance: "cha",
  persuasion: "cha"
} as const;

const skillLabels = {
  athletics: "Атлетика",
  acrobatics: "Акробатика",
  sleightOfHand: "Ловкость рук",
  stealth: "Скрытность",
  arcana: "Магия",
  history: "История",
  investigation: "Расследование",
  nature: "Природа",
  religion: "Религия",
  animalHandling: "Обращение с животными",
  insight: "Проницательность",
  medicine: "Медицина",
  perception: "Восприятие",
  survival: "Выживание",
  deception: "Обман",
  intimidation: "Запугивание",
  performance: "Выступление",
  persuasion: "Убеждение"
} as const;

const statsConfig = [
  { stat: "str" as const, label: "СИЛА", skills: ["athletics"] },
  { stat: "dex" as const, label: "ЛОВК", skills: ["acrobatics", "sleightOfHand", "stealth"] },
  { stat: "con" as const, label: "ТЕЛ",  skills: [] },
  { stat: "int" as const, label: "ИНТ",  skills: ["arcana", "history", "investigation", "nature", "religion"] },
  { stat: "wis" as const, label: "МУД",  skills: ["animalHandling", "insight", "medicine", "perception", "survival"] },
  { stat: "cha" as const, label: "ХАР",  skills: ["deception", "intimidation", "performance", "persuasion"] }
] as const;

export default function CharacterSheet() {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const password = searchParams.get("password");
  
  const [showExperimental, setShowExperimental] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [char, setChar] = useState<Character | null>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showFullSettings, setShowFullSettings] = useState(false);
  const [showXpCalculator, setShowXpCalculator] = useState(false);
  const [showXpManual, setShowXpManual] = useState(false);
  const [xpInput, setXpInput] = useState("");
  const [showHpModal, setShowHpModal] = useState(false);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [coinType, setCoinType] = useState<"gp" | "sp" | "cp" | "pp" | "ep">("gp");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ─── УМНАЯ СИСТЕМА БОНУСА ВЛАДЕНИЯ (ДЕЛЬТА) ───
  const getAutoProfBonus = (level: number): number => {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9)  return 4;
  if (level >= 5)  return 3;
  return 2;
  };
  const profBonus = char ? getAutoProfBonus(char.level) + (char.profBonusDelta ?? 0) : 2;
  const [roll, setRoll] = useState<{ val: number; total: number; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"атаки" | "способности" | "снаряжение" | "личность" | "цели" | "заметки" | "заклинания">("атаки");
  const [tab, setTab] = useState<"attacks" | "spells" | "inventory" | "features" | "personality">("features");
  

 // ─────────────────────────────────────────────────────────────────────
  // БОЖЕСТВЕННАЯ СИСТЕМА ОПЫТА — РАБОТАЕТ НА ЛЮБОМ УРОВНЕ, ВКЛЮЧАЯ 96
  // ─────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────
  // БОЖЕСТВЕННАЯ СИСТЕМА ОПЫТА — ФИНАЛЬНАЯ ВЕРСИЯ, БЕЗ ОШИБОК, РАБОТАЕТ НА 96 УРОВНЕ
  // ─────────────────────────────────────────────────────────────────────
  const xpTable: Record<number, number> = {
    1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000, 8: 34000,
    9: 48000, 10: 64000, 11: 85000, 12: 100000, 13: 120000, 14: 140000,
    15: 165000, 16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
  };

  const getXpNeededForLevel = (lvl: number): number => 
    lvl <= 20 ? (xpTable[lvl] ?? 355000) : 355000;

  const getXpNeededForNextLevel = (lvl: number): number => 
    lvl >= 20 ? Infinity : getXpNeededForLevel(lvl + 1);

  const getXpProgressPercent = (): number => {
    if (!char || char.level >= 20) return 100;
    const current = getXpNeededForLevel(char.level);
    const next = getXpNeededForNextLevel(char.level);
    if (next === Infinity) return 100;
    const progress = Math.max(0, char.experience - current);
    const needed = next - current;
    return needed > 0 ? Math.min(100, (progress / needed) * 100) : 100;
  };

  const canLevelUp = (): boolean => 
    char !== null && char.level < 20 && char.experience >= getXpNeededForNextLevel(char.level);

  const addXp = (amount: number) => {
    if (!char) return;
    setChar(prev => prev ? { ...prev, experience: Math.max(0, prev.experience + amount) } : prev);
    setXpInput("");
  };

  // ВОТ ОНА — ФУНКЦИЯ, КОТОРОЙ НЕ ХВАТАЛО
  const handleXpInput = (key: string | number) => {
    if (key === "C") {
      setXpInput("");
    } else if (key === "Backspace") {
      setXpInput(prev => prev.slice(0, -1));
    } else if (typeof key === "string" || typeof key === "number") {
      setXpInput(prev => prev + key);
    }
  };

  const handleLevelUpDown = () => {
    if (!char) return;

    if (canLevelUp()) {
      let newLevel = char.level;
      while (newLevel < 20 && char.experience >= getXpNeededForNextLevel(newLevel)) {
        newLevel++;
      }
      setChar(prev => prev ? { ...prev, level: newLevel } : prev);
    } else if (char.experience < getXpNeededForLevel(char.level) && char.level > 1) {
      let newLevel = char.level;
      while (newLevel > 1 && char.experience < getXpNeededForLevel(newLevel)) {
        newLevel--;
      }
      setChar(prev => prev ? { ...prev, level: newLevel } : prev);
    }
  };
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !password) {
      router.replace("/players");
      return;
    }

    const key = `char_${id}_${password}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        setChar(JSON.parse(saved));
      } catch (e) {
        console.error("Ошибка загрузки", e);
      }
      return;
           }

         const defaultChar: Character = {
        id: id!,
        name: "Царь Бимба",
        avatar: "",
        race: "Хобол",
        class: "96",
        subclass: "сын мертвой бляди",
        level: 96,
        experience: 999999,
        proficiencyBonus: 96,
        stats: { str: 19, dex: 15, con: 12, int: 15, wis: 15, cha: 8 },
        saves: { str: false, dex: true, con: false, int: false, wis: true, cha: false, reaction: true },
        skills: {
        athletics: "none",
        acrobatics: "prof",
        sleightOfHand: "none",
        stealth: "expert",
        arcana: "prof",
        history: "none",
        investigation: "prof",
        nature: "none",
        religion: "none",
        animalHandling: "none",
        insight: "prof",
        medicine: "none",
        perception: "expert",
        survival: "prof",
        deception: "none",
        intimidation: "prof",
        performance: "none",
        persuasion: "none"
        },
          ac: 69,
          shield: true,
          speed: 69,
          initiative: 2,
          hp: { max: 666, current: 666, temp: 0, bonusMax: 0 },
          coins: { gp: 17121, sp: 0, cp: 0, pp: 0, ep: 0 },
          personality: "Владыка всего сущего",
          features: ["Бессмертие", "КЗ 69", "Сын мертвой бляди", "17121 золота", "96 уровень"],
          attacks: [],
          spells: [],
          inventory: []
        };

      localStorage.setItem(key, JSON.stringify(defaultChar));
     setChar(defaultChar);
      }, [id, password, router]);

      useEffect(() => {
      if (char && id && password) {
      localStorage.setItem(`char_${id}_${password}`, JSON.stringify(char));
      }
      }, [char]);

      if (!char) {
      return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-6xl text-purple-500 font-black">
        ВОСКРЕШЕНИЕ ЦАРЯ...
      </div>
      );
     }

 

      const getSkillBonus = (skill: SkillKey) => {
     const stat = skillStatMap[skill];
      const proficiency = char.skills[skill];
      const base = mod(char.stats[stat]);
      if (proficiency === "prof") return base + profBonus;
      if (proficiency === "expert") return base + profBonus * 2;
     return base;
      };
      const maxHp = char.hp.max + (char.hp.bonusMax || 0);
      const currentHp = Math.min(char.hp.current, maxHp);
      const tempHp = char.hp.temp || 0;   // ← добавь эту строку где-то выше, например после объявления char
      const rollD20 = (bonus: number, text: string) => {
      const r = Math.floor(Math.random() * 20) + 1;
      setRoll({ val: r, total: r + bonus, text });
      setTimeout(() => setRoll(null), 4000);
      };

      const renderStatWithSkills = (stat: Stat | "reaction") => {
  const isReaction = stat === "reaction";
  const value = isReaction 
    ? Math.floor((char.stats.dex + char.stats.int + char.stats.wis) / 3)
    : char.stats[stat as Stat];
  const modifier = mod(value);
  const saveBonus = isReaction 
    ? modifier + ((char.reactionProf || "none") === "prof" ? profBonus : (char.reactionProf || "none") === "expert" ? profBonus * 2 : 0)
    : (char.saves[stat as Stat] ? modifier + profBonus : modifier);

  const toggleSaveProf = () => {
    if (isReaction) {
      setChar(c => c ? { ...c, reactionProf: (c.reactionProf || "none") === "none" ? "prof" : (c.reactionProf || "none") === "prof" ? "expert" : "none" } : c);
    } else {
      setChar(c => c ? { ...c, saves: { ...c.saves, [stat]: !c.saves[stat as Stat] } } : c);
    }
  };

  const statLabel = stat === "str" ? "СИЛА"
    : stat === "dex" ? "ЛОВК"
    : stat === "con" ? "ТЕЛ"
    : stat === "int" ? "ИНТ"
    : stat === "wis" ? "МУД"
    : stat === "cha" ? "ХАР"
    : "РЕАКЦИЯ";

  return (
    <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-5 border-4 border-purple-800 shadow-2xl">
      {/* Название + значение */}
      <div className="text-center mb-4">
        <div className={`text-2xl font-black ${isReaction ? "text-orange-400" : "text-purple-300"}`}>
          {statLabel}
        </div>
        {isReaction ? (
          <div className="text-5xl font-black text-orange-300">{value}</div>
        ) : (
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const v = Math.max(1, Math.min(30, Number(e.target.value) || 10));
              setChar(c => c ? { ...c, stats: { ...c.stats, [stat]: v } } : c);
            }}
            className="w-20 mx-auto bg-gray-900 text-center text-5xl font-black rounded-xl outline-none focus:ring-4 focus:ring-purple-600 mt-2"
          />
        )}
      </div>

      {/* === ДЛЯ ОБЫЧНЫХ ХАРАКТЕРИСТИК: проверка + спас в ОДИН РЯД, в 2 раза уже === */}
      {!isReaction && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Проверка */}
          <div className="bg-gray-900/70 hover:bg-purple-900/60 rounded-xl px-3 py-2.5 flex items-center justify-between transition-all border border-purple-900 hover:border-purple-500">
            <span className="text-xs font-medium text-gray-400">проверка</span>
            <button
              onClick={() => rollD20(modifier, `${statLabel} проверка`)}
              className="text-xl font-black text-purple-300 hover:scale-110 transition"
            >
              {modifier >= 0 ? "+" : ""}{modifier}
            </button>
          </div>

          {/* спасбросок */}
          <div className="bg-gray-900/70 hover:bg-emerald-900/50 rounded-xl px-3 py-2.5 flex items-center justify-between transition-all border border-emerald-900 hover:border-emerald-500">
            <span className="text-xs font-medium text-gray-400">спас</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => rollD20(saveBonus, `Спас ${statLabel}`)}
                className="text-xl font-black text-emerald-300 hover:scale-110 transition"
              >
                {saveBonus >= 0 ? "+" : ""}{saveBonus}
              </button>
              <button
                onClick={toggleSaveProf}
                className={`w-6 h-6 rounded-full border-2 text-[10px] font-bold flex items-center justify-center transition-all
                  ${char.saves[stat as Stat]
                    ? "bg-emerald-700 border-emerald-400 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-500"
                  }`}
              >
                {char.saves[stat as Stat] ? "Check" : "–"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === ДЛЯ РЕАКЦИИ: только спасбросок, без проверки === */}
      {isReaction && (
        <div className="mb-4">
          <div className="bg-gray-900/70 hover:bg-orange-900/50 rounded-xl px-4 py-3 flex items-center justify-between transition-all border-2 border-orange-800 hover:border-orange-500">
            <span className="text-lg font-bold text-orange-300">Спасбросок реакции</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => rollD20(saveBonus, "Реакция")}
                className="text-3xl font-black text-orange-300 hover:scale-110 transition"
              >
                {saveBonus >= 0 ? "+" : ""}{saveBonus}
              </button>
              <button
                onClick={toggleSaveProf}
                className={`w-10 h-10 rounded-full border-3 text-sm font-bold transition-all shadow-lg
                  ${char.reactionProf === "expert" ? "bg-yellow-600 border-yellow-400 text-black animate-pulse"
                    : char.reactionProf === "prof" ? "bg-orange-700 border-orange-400 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-500"
                  }`}
              >
                {char.reactionProf === "expert" ? "2×" : char.reactionProf === "prof" ? "Check" : "–"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Умения — оставляем как есть, только чуть компактнее */}
      {statsConfig.find(c => c.stat === stat)?.skills.map(sk => {
        const bonus = getSkillBonus(sk as SkillKey);
        const prof = char.skills[sk as SkillKey];

        return (
          <div key={sk} className="bg-gray-900/70 hover:bg-purple-900/60 rounded-2xl px-4 py-2.5 flex items-center justify-between transition-all border border-purple-900 hover:border-purple-500">
            <span className="text-sm font-medium">{skillLabels[sk as SkillKey]}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => rollD20(bonus, skillLabels[sk as SkillKey])}
                className="text-2xl font-black text-cyan-300 hover:scale-110 transition-all"
              >
                {bonus >= 0 ? "+" : ""}{bonus}
              </button>
              <button
                onClick={() => {
                  const current = char.skills[sk as SkillKey];
                  const next = current === "none" ? "prof" : current === "prof" ? "expert" : "none";
                  setChar(c => c ? { ...c, skills: { ...c.skills, [sk]: next } } : c);
                }}
                className={`w-8 h-8 rounded-full border-2 text-xs font-bold flex items-center justify-center transition-all
                  ${prof === "expert" ? "bg-yellow-600 border-yellow-400 text-black"
                    : prof === "prof" ? "bg-emerald-700 border-emerald-400 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-500"
                  }`}
              >
                {prof === "expert" ? "2" : prof === "prof" ? "Check" : "–"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const renderStatBlock = (stat: Stat) => {
  const value = char.stats[stat];
  const modifier = mod(value);
  const saveBonus = char.saves[stat] ? modifier + profBonus : modifier;

  return (
    <div key={stat} className="bg-black/70 backdrop-blur rounded-3xl p-6 border border-purple-700 shadow-2xl">
      <div className="text-center mb-3">
        <div className="text-2xl font-black text-purple-300">
          {stat === "str" ? "СИЛА" : stat === "dex" ? "ЛОВК" : stat === "con" ? "ТЕЛ" : 
           stat === "int" ? "ИНТ" : stat === "wis" ? "МУД" : "ХАР"}
        </div>
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = Math.max(1, Math.min(30, Number(e.target.value) || 10));
          setChar(c => c ? { ...c, stats: { ...c.stats, [stat]: v } } : c);
        }}
        className="w-full bg-gray-900 text-center text-5xl font-black rounded-xl mb-3 outline-none focus:ring-4 focus:ring-purple-600"
      />

      <button
        onClick={() => rollD20(modifier, stat.toUpperCase())}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl py-4 text-4xl font-black mb-3 hover:scale-105 transition"
      >
        {modifier >= 0 ? "+" : ""}{modifier}
      </button>

      <button
        onClick={() => rollD20(saveBonus, `Спасбросок ${stat.toUpperCase()}`)}
        onDoubleClick={() => setChar(c => c ? { ...c, saves: { ...c.saves, [stat]: !c.saves[stat] } } : c)}
        className={`w-full rounded-xl py-3 text-2xl font-bold transition-all ${
          char.saves[stat]
            ? "bg-gradient-to-r from-green-600 to-emerald-700 border-4 border-green-400"
            : "bg-gray-800 border-2 border-gray-600"
        }`}
      >
        Спас: {saveBonus >= 0 ? "+" : ""}{saveBonus}{char.saves[stat] && " Check"}
      </button>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white">
{showFullSettings && char && (
  <SettingsModal 
    char={char} 
    setChar={setChar} 
    onClose={() => setShowFullSettings(false)} 
  />
)}
      {/* ВЕРХНЯЯ ПОЛОСА — ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ, ВЕЧНАЯ ВЕРСИЯ */}
      <div className="bg-black/50 backdrop-blur-2xl border-b-8 border-yellow-600 shadow-2xl py-8 relative">

        {/* ЛЕВЫЙ ВЕРХНИЙ УГОЛ — КНОПКИ НАЗАД */}
        <div className="absolute top-6 left-6 flex gap-4 z-50">
          {/* Главное меню — домик */}
          <button
            onClick={() => router.push("/")}
            className="w-14 h-14 bg-black/80 border-4 border-yellow-600 rounded-2xl flex items-center justify-center hover:bg-yellow-600 hover:text-black transition-all shadow-2xl"
            title="Главное меню"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </button>

          {/* Кнопка «Назад к выбору персонажей» — 100% рабочая */}
<button
  onClick={() => {
    // Очищаем параметры id и password из URL и переходим на чистую страницу персонажей
    router.push("/players");
  }}
  className="w-14 h-14 bg-black/80 border-4 border-yellow-600 rounded-2xl flex items-center justify-center hover:bg-yellow-600 hover:text-black transition-all shadow-2xl"
  title="Выбор персонажа"
>
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
  </svg>
</button>
        </div>

        <div className="max-w-screen-2xl mx-auto px-8 flex items-center justify-between">

          {/* ЛЕВАЯ ЧАСТЬ — ПОРТРЕТ + МЕНЮ ПРИ КЛИКЕ */}
          <div className="flex items-center relative">

            {/* ПОРТРЕТ + ПОЛНОСТЬЮ РАБОЧЕЕ МЕНЮ — ФИНАЛЬНАЯ ВЕРСИЯ */}
            <div className="relative">
              <div 
                onClick={() => setShowAvatarMenu(prev => !prev)}
                className="cursor-pointer hover:scale-110 transition"
              >
                <div className="w-32 h-32 rounded-3xl border-8 border-yellow-500 shadow-2xl ring-4 ring-yellow-600/70 overflow-hidden">
                  {char.avatar ? (
                    <img src={char.avatar} alt="Царь" className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-950 via-black to-purple-900 flex items-center justify-center">
                      <span className="text-6xl font-black text-yellow-500">ЦБ</span>
                    </div>
                  )}
                </div>
              </div>

              {/* МЕНЮ ПОРТРЕТА — ПОРЯДОК: НАСТРОЙКИ → СМЕНЫ ПОРТРЕТА → ВСЁ РАБОТАЕТ */}
              {/* КОМПАКТНОЕ МЕНЮ ПОРТРЕТА — НЕ ВЫЛЕЗАЕТ ЗА ГРАНИЦЫ */}
              {showAvatarMenu && (
                <div className="absolute left-full top-0 h-full flex items-center ml-4 z-50 pointer-events-none">
                  <div className="bg-black/95 border-4 border-yellow-600 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
                    <button 
                      onClick={() => { setShowFullSettings(true); setShowAvatarMenu(false); }}
                      className="px-6 py-3 text-sm font-black text-yellow-400 hover:bg-yellow-600 hover:text-black transition whitespace-nowrap"
                    >
                      Настройки
                    </button>
                    <button 
                      onClick={() => { fileInputRef.current?.click(); setShowAvatarMenu(false); }}
                      className="px-6 py-3 text-sm font-black text-cyan-400 hover:bg-cyan-600 hover:text-black transition border-t-4 border-yellow-600 whitespace-nowrap"
                    >
                      Загрузить портрет
                    </button>
                    {/* КНОПКА ЭКСПЕРИМЕНТАЛЬНЫХ ФУНКЦИЙ — ТЕПЕРЬ КАК У "НАСТРОЕК" И "ПОРТРЕТА" */}
  <button 
    onClick={() => setShowExperimental(true)}
    className="px-6 py-3 text-sm font-black text-pink-400 hover:bg-pink-600 hover:text-black transition whitespace-nowrap rounded-lg border-2 border-pink-600/50 relative overflow-hidden group"
  >
    <span className="relative z-10">Экспериментальные функции</span>
    <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
    <div className="absolute inset-0 bg-pink-600 opacity-0 group-hover:opacity-20 transition-opacity" />
  </button>
                 </div>
                </div>
              )}
            </div>

            {/* ТЕКСТ СПРАВА ОТ ПОРТРЕТА */}
            <div className="ml-8 flex flex-col justify-between h-32 w-full max-w-lg">

              <div className="text-4xl font-black text-yellow-400 leading-none">
                {char.name || "Царь Бимба"}
              </div>

              <div className="text-2xl font-bold text-cyan-300">
                {char.race || "Хобол"} — {char.class || "96"} {char.subclass ? `(${char.subclass})` : "сын мертвой бляди"}
              </div>

              <div onClick={() => setShowXpCalculator(true)} className="cursor-pointer select-none">
                <div className="relative h-12 bg-black/80 rounded-full overflow-hidden border-4 border-yellow-600 shadow-xl hover:border-yellow-400 transition-all">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-8 bg-gray-900/90 rounded-full mx-14"></div>
                    <div className="absolute h-8 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-full mx-14 transition-all duration-1000"
                      style={{ width: `${getXpProgressPercent()}%` }}
                    />
                  </div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-black text-yellow-500">{char.level}</div>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                    <span className="text-lg font-black text-white bg-black/90 px-6 py-1 rounded-full shadow-lg">
                      {char.experience.toLocaleString()}
                    </span>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl font-black text-cyan-400">
                    {char.level < 20 ? char.level + 1 : "МАКС"}
                  </div>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-400 mt-2 px-2">
                  <span>{getXpNeededForLevel(char.level).toLocaleString()} XP</span>
                  <span>{char.level < 20 ? getXpNeededForNextLevel(char.level).toLocaleString() + " XP" : "∞ — ТЫ БОГ"}</span>
                </div>
              </div>

            </div>
          </div>

          {/* ВЕРХНЯЯ ПАНЕЛЬ — 6 КНОПОК ЦАРЯ. СВЯЩЕННЫЙ ПОРЯДОК. ПОЛНОСТЬЮ ИСПРАВЛЕНО. */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-6">

    {/* 1. КЗ — ЩИТ */}
    <div className="relative flex justify-center items-center">
      <input
        type="checkbox"
        checked={!!char.shield}
        onChange={(e) => {
          const checked = e.target.checked;
          setChar(c => c ? { ...c, shield: checked, shieldValue: checked ? (c.shieldValue ?? 2) : c.shieldValue } : c);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
      />
      <div className="w-20 h-28 group">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="shieldGrad">
          <stop offset="0%" stopColor="#7f1d1d"/>
          <stop offset="50%" stopColor="#450a0a"/>
          <stop offset="100%" stopColor="#991b1b"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <path d="M50 8 L92 28 L92 72 Q92 102 50 112 Q8 102 8 72 L8 28 Z"
        fill="url(#shieldGrad)"
        stroke={char.shield ? "#fbbf24" : "#dc2626"}
        strokeWidth="6"
        filter={char.shield ? "url(#glow)" : ""}
        className="transition-all duration-500"
      />

      {/* Заклёпки */}
      <circle cx="20" cy="22" r="4" fill="#fee2e2" opacity="0.9"/>
      <circle cx="80" cy="22" r="4" fill="#fee2e2" opacity="0.9"/>
      <circle cx="20" cy="98" r="4" fill="#fee2e2" opacity="0.9"/>
      <circle cx="80" cy="98" r="4" fill="#fee2e2" opacity="0.9"/>

      {/* КЗ */}
      <text x="50" y="74" textAnchor="middle" className="text-4xl font-black"
        fill={char.shield ? "#fbbf24" : "#fee2e2"}
        style={{
          filter: char.shield ? "drop-shadow(0 0 14px #fbbf24)" : "drop-shadow(0 0 8px #dc2626)",
          paintOrder: "stroke fill",
          stroke: char.shield ? "#000" : "#450a0a",
          strokeWidth: char.shield ? "3" : "2"
        }}>
        {char.ac + (char.shield ? (char.shieldValue || 2) : 0)}
      </text>

      {/* Активный щит — золотое сияние */}
      {char.shield && (
        <>
          <circle cx="82" cy="16" r="10" fill="#fbbf24" opacity="0.9">
            <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <text x="82" y="22" textAnchor="middle" className="text-xl font-black fill-black">+</text>
        </>
      )}
    
        </svg>
      </div>
    </div>

    {/* 2. СКОРОСТЬ */}
    <button onClick={() => setShowFullSettings(true)} className="bg-black/70 rounded-xl p-2 border-2 border-cyan-700 text-center hover:scale-105 transition text-xs">
      <div className="text-cyan-300 font-bold">СКОР.</div>
      <div className="text-lg font-black text-cyan-400">{char.speed}</div>
    </button>

    {/* 3. ВЛАДЕНИЕ */}
    <button onClick={() => setShowXpCalculator(true)} className="bg-black/70 rounded-xl p-2 border-2 border-green-700 text-center hover:scale-105 transition text-xs">
      <div className="text-green-300 font-bold">ВЛАД.</div>
      <div className="text-xl font-black text-green-400">+{profBonus}</div>
    </button>

    {/* 4. ЗОЛОТО */}
    <button onClick={() => setShowCoinsModal(true)} className="bg-black/70 rounded-xl p-2 border-2 border-yellow-600 text-center hover:scale-105 transition text-xs group">
      <div className="text-yellow-300 font-bold">ЗОЛОТО</div>
      <div className="text-lg font-black text-yellow-400">
        {(char.coins.gp + char.coins.sp*0.1 + char.coins.cp*0.01 + char.coins.pp*10 + char.coins.ep*0.5).toFixed(0)}
      </div>
    </button>

    {/* 5. ОТДЫХ — СОЛНЦЕ И ЛУНА */}
    <button 
      onClick={() => {
        setChar(c => c ? { ...c, hp: { ...c.hp, current: c.hp.max + (c.hp.bonusMax || 0) } } : c);
        alert("Царь Бимба отдохнул. Силы восстановлены.");
      }}
      className="bg-black/70 rounded-xl p-2 border-2 border-orange-600 text-center hover:scale-110 transition relative overflow-hidden group"
    >
      <div className="relative z-10 flex justify-center items-center h-full text-2xl">
        ☀️ 🌙
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-purple-800/20 group-hover:from-yellow-600/40 group-hover:to-purple-800/40 transition"></div>
    </button>

    {/* 6. ЗДОРОВЬЕ — ПОЛНОСТЬЮ ИСПРАВЛЕНО: ВРЕМЕННЫЕ ВИДНЫ! */}
  <button onClick={() => setShowHpModal(true)} className="bg-black/70 rounded-xl p-3 border-4 border-red-900 text-center hover:scale-105 transition text-xs relative overflow-hidden group">
  <div className="text-red-300 font-bold text-xs">ОД</div>
  <div className="text-xl font-black text-red-400 leading-tight">
    {char.hp.current}/<span className="text-red-300">{char.hp.max + (char.hp.bonusMax || 0)}</span>
  </div>
  {/* ВРЕМЕННЫЕ ХИТЫ — ВИДНЫ! */}
  {tempHp > 0 && (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-purple-600/80 px-3 py-1 rounded-full border-2 border-purple-400 shadow-lg animate-pulse">
        <span className="text-lg font-black text-white">+{tempHp}</span>
      </div>
    </div>
  )}
  {/* Фон при наличии временных */}
  {tempHp > 0 && <div className="absolute inset-0 bg-purple-600/20 animate-pulse rounded-xl"></div>}
  </button>

  </div>{/* ← ЗАКРЫВАЮЩИЙ ТЕГ ДЛЯ grid */}
  </div>{/* ← ЗАКРЫВАЮЩИЙ ТЕГ ДЛЯ max-w-7xl */}
  
  
  
 {/* КНОПКА СКАЧИВАНИЯ + МЕНЮ — В ПРАВОМ ВЕРХНЕМ УГЛУ, НИКОГДА НЕ СПУСКАЕТСЯ ВНИЗ */}
  <div className="fixed top-6 right-6 z-[999999]">
    {/* Главная круглая кнопка */}
   <button
    onClick={() => setShowExportMenu(prev => !prev)}
    className="w-16 h-16 bg-gradient-to-br from-cyan-800 to-blue-900 border-4 border-cyan-500 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
    >
    <span className="text-4xl text-cyan-400">💾</span>
   </button>

    {/* МЕНЮ — ДВА СТОЛБЦА, ПОДНЯТО ВЫШЕ */}
  {showExportMenu && (
    <>
      <div className="fixed inset-0 z-[999997]" onClick={() => setShowExportMenu(false)} />
      
      <div className="absolute top-[-20px] right-full mr-6 w-96 bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95 backdrop-blur-xl border-4 border-cyan-600 rounded-3xl p-5 shadow-2xl
                      origin-right animate-in slide-in-from-right fade-in duration-300">
        <div className="grid grid-cols-2 gap-4">
          <button className="px-6 py-3 text-sm font-black text-cyan-400 hover:bg-cyan-600 hover:text-black transition rounded-lg border-2 border-cyan-600/50 hover:border-cyan-500 shadow-lg active:scale-95">
            Скачать .json
          </button>
          <button className="px-6 py-3 text-sm font-black text-cyan-400 hover:bg-cyan-600 hover:text-black transition rounded-lg border-2 border-cyan-600/50 hover:border-cyan-500 shadow-lg active:scale-95">
            Загрузить .json
          </button>
          <button className="px-6 py-3 text-sm font-black text-pink-400 hover:bg-pink-600 hover:text-black transition rounded-lg border-2 border-pink-600/50 hover:border-pink-500 shadow-lg active:scale-95">
            Скачать .pdf
          </button>
          <button className="px-6 py-3 text-sm font-black text-emerald-400 hover:bg-emerald-600 hover:text-black transition rounded-lg border-2 border-emerald-600/50 hover:border-emerald-500 shadow-lg active:scale-95">
            Загрузить .pdf
          </button>
        </div>
      </div>
    </>
  )}
</div>

{/* Закрытие меню при клике вне его */}
{showExportMenu && (
  <div 
    className="fixed inset-0 z-[999998]" 
    onClick={() => setShowExportMenu(false)}
  />
)}
</div>
</div>

      {/* НИЖНЯЯ ЧАСТЬ — ИДЕАЛЬНАЯ СИММЕТРИЯ 50/50 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-screen-2xl mx-auto px-6 pb-40">
        {/* ← ТУТ У ТЕБЯ ИДЁТ ВСЯ НИЖНЯЯ ЧАСТЬ, ОНА ОСТАЁТСЯ БЕЗ ИЗМЕНЕНИЙ */}

        {/* ЛЕВАЯ ПОЛОВИНА — ДВЕ ПОДКОЛОНКИ С ХАРАКТЕРИСТИКАМИ (50% ширины) */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Левая подколонка */}
          <div className="space-y-6">
            {renderStatWithSkills("str")}      {/* 1. Сила */}
            {renderStatWithSkills("con")}      {/* 2. Телосложение */}
            {renderStatWithSkills("int")}      {/* 3. Интеллект */}
            {renderStatWithSkills("cha")}      {/* 4. Харизма */}
            {renderStatWithSkills("reaction")} {/* 5. Реакция */}
          </div>

          {/* Правая подколонка */}
          <div className="space-y-6">
            {renderStatWithSkills("dex")}      {/* 1. Ловкость */}
            {renderStatWithSkills("wis")}      {/* 2. Мудрость */}

            {/* ПАССИВНЫЕ ЧУВСТВА + ВЛАДЕНИЯ — КОМПАКТНАЯ ВЕРСИЯ */}
            <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-6 border-4 border-cyan-600 shadow-2xl">
              {/* ВЕРХНЯЯ ЧАСТЬ — ПАССИВНЫЕ ЧУВСТВА */}
              <div className="mb-6">
                <h3 className="text-3xl font-black text-cyan-400 text-center mb-5 tracking-wider">
                  ПАССИВНЫЕ ЧУВСТВА
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-xs text-cyan-300 font-bold uppercase">Муд (Восприятие)</div>
                    <div className="text-6xl font-black text-white leading-none">
                      {10 + mod(char.stats.wis) + (char.skills.perception === "prof" ? profBonus : char.skills.perception === "expert" ? profBonus * 2 : 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-cyan-300 font-bold uppercase">Муд (Проницательность)</div>
                    <div className="text-6xl font-black text-white leading-none">
                      {10 + mod(char.stats.wis) + (char.skills.insight === "prof" ? profBonus : char.skills.insight === "expert" ? profBonus * 2 : 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-blue-300 font-bold uppercase">Инт (Анализ)</div>
                    <div className="text-6xl font-black text-white leading-none">
                      {10 + mod(char.stats.int) + (char.skills.investigation === "prof" ? profBonus : char.skills.investigation === "expert" ? profBonus * 2 : 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* РАЗДЕЛИТЕЛЬ */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-5"></div>

              {/* НИЖНЯЯ ЧАСТЬ — ВЛАДЕНИЯ И ЯЗЫКИ */}
              <div>
                <h3 className="text-xl font-black text-yellow-400 text-center mb-3">
                  ВЛАДЕНИЯ И ЯЗЫКИ
                </h3>
                <textarea
                  value={(char.features || []).join("\n")}
                  onChange={(e) => {
                    const lines = e.target.value.split("\n").filter(Boolean);
                    setChar(c => c ? { ...c, features: lines } : c);
                  }}
                  placeholder="• Бессмертие\n• КЗ 69\n• Сын мертвой бляди\n• Все языки\n• Иммунитет ко всему"
                  className="w-full h-32 bg-black/60 border-2 border-cyan-800 rounded-xl px-4 py-3 text-cyan-100 text-sm font-medium placeholder-cyan-600/60 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 scrollbar-thin scrollbar-thumb-cyan-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ ПОЛОВИНА — ВКЛАДКИ ДЛЯ ТЕЛЕФОНА: МИНИМАЛЬНЫЕ, В ОДИН РЯД */}
        <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-4 border-4 border-yellow-600 shadow-2xl">
          {/* 7 КНОПОК — СВЕРХМАЛЕНЬКИЕ, НО ЧИТАЕМЫЕ, В ОДИН РЯД НА ТЕЛЕФОНЕ */}
          <div className="scrollbar-hide overflow-x-auto mb-6">
            <div className="flex justify-start gap-1.5 min-w-max px-2">
              {["атаки", "способности", "снаряжение", "личность", "цели", "заметки", "заклиния"].map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(["атаки","способности","снаряжение","личность","цели","заметки","заклинания"][i] as any)}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === ["атаки","способности","снаряжение","личность","цели","заметки","заклинания"][i]
                      ? "bg-yellow-600 text-black shadow-md scale-105"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* КОНТЕНТ ВКЛАДКИ */}
          <div className="bg-black/60 rounded-2xl p-8 border-2 border-gray-700 text-6xl font-black text-gray-500 text-center uppercase min-h-80 flex items-center justify-center">
            {activeTab}
          </div>
        </div>
      </div>
              
      {/* КАЛЬКУЛЯТОР ОПЫТА — АБСОЛЮТНО ФИНАЛЬНАЯ ВЕРСИЯ */}
{showXpCalculator && (
  <>
    {/* Тёмный фон — закрывает калькулятор при клике вне */}
    <div 
      className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[99998]" 
      onClick={() => { 
        setShowXpCalculator(false); 
        setXpInput(""); 
        setShowXpManual(false); 
      }}
    />

    {/* КАЛЬКУЛЯТОР ОПЫТА — АБСОЛЮТНО ФИНАЛЬНАЯ, ВЕЧНАЯ ВЕРСИЯ */}
{showXpCalculator && (
  <>
    {/* Тёмный фон — 100% закрывает при клике вне */}
    <div 
      className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[99998]" 
      onClick={() => { 
        setShowXpCalculator(false); 
        setXpInput(""); 
        setShowXpManual(false); 
      }}
    />

    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
      
      {/* ЛЕВОЕ ДОПОЛНИТЕЛЬНОЕ МЕНЮ — СТРОГО СЛЕВА, ПОЛНОСТЬЮ СКРЫВАЕТСЯ */}
      <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out pointer-events-auto
        ${showXpManual ? "left-[5%]" : "left-[-100%]"}`}>
        <div className="bg-black/98 border-8 border-yellow-600 rounded-3xl p-10 w-96 shadow-2xl backdrop-blur-xl">
          <h3 className="text-5xl font-black text-yellow-400 mb-12 text-center">Ручная настройка</h3>
          
          <div className="space-y-10">
            <div>
              <label className="text-2xl font-bold text-cyan-300 block mb-3">Текущий уровень</label>
              <input 
                type="number"
                value={char.level}
                onChange={e => setChar(c => c ? { ...c, level: Math.max(1, Math.min(20, Number(e.target.value) || 1)) } : c)}
                className="w-full bg-gray-900 border-4 border-cyan-600 rounded-xl px-6 py-6 text-5xl text-center font-black text-cyan-300"
              />
            </div>

            <div>
              <label className="text-2xl font-bold text-purple-300 block mb-3">Текущий опыт</label>
              <input 
                type="number"
                value={char.experience}
                onChange={e => setChar(c => c ? { ...c, experience: Math.max(0, Number(e.target.value) || 0) } : c)}
                className="w-full bg-gray-900 border-4 border-purple-600 rounded-xl px-6 py-6 text-5xl text-center font-black text-purple-300"
              />
            </div>

            <div>
  <label className="text-2xl font-bold text-green-300 block mb-3">
    Бонус владения
    <span className="block text-sm font-normal opacity-70 mt-1">
      Авто: +{getAutoProfBonus(char.level)} → Сейчас: +{profBonus}
      {char.profBonusDelta != null && (
  <span className="text-yellow-400">
    {" "}Δ{char.profBonusDelta > 0 ? "+" : ""}{char.profBonusDelta}
  </span>
)}
    </span>
  </label>
  <input 
    type="number"
    value={profBonus}
    onChange={e => {
      const newVal = e.target.value === "" ? null : Number(e.target.value);
      const auto = getAutoProfBonus(char.level);
      if (newVal === null) {
        setChar(c => c ? { ...c, profBonusDelta: null } : c);
      } else {
        const delta = newVal - auto;
        setChar(c => c ? { ...c, profBonusDelta: delta } : c);
      }
    }}
    className="w-full bg-gray-900 border-4 border-green-600 rounded-xl px-6 py-6 text-5xl text-center font-black text-green-300"
    placeholder={`+${getAutoProfBonus(char.level)} (авто)`}
  />
</div>
          </div>
        </div>
      </div>

      {/* ОСНОВНОЙ КАЛЬКУЛЯТОР — ПО ЦЕНТРУ */}
      <div 
        className="bg-gradient-to-br from-purple-950 via-black to-purple-900 border-6 border-yellow-600 rounded-3xl shadow-2xl w-full max-w-2xl p-8 pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Уровни */}
        <div className="flex items-center justify-center gap-10 text-5xl font-black mb-8">
          <span className="text-yellow-400">{char.level}</span>
          <div className="w-56 h-12 bg-gray-900/90 rounded-full overflow-hidden border-4 border-yellow-600 relative">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 transition-all duration-700" style={{ width: `${getXpProgressPercent()}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white bg-black/80 px-5 py-1 rounded-full">
              {char.experience.toLocaleString()}
            </span>
          </div>
          <span className="text-cyan-400">{char.level < 20 ? char.level + 1 : "МАКС"}</span>
        </div>

        {/* Поле ввода */}
        <input
          type="text"
          value={xpInput}
          onChange={e => setXpInput(e.target.value.replace(/[^\d+-]/g, ''))}
          className="w-full bg-black/80 border-6 border-yellow-600 rounded-3xl text-6xl text-center font-black text-yellow-400 py-6 mb-6 placeholder-gray-600 focus:ring-6 focus:ring-yellow-500"
          placeholder="0"
          autoFocus
        />

        {/* Клавиатура */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[7,8,9,'+',4,5,6,'-',1,2,3,'C',0,'←'].map(k => (
            <button key={k} onClick={() => handleXpInput(k)}
              className="h-16 text-3xl font-black rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 active:scale-95 border-4 border-gray-700 hover:border-yellow-600 shadow-lg transition">
              {k}
            </button>
          ))}
        </div>

        {/* Кнопки действий */}
        <div className="grid grid-cols-2 gap-5 text-3xl font-black">
          <button onClick={() => addXp(Number(xpInput) || 0)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 py-8 rounded-3xl active:scale-95 shadow-xl">
            ПРИБАВИТЬ
          </button>
          <button onClick={() => addXp(-Math.abs(Number(xpInput) || 0))}
                  className="bg-gradient-to-r from-red-600 to-pink-600 py-8 rounded-3xl active:scale-95 shadow-xl">
            ОТНЯТЬ
          </button>
        </div>

        {/* НИЖНИЕ КНОПКИ — НАСТРОЙКИ И ПОВЫШЕНИЕ УРОВНЯ */}
        <div className="grid grid-cols-2 gap-5 mt-6 text-2xl font-black">
          <button 
            onClick={() => setShowXpManual(prev => !prev)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 py-8 rounded-3xl active:scale-95 shadow-xl"
          >
            {showXpManual ? "СКРЫТЬ" : "НАСТРОЙКИ"}
          </button>
          <button 
            onClick={handleLevelUpDown}
            className={`py-8 rounded-3xl active:scale-95 shadow-xl ${canLevelUp() ? "bg-gradient-to-r from-amber-600 to-yellow-600" : "bg-gray-800 text-gray-600"}`}
          >
            {canLevelUp() ? "ПОВЫСИТЬ УРОВЕНЬ" : "НЕТ ОПЫТА"}
          </button>
        </div>
      </div>
    </div>
  </>
)}
  </>
)}
      {/* Скрытый инпут для загрузки аватара — обязателен! */}
      <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file || !char) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setChar(prev => prev ? { ...prev, avatar: dataUrl } : prev);
    };
    reader.readAsDataURL(file);
  }}
  className="hidden"
/>
{/* МОДАЛКА ХИТОВ */}
      {showHpModal && char && (
        <HPModal 
          char={char} 
          setChar={setChar} 
          onClose={() => setShowHpModal(false)} 
        />
      )}

      {/* МОДАЛКА ЗОЛОТА */}
      {showCoinsModal && char && (
        <CoinsModal 
          char={char} 
          setChar={setChar} 
          onClose={() => setShowCoinsModal(false)}
          coinType={coinType}
          setCoinType={setCoinType}
        />
      )}
{/* ЭКСПЕРИМЕНТАЛЬНЫЕ ФУНКЦИИ — ФИНАЛЬНАЯ, НЕУБИВАЕМАЯ ВЕРСИЯ */}
{/* ВЫНЕСЕНО НА САМЫЙ ВЕРХНИЙ УРОВЕНЬ — НИКАКИХ overflow-hidden РОДИТЕЛЕЙ */}
{showExperimental && (
  <>
    {/* Полноэкранная подложка — затемняет ВСЁ */}
    <div 
      className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[9999998]" 
      onClick={() => setShowExperimental(false)}
    />

    {/* Контейнер модалки — центрирует по всему экрану */}
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center px-4 py-8 pointer-events-none">
      <div 
        className="relative bg-gradient-to-br from-purple-950 via-black to-pink-950 
                   border-8 border-pink-600 rounded-3xl p-10 w-full max-w-7xl max-h-full 
                   overflow-y-auto shadow-2xl shadow-pink-900/90
                   pointer-events-auto
                   animate-in fade-in-0 zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Декоративные шары */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-pink-600 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        </div>

        {/* Заголовок */}
        <h1 className="text-9xl font-black text-center bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-widest animate-pulse">
          EXPERIMENTAL
        </h1>
        <p className="text-4xl text-pink-300 text-center mt-4 font-bold uppercase tracking-wider">
          Лаборатория безумного бога
        </p>

        {/* Контент */}
        <div className="mt-16 bg-black/70 border-4 border-dashed border-pink-600 rounded-3xl p-20 text-center space-y-10">
          <div className="text-9xl animate-bounce">Warning</div>
          <p className="text-6xl font-black text-pink-400 uppercase">ЗОНА НЕСТАБИЛЬНОЙ РЕАЛЬНОСТИ</p>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Здесь рождаются функции, которые ещё не должны существовать.<br />
            Но когда родятся — ты будешь первым, кто их увидит.
          </p>
          <div className="text-9xl animate-spin-slow">Gear</div>
        </div>

        {/* Кнопка закрытия — всегда видна */}
        <button
          onClick={() => setShowExperimental(false)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 
                     bg-gradient-to-r from-pink-800 to-purple-800 
                     hover:from-pink-700 hover:to-purple-700 
                     px-32 py-10 rounded-3xl text-6xl font-black uppercase tracking-widest 
                     shadow-2xl border-4 border-pink-500 
                     transition-all hover:scale-105 active:scale-95"
        >
          ВЕРНУТЬСЯ В РЕАЛЬНОСТЬ
        </button>
      </div>
    </div>
  </>
)}
      <DiceButton />
    </div>
  );
}

// ────────────────────── МОДАЛКА НАСТРОЕК ──────────────────────
function SettingsModal({ char, setChar, onClose }: { 
  char: Character; 
  setChar: React.Dispatch<React.SetStateAction<Character | null>>; 
  onClose: () => void 
}) {
  const [temp, setTemp] = useState({ ...char });

  const save = () => {
    setChar(temp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-gray-800 rounded-3xl p-10 max-w-3xl w-full max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
        
        <h2 className="text-5xl font-black text-center mb-10 text-purple-400">Настройки персонажа</h2>

        {/* ОСНОВНЫЕ ПОЛЯ — ПОДПИСАНЫ */}
        <div className="space-y-6">
          <div>
            <label className="text-xl font-bold text-purple-300">Имя</label>
            <input 
              value={temp.name} 
              onChange={e => setTemp(p => ({ ...p, name: e.target.value }))} 
              className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-2xl" 
              placeholder="Имя персонажа" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xl font-bold text-cyan-300">Раса</label>
              <input 
                value={temp.race ?? ""} 
                onChange={e => setTemp(p => ({ ...p, race: e.target.value }))} 
                className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-xl" 
                placeholder="Раса" 
              />
            </div>
            <div>
              <label className="text-xl font-bold text-cyan-300">Класс</label>
              <input 
                value={temp.class ?? ""} 
                onChange={e => setTemp(p => ({ ...p, class: e.target.value }))} 
                className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-xl" 
                placeholder="Класс" 
              />
            </div>
          </div>

          <div>
            <label className="text-xl font-bold text-pink-300">Подкласс</label>
            <input 
              value={temp.subclass ?? ""} 
              onChange={e => setTemp(p => ({ ...p, subclass: e.target.value }))} 
              className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-xl" 
              placeholder="Подкласс (опционально)" 
            />
          </div>

          {/* 4 КОРОТКИХ ПОЛЯ — ПО 2 В РЯД */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xl font-bold text-red-400">КЗ</label>
              <input 
                type="number" 
                value={temp.ac} 
                onChange={e => setTemp(p => ({ ...p, ac: Number(e.target.value) || 10 }))} 
                className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-2xl text-center" 
              />
            </div>
            <div>
  <label className="text-xl font-bold text-red-300">Бонус от щита</label>
  <input 
    type="number"
    value={temp.shieldValue ?? ""}
    onChange={e => {
      const val = e.target.value === "" ? null : Number(e.target.value);
      setTemp(p => ({ ...p, shieldValue: val }));
    }}
    className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-2xl text-center font-bold text-yellow-400"
    placeholder="2 (по умолчанию)"
  />
</div>
            <div>
              <label className="text-xl font-bold text-cyan-400">Скорость</label>
              <input 
                type="number" 
                value={temp.speed} 
                onChange={e => setTemp(p => ({ ...p, speed: Number(e.target.value) || 30 }))} 
                className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-2xl text-center" 
              />
            </div>
            <div>
              <label className="text-xl font-bold text-purple-400">Инициатива</label>
              <input 
                type="number" 
                value={temp.initiative} 
                onChange={e => setTemp(p => ({ ...p, initiative: Number(e.target.value) || 0 }))} 
                className="w-full mt-2 bg-gray-700 rounded-xl px-6 py-4 text-2xl text-center" 
              />
            </div>
          </div>
        </div>

        {/* КНОПКИ */}
        <div className="flex gap-6 mt-12">
          <button onClick={onClose} className="flex-1 bg-gray-700 py-5 rounded-xl text-2xl font-bold">Отмена</button>
          <button onClick={save} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-5 rounded-xl text-2xl font-bold">Сохранить</button>
        </div>
      </div>
    </div>
  );
}





// ────────────────────── МОДАЛКА ХИТОВ ──────────────────────
function HPModal({ char, setChar, onClose }: { 
  char: Character; 
  setChar: React.Dispatch<React.SetStateAction<Character | null>>; 
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const maxHp = char.hp.max + (char.hp.bonusMax || 0);
  const currentHp = Math.min(char.hp.current, maxHp);
  const tempHp = char.hp.temp || 0;
  const isDown = currentHp <= 0;
  const deathSaves = char.deathSaves || { success: 0, fail: 0 };

  const rollDeathSave = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setLastRoll(roll);
    let s = deathSaves.success;
    let f = deathSaves.fail;
    if (roll === 1) f += 2;
    else if (roll === 20) s += 2;
    else if (roll < 10) f += 1;
    else s += 1;

    if (s >= 3) {
      setChar(c => c ? { ...c, hp: { ...c.hp, current: 1 }, deathSaves: { success: 0, fail: 0 } } : c);
    } else if (f >= 3) {
      setChar(c => c ? { ...c, deathSaves: { success: s, fail: 3 } } : c);
    } else {
      setChar(c => c ? { ...c, deathSaves: { success: s, fail: f } } : c);
    }
    setTimeout(() => setLastRoll(null), 2500);
  };

  const toggleSave = (type: "success" | "fail", index: number) => {
    if (deathSaves.fail >= 3 || deathSaves.success >= 3) return;
    setChar(c => {
      if (!c) return c;
      const saves = { ...deathSaves };
      if (type === "fail") saves.fail = saves.fail >= index + 1 ? index : index + 1;
      else saves.success = saves.success >= index + 1 ? index : index + 1;
      return { ...c, deathSaves: saves };
    });
  };

  const applyDamageOrHeal = (value: number) => {
    if (!value) return;
    setChar(c => {
      if (!c) return c;
      let newCurrent = c.hp.current;
      let newTemp = c.hp.temp || 0;
      if (value < 0) {
        const damage = Math.abs(value);
        if (newTemp >= damage) newTemp -= damage;
        else {
          const remaining = damage - newTemp;
          newTemp = 0;
          newCurrent = Math.max(0, newCurrent - remaining);
        }
      } else {
        newCurrent = Math.min(maxHp, newCurrent + value);
      }
      return { ...c, hp: { ...c.hp, current: newCurrent, temp: newTemp } };
    });
    setInput("");
  };

  const addTempHp = () => {
    const amount = Number(input) || 0;
    if (!amount) return;
    setChar(c => c ? { ...c, hp: { ...c.hp, temp: (c.hp.temp || 0) + amount } } : c);
    setInput("");
  };

  const handleKey = (k: string) => {
    if (k === "C") setInput("");
    else if (k === "Backspace") setInput(i => i.slice(0, -1));
    else if (/\d/.test(k)) setInput(i => i + k);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className="flex gap-6" onClick={e => e.stopPropagation()}>

        {/* ОСНОВНОЙ КАЛЬКУЛЯТОР */}
        <div className="bg-gradient-to-b from-black to-red-950 border-4 border-red-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">

          {/* ЖИВ */}
          {!isDown && (
            <div className="text-center mb-6">
              <div className="text-7xl font-black leading-tight">
                <span className="text-red-500">{currentHp}</span>
                <span className="text-gray-500">/</span>
                <span className="text-red-400">{maxHp}</span>
                {tempHp > 0 && <span className="text-purple-400 ml-3">({tempHp})</span>}
              </div>
            </div>
          )}

          {/* МЁРТВ — КОМПАКТНЫЙ СПАСБРОСОК */}
          {isDown && (
            <div className="text-center py-4">
              <div className="text-4xl font-black text-red-600 mb-6">БЕЗ СОЗНАНИЯ</div>
              <div className="flex items-center justify-center gap-10">
                <div className="flex flex-col gap-4">
                  {[0,1,2].map(i => (
                    <button key={i} onClick={() => toggleSave("fail", i)}
                      className={`w-14 h-14 rounded-full border-4 transition-all ${deathSaves.fail > i ? "bg-red-600 border-red-400 shadow-xl shadow-red-600/70" : "bg-gray-900 border-gray-700"}`} />
                  ))}
                </div>

                <button onClick={rollDeathSave} className="relative group hover:scale-110 active:scale-95 transition-all">
                  <div className={`w-24 h-24 rounded-3xl overflow-hidden shadow-2xl relative ring-4 ring-gray-700 transition-all duration-400
                    ${lastRoll === 1 ? "ring-red-600" : lastRoll === 20 ? "ring-emerald-500" : lastRoll !== null && lastRoll < 10 ? "ring-red-500" : lastRoll !== null ? "ring-emerald-500" : ""}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                    <div className="absolute inset-1 bg-gradient-to-tr from-zinc-800 to-gray-700 rounded-3xl" />
                    <div className="absolute top-2 left-3 w-12 h-12 bg-white/20 rounded-full blur-2xl" />
                    <div className={`absolute inset-0 flex items-center justify-center text-6xl font-black
                      ${lastRoll === 1 ? "text-red-500" : lastRoll === 20 ? "text-emerald-400" : lastRoll ? "text-gray-300" : "text-gray-500"}`}>
                      {lastRoll || "d20"}
                    </div>
                  </div>
                </button>

                <div className="flex flex-col gap-4">
                  {[0,1,2].map(i => (
                    <button key={i} onClick={() => toggleSave("success", i)}
                      className={`w-14 h-14 rounded-full border-4 transition-all ${deathSaves.success > i ? "bg-emerald-600 border-emerald-400 shadow-xl shadow-emerald-600/70" : "bg-gray-900 border-gray-700"}`} />
                  ))}
                </div>
              </div>
              <div className={`text-3xl font-black mt-6 ${deathSaves.fail >= 3 ? "text-red-600" : deathSaves.success >= 3 ? "text-emerald-500" : "text-gray-500"}`}>
                {deathSaves.fail >= 3 ? "МЁРТВ" : deathSaves.success >= 3 ? "СТАБИЛИЗИРОВАН" : "СПАСБРОСОК"}
              </div>
            </div>
          )}

          {/* ЗЕЛЬЯ + ШЕСТЕРЁНКА */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            <button onClick={() => setShowSettings(s => !s)}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-4 hover:border-yellow-500 hover:scale-110 transition-all shadow-xl">
              <div className="text-4xl">⚙️</div>
            </button>

            {[
              { dice: 2, bonus: 2, color: "from-red-600 to-red-800", height: "h-16" },
              { dice: 4, bonus: 4, color: "from-orange-600 to-red-700", height: "h-20" },
              { dice: 8, bonus: 8, color: "from-amber-500 to-orange-600", height: "h-24" },
              { dice: 10, bonus: 20, color: "from-yellow-400 to-amber-500", height: "h-28" }
            ].map((p, i) => (
              <button key={i} onClick={() => {
                let res = p.bonus;
                for (let j = 0; j < p.dice; j++) res += Math.floor(Math.random() * 4) + 1;
                setInput(res.toString());
              }} className={`relative group ${p.height} w-16 transform-gpu transition-all duration-300 hover:scale-125 active:scale-95`}>
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl border-4 border-white/30">
                  <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${p.color} opacity-95 ${p.height === "h-16" ? "h-10" : p.height === "h-20" ? "h-14" : p.height === "h-24" ? "h-18" : "h-24"} rounded-b-full`} />
                  {i >= 2 && <div className="absolute top-3 left-3 w-2 h-2 bg-white/50 rounded-full animate-float" />}
                  <div className="absolute top-1 left-2 w-4 h-8 bg-white/30 rounded-full blur-xl" />
                </div>
                <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-4 rounded-t-full ${i === 3 ? "bg-yellow-900 border-2 border-yellow-600" : "bg-red-900"} shadow-lg`} />
              </button>
            ))}
          </div>

          <input value={input} onChange={e => setInput(e.target.value.replace(/\D/g,""))} placeholder="0"
            className="w-full bg-black/80 border-4 border-red-800 rounded-2xl text-5xl text-center py-4 font-black text-red-400 mb-4 placeholder-gray-600" autoFocus />

          <div className="grid grid-cols-3 gap-3 mb-4">
            {["7","8","9","4","5","6","1","2","3","C","0","Backspace"].map(k => (
              <button key={k} onClick={() => handleKey(k)}
                className="h-14 text-2xl font-black rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 border-2 border-gray-700">
                {k === "Backspace" ? "Backspace" : k}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => applyDamageOrHeal(-Number(input))}
              className="bg-gradient-to-r from-red-800 to-red-900 py-6 rounded-2xl text-xl font-black hover:from-red-700 active:scale-95 shadow-2xl">УРОН</button>
            <button onClick={addTempHp}
              className="bg-gradient-to-r from-purple-700 to-indigo-800 py-6 rounded-2xl text-xl font-black hover:from-purple-600 active:scale-95 shadow-2xl">ВРЕМЕН.</button>
            <button onClick={() => applyDamageOrHeal(Number(input))}
              className="bg-gradient-to-r from-emerald-700 to-green-800 py-6 rounded-2xl text-xl font-black hover:from-emerald-600 active:scale-95 shadow-2xl">ЛЕЧЕНИЕ</button>
          </div>
        </div>

        {/* НАСТРОЙКИ — КАК ТЫ ХОТЕЛ */}
        {showSettings && (
          <div className="bg-gradient-to-b from-yellow-950 to-black border-4 border-yellow-600 rounded-3xl p-6 w-80 shadow-2xl">
            <h3 className="text-3xl font-black text-yellow-400 text-center mb-6">Настройки</h3>

            <div className="space-y-6">
              {/* МАКСИМАЛЬНЫЕ ХИТЫ */}
              <div>
                <div className="text-yellow-300 text-center mb-2 text-lg">Максимальные хиты</div>
                <input type="number" value={char.hp.max} onChange={e => setChar(c => c ? {...c, hp: {...c.hp, max: Number(e.target.value) || 1}} : c)}
                  className="w-full bg-black/80 border-4 border-yellow-600 rounded-2xl text-5xl text-center py-4 font-black text-yellow-400" />
              </div>

              {/* БОНУС К МАКСИМАЛЬНЫМ */}
              <div>
                <div className="text-yellow-300 text-center mb-2 text-lg">Бонус к макс.</div>
                <input type="number" value={char.hp.bonusMax || 0} onChange={e => setChar(c => c ? {...c, hp: {...c.hp, bonusMax: Number(e.target.value)||0}} : c)}
                  className="w-full bg-black/80 border-4 border-yellow-600 rounded-2xl text-5xl text-center py-4 font-black text-yellow-400" />
              </div>

              {/* КОСТЬ ХИТОВ */}
              <div>
                <div className="text-yellow-300 text-center mb-2 text-lg">Кость хитов</div>
                <select value={char.hitDie || 8} onChange={e => setChar(c => c ? {...c, hitDie: Number(e.target.value) as 6|8|10|12} : c)}
                  className="w-full bg-black/80 border-4 border-yellow-600 rounded-2xl text-5xl text-center py-4 font-black text-yellow-400">
                  <option value={6}>d6</option>
                  <option value={8}>d8</option>
                  <option value={10}>d10</option>
                  <option value={12}>d12</option>
                </select>
              </div>

              <div className="text-center text-yellow-300 pt-4">
                Временные хиты: <span className="text-5xl font-black">{tempHp}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────── МОДАЛКА МОНЕТ ──────────────────────
function CoinsModal({ 
  char, 
  setChar, 
  onClose,
  coinType,
  setCoinType
}: { 
  char: Character; 
  setChar: React.Dispatch<React.SetStateAction<Character | null>>; 
  onClose: () => void;
  coinType: "gp" | "sp" | "cp" | "pp" | "ep";
  setCoinType: React.Dispatch<React.SetStateAction<"gp" | "sp" | "cp" | "pp" | "ep">>;
}) {
  const [amount, setAmount] = useState("");

  const rates = { gp: 1, sp: 0.1, cp: 0.01, pp: 10, ep: 0.5 };
  const labels = { gp: "Золото", sp: "Серебро", cp: "Медь", pp: "Платина", ep: "Электрум" };

  const totalGold = Object.entries(char.coins).reduce(
    (sum, [t, v]) => sum + v * rates[t as keyof typeof rates], 0
  );

  const add = () => { if (amount) { setChar(c => c ? { ...c, coins: { ...c.coins, [coinType]: c.coins[coinType] + Number(amount) } } : c); setAmount(""); }};
  const remove = () => { if (amount) { setChar(c => c ? { ...c, coins: { ...c.coins, [coinType]: Math.max(0, c.coins[coinType] - Number(amount)) } } : c); setAmount(""); }};

  const input = (k: string) => {
    if (k === "C") setAmount("");
    else if (k === "←") setAmount(a => a.slice(0, -1));
    else if (/\d/.test(k)) setAmount(a => a + k);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className="bg-black border-4 border-yellow-600 rounded-2xl w-full max-w-sm p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Заголовок + итог */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-yellow-400">Кошелёк</h3>
          <div className="text-right">
            <div className="text-xs text-yellow-300">Всего:</div>
            <div className="text-lg font-bold text-yellow-400">{totalGold.toFixed(1)} ЗМ</div>
          </div>
        </div>

        {/* 5 монет — маленькие */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {(["gp","sp","cp","pp","ep"] as const).map(t => (
            <button
              key={t}
              onClick={() => setCoinType(t)}
              className={`p-2 rounded-lg text-left text-sm font-bold transition-all ${
                coinType === t ? "bg-yellow-600 text-black" : "bg-gray-800 text-gray-300"
              }`}
            >
              {labels[t]}: {char.coins[t].toLocaleString()}
            </button>
          ))}
        </div>

        {/* Ввод */}
        <input
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))}
          placeholder="0"
          className="w-full bg-gray-900 border-2 border-yellow-600 rounded-lg text-2xl text-center font-bold py-3 mb-3 text-yellow-400"
          autoFocus
        />

        {/* Калькулятор — мини */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[7,8,9,4,5,6,1,2,3,"C",0,"←"].map(k => (
            <button key={k} onClick={() => input(k as string)}
              className="h-12 text-lg font-bold rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-700"
            >{k}</button>
          ))}
        </div>

        {/* Кнопки */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={remove} className="bg-red-600 py-3 rounded-lg font-bold text-lg">− Забрать</button>
          <button onClick={add} className="bg-green-600 py-3 rounded-lg font-bold text-lg">+ Добавить</button>
        </div>

        <button onClick={onClose} className="w-full mt-4 bg-gray-700 py-3 rounded-lg text-lg font-bold">
          Закрыть
        </button>
      </div>
    </div>
  );
}