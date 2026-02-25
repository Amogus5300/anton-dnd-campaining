"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';

// Создаём обёртку для PDF функции
const PDFButton = dynamic(
  () => import("@/components/CharacterPDF").then(mod => {
    // Возвращаем компонент, который использует функцию generatePDF
    const PDFButtonComponent = ({ char, onComplete }: { char: Character, onComplete?: () => void }) => {
      return (
        <button
          onClick={async () => {
            await mod.generatePDF(char);
            onComplete?.();
          }}
          className="px-6 py-3 text-sm font-black text-pink-400 hover:bg-pink-600 hover:text-black transition rounded-lg border-2 border-pink-600/50 hover:border-pink-500 shadow-lg active:scale-95"
        >
          Скачать .pdf
        </button>
      );
    };
    return PDFButtonComponent;
  }),
  { ssr: false }
);

// ... остальной код

// import DiceButton from "@/components/DiceButton"; // если есть — раскомментируй

// В самом верху файла, замените этот импорт:
// import { generatePDF } from "@/components/CharacterPDF"

const mod = (v: number) => Math.floor((v - 10) / 2);

export type Stat = "str" | "dex" | "con" | "int" | "wis" | "cha";

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

export interface Character {
  id: string;
  name: string;
  avatar: string;
  race?: string;
  class?: string;
  subclass?: string;
  level: number;
  experience: number;
  stats: Record<Stat, number>;
  saves: Record<Stat | "reaction", boolean>;
  skills: Record<SkillKey, "none" | "prof" | "expert">;
  ac: number;
  shield: boolean;
  shieldValue?: number | null;
  speed: number;
  initiative: number;
  hp: { max: number; current: number; temp: number; bonusMax: number };
  hitDie?: 6 | 8 | 10 | 12;
  hitDieSpent?: number;
  coins: { gp: number; sp: number; cp: number; pp: number; ep: number };
  reactionProf?: "none" | "prof" | "expert";
  features?: string[];
  deathSaves?: { success: number; fail: number };
  profBonusDelta?: number | null;
  inspiration?: number;
  exhaustion?: number;
  playerName?: string;
  background?: string;
  attackNotes?: string;
  abilityNotes?: string;
}; const skillStatMap = {
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
  { stat: "dex" as const, label: "ЛОВКОСТЬ", skills: ["acrobatics", "sleightOfHand", "stealth"] },
  { stat: "con" as const, label: "ТЕЛОСЛОЖЕНИЕ", skills: [] },
  { stat: "int" as const, label: "ИНТЕЛЛЕКТ", skills: ["arcana", "history", "investigation", "nature", "religion"] },
  { stat: "wis" as const, label: "МУДРОСТЬ", skills: ["animalHandling", "insight", "medicine", "perception", "survival"] },
  { stat: "cha" as const, label: "ХАРИЗМА", skills: ["deception", "intimidation", "performance", "persuasion"] }
];

const getAutoProfBonus = (level: number): number => {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
};

const xpTable: Record<number, number> = {
  1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000, 8: 34000,
  9: 48000, 10: 64000, 11: 85000, 12: 100000, 13: 120000, 14: 140000,
  15: 165000, 16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
};

const getXpNeededForLevel = (lvl: number) => lvl <= 20 ? (xpTable[lvl] ?? 355000) : 355000;
const getXpNeededForNextLevel = (lvl: number) => lvl >= 20 ? Infinity : getXpNeededForLevel(lvl + 1);
const getXpProgressPercent = (char: Character) => {
  if (!char || char.level >= 20) return 100;
  const current = getXpNeededForLevel(char.level);
  const next = getXpNeededForNextLevel(char.level);
  if (next === Infinity) return 100;
  const progress = Math.max(0, char.experience - current);
  const needed = next - current;
  return needed > 0 ? Math.min(100, (progress / needed) * 100) : 100;
};

type Weapon = {
  id: string;
  name: string;
  bonus: string;
  damage: string;
  note: string;
  attackStat?: Stat | "none";
  proficient?: boolean;
  showNote?: boolean;  // ← новое поле (чекбокс)
};

export default function CharacterSheet() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [autoHideRolls, setAutoHideRolls] = useState(false);
  const [fadeStartSec, setFadeStartSec] = useState(1);
  const [fadeDurationSec, setFadeDurationSec] = useState(1);

  const [char, setChar] = useState<Character | null>(null);
  const [inspiration, setInspiration] = useState(0);
  const [exhaustion, setExhaustion] = useState(0);
  const [diceHistory, setDiceHistory] = useState<any[]>([]);
  const [attackRolls, setAttackRolls] = useState<Array<{
    id: string;
    total: number;
    d20: number;
    bonus: number;
    weaponName: string;
  }>>([]);
  const [damageRoll, setDamageRoll] = useState<{
  text: string;
  total: number;
  rolls: number[];
} | null>(null);
  const [showFullSettings, setShowFullSettings] = useState(false);
  const [showXpCalculator, setShowXpCalculator] = useState(false);
  const [showHpModal, setShowHpModal] = useState(false);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showExperimental, setShowExperimental] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showInspirationInput, setShowInspirationInput] = useState(false);
  const [showExhaustionMenu, setShowExhaustionMenu] = useState(false);
  const [showConditionsMenu, setShowConditionsMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"атаки" | "способности" | "снаряжение" | "личность" | "цели" | "заметки" | "заклинания">("атаки");
  const [hpModalSource, setHpModalSource] = useState<"header" | "rest" | null>(null);
  const [tempSelectedDice, setTempSelectedDice] = useState(0);
  const [isUnlockMode, setIsUnlockMode] = useState(false);
  const [coinType, setCoinType] = useState<"gp" | "sp" | "cp" | "pp" | "ep">("gp");
  const [inspirationInput, setInspirationInput] = useState("");
  const [xpInput, setXpInput] = useState("");
  const [showXpManual, setShowXpManual] = useState(false);
  const [restTab, setRestTab] = useState<"short" | "long">("short");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Список состояний D&D 5e
const CONDITIONS = [
  { id: "unconscious", name: "Бессознательный", short: "Бессозн", desc: "Недееспособен. Падает ничком. Автоматически проваливает спасброски Силы и Ловкости. Атаки в ближнем бою — автоматический критический удар." },
  { id: "frightened",  name: "Испуганный",     short: "Испуг",   desc: "Преимущество на атаки и проверки того, кто пугает. Твои атаки и проверки способностей с помехой, если источник страха виден." },
  { id: "exhaustion",  name: "Истощённый",     short: "Истощ",   desc: "Уровни истощения. Каждый уровень даёт помеху на проверки характеристик. На 6 уровне — смерть." },
  { id: "invisible",   name: "Невидимый",      short: "Невидим", desc: "Тебя нельзя увидеть без специальных средств. Атаки по тебе с помехой, твои атаки с преимуществом." },
  { id: "incapacitated", name: "Недееспособный", short: "Недеесп",  desc: "Не можешь совершать действия и реакции." },
  { id: "deafened",    name: "Оглушённый",     short: "Оглуш",  desc: "Не слышит. Автоматически проваливает все проверки, требующие слуха." },
  { id: "petrified",   name: "Окаменевший",    short: "Окамен",  desc: "Превращён в камень. Недееспособен, невосприимчив к яду и болезням." },
  { id: "restrained",  name: "Опутанный",      short: "Опут",    desc: "Скорость = 0. Атаки по тебе с преимуществом, твои атаки с помехой. Помеха на спасброски Ловкости." },
  { id: "blinded",     name: "Ослеплённый",    short: "Ослепл",  desc: "Не видит. Автоматически проваливает проверки, требующие зрения. Атаки по тебе с преимуществом, твои — с помехой." },
  { id: "poisoned",    name: "Отравленный",    short: "Отрав",   desc: "Помеха на броски атаки и проверки способностей." },
  { id: "charmed",     name: "Очарованный",    short: "Очар",    desc: "Не может атаковать того, кто очаровал, и не может наносить ему вред. Очаровавший имеет преимущество на социальные проверки." },
  { id: "stunned",     name: "Ошеломлённый",   short: "Ошеломл",    desc: "Недееспособен. Не может двигаться. Автоматически проваливает спасброски Силы и Ловкости." },
  { id: "paralyzed",   name: "Парализованный", short: "Парал",   desc: "Недееспособен. Не может двигаться и говорить. Автоматически проваливает спасброски Силы и Ловкости. Атаки в ближнем бою — критический удар." },
  { id: "prone",       name: "Сбитый с ног",   short: "Лежит",   desc: "Можно только ползти. Вставание стоит половину скорости. Атаки в ближнем бою по тебе с преимуществом, дальние — с помехой." },
  { id: "grappled",    name: "Схваченный",     short: "Схвач",   desc: "Скорость = 0. Заканчивается, если схвативший incapacitated или если тебя вытащили из досягаемости." },
];

useEffect(() => {
  const savedWeapons = localStorage.getItem(`weapons_${id}`); // id — это params.id персонажа
  if (savedWeapons) {
    try {
      const parsed = JSON.parse(savedWeapons);
      setWeapons(parsed);
    } catch (e) {
      console.error("Ошибка загрузки оружия:", e);
    }
  }
}, [id]); // перезагружаем при смене персонажа

// Для вкладки "атаки"
const [weapons, setWeapons] = useState<Weapon[]>([]);

useEffect(() => {
  if (weapons.length > 0) { // не сохраняем пустой массив
    localStorage.setItem(`weapons_${id}`, JSON.stringify(weapons));
  } else {
    localStorage.removeItem(`weapons_${id}`); // если удалили все — чистим хранилище
  }
}, [weapons, id]);

const [editingWeaponId, setEditingWeaponId] = useState<string | null>(null);
const [showWeaponModal, setShowWeaponModal] = useState(false);
const [attackRoll, setAttackRoll] = useState<{
  total: number;
  d20: number;
  bonus: number;
  weaponName: string;
} | null>(null);

type RollEntry =
  | {
      id: string;
      type: "cube";
      text: string;
      roll: number;
      bonus: number;
      total: number;
    }
  | {
      id: string;
      type: "attack";
      d20: number;
      bonus: number;
      total: number;
      weaponName: string;
    }
  | {
      id: string;
      type: "damage";
      damageText: string;
      damageRolls: number[];
      total: number;
    };

const [allRolls, setAllRolls] = useState<RollEntry[]>([]);
// Состояния активные (массив id)
const [activeConditions, setActiveConditions] = useState<string[]>([]);

const getWeaponAttackBonus = (weapon: Weapon, char: Character, profBonus: number) => {
  let total = 0;

  // 1. Бонус характеристики + владение (если не указано "none")
  if (weapon.attackStat && weapon.attackStat !== "none") {
    const statMod = mod(char.stats[weapon.attackStat]);
    const prof = weapon.proficient ? profBonus : 0;
    total += statMod + prof;
  }

  // 2. Доп. модификатор (если пользователь что-то ввёл)
  if (weapon.bonus && weapon.bonus.trim() !== "") {
    const manualBonus = Number(weapon.bonus.replace(/[^0-9-]/g, "")) || 0;
    total += manualBonus;
  }

  // Форматируем результат
  if (total === 0) return "—";
  return total >= 0 ? `+${total}` : `${total}`;
};



const addWeapon = () => {
  const newWeapon: Weapon = {
    id: crypto.randomUUID(),
    name: "Новое оружие",
    bonus: "",
    damage: "",
    note: "",
    showNote: false,        // ← добавили
    attackStat: "none",
    proficient: false,
  };
  setWeapons(prev => [...prev, newWeapon]);
  setEditingWeaponId(newWeapon.id);
  setShowWeaponModal(true);
};

const removeWeapon = (id: string) => {
  setWeapons(prev => prev.filter(w => w.id !== id));
};

const updateWeapon = (id: string, field: keyof Weapon, value: any) => {
  setWeapons(prev =>
    prev.map(w =>
      w.id === id ? { ...w, [field]: value } : w
    )
  );
};

// Для показа описания конкретного состояния
const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);

  // Проверка авторизации

  // Загрузка персонажа
  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`character_${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChar(parsed);
        setInspiration(parsed.inspiration || 0);
        setExhaustion(parsed.exhaustion || 0);
      } catch (e) {
        console.error("Ошибка загрузки", e);
      }
    } else {
      const defaultChar: Character = {
        id,
        name: "Новый герой",
        avatar: "",
        race: "Человек",
        class: "Воин",
        level: 1,
        experience: 0,
        stats: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false, reaction: false },
        skills: Object.fromEntries(Object.keys(skillLabels).map(k => [k, "none"])) as Record<SkillKey, "none" | "prof" | "expert">,
        ac: 10,
        shield: false,
        speed: 30,
        initiative: 0,
        hp: { max: 10, current: 10, temp: 0, bonusMax: 0 },
        hitDie: 10,
        hitDieSpent: 0,
        coins: { gp: 15, sp: 0, cp: 0, pp: 0, ep: 0 },
        features: [],
      };
      localStorage.setItem(`character_${id}`, JSON.stringify(defaultChar));
      setChar(defaultChar);
    }
  }, [id]);

  // Автосейв
  useEffect(() => {
    if (char) {
      const savedChar = { ...char, inspiration, exhaustion };
      localStorage.setItem(`character_${id}`, JSON.stringify(savedChar));
    }
  }, [char, inspiration, exhaustion, id]);

  const tempHp = char?.hp.temp || 0;

  if (!char) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center">
        <p className="text-4xl text-gray-400">ВОСКРЕШЕНИЕ ЦАРЯ...</p>
      </div>
    );
  }

  const profBonus = getAutoProfBonus(char.level) + (char.profBonusDelta ?? 0);

  const getSkillBonus = (skill: SkillKey) => {
    const stat = skillStatMap[skill];
    const proficiency = char.skills[skill];
    const base = mod(char.stats[stat]);
    if (proficiency === "prof") return base + profBonus;
    if (proficiency === "expert") return base + profBonus * 2;
    return base;
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Общий бросок кубика (для характеристик, навыков и т.д.)
const rollD20 = (bonus: number, text: string, options: { disadvantage?: boolean } = {}) => {
  let rolls: number[] = [];
  let finalRoll = 0;
  let hasDisadvantage = options.disadvantage || false;

  if (exhaustion >= 1 && text.includes("характеристик")) hasDisadvantage = true;
  if (exhaustion >= 3 && (text.includes("атаки") || text.includes("спасброск"))) hasDisadvantage = true;

  if (hasDisadvantage) {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    rolls = [r1, r2];
    finalRoll = Math.min(r1, r2);
  } else {
    finalRoll = Math.floor(Math.random() * 20) + 1;
    rolls = [finalRoll];
  }

  const inspirationBonus = inspiration > 0 ? inspiration : 0;
  const total = finalRoll + bonus + inspirationBonus;

     const entry: RollEntry = {
    id: crypto.randomUUID(),
    type: "cube",
    text,
    roll: finalRoll,
    bonus: bonus + inspirationBonus,
    total
  };

  setAllRolls(prev => {
    const updated = [...prev, entry];
    return updated.length > 5 ? updated.slice(1) : updated;
  });
};

const rollWeaponAttack = (weapon: Weapon) => {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const bonusStr = getWeaponAttackBonus(weapon, char!, profBonus);
  const bonus = Number(bonusStr.replace(/[^0-9-]/g, "")) || 0;
  const total = d20 + bonus;

  const entry: RollEntry = {
    id: crypto.randomUUID(),
    type: "attack",
    d20,
    bonus,
    total,
    weaponName: weapon.name || "Оружие"
  };

  setAllRolls(prev => {
    const updated = [...prev, entry];
    return updated.length > 5 ? updated.slice(1) : updated;
  });
};

const rollWeaponDamage = (weapon: Weapon) => {
  if (!weapon.damage) return;

  const match = weapon.damage.match(/(\d+)[кd](\d+)/i);
  if (!match) {
    const entry: RollEntry = {
      id: crypto.randomUUID(),
      type: "damage",
      damageText: weapon.damage,
      damageRolls: [],
      total: 0
    };
    setAllRolls(prev => {
      const updated = [...prev, entry];
      return updated.length > 5 ? updated.slice(1) : updated;
    });
    return;
  }

  const count = parseInt(match[1], 10);
  const die = parseInt(match[2], 10);

  let rolls: number[] = [];
  let total = 0;

  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * die) + 1;
    rolls.push(roll);
    total += roll;
  }

  const entry: RollEntry = {
    id: crypto.randomUUID(),
    type: "damage",
    damageText: weapon.damage,
    damageRolls: rolls,
    total
  };

  setAllRolls(prev => {
    const updated = [...prev, entry];
    return updated.length > 5 ? updated.slice(1) : updated;
  });
};
  
  const addXp = (amount: number) => {
    if (!char) return;
    setChar(prev => prev ? { ...prev, experience: Math.max(0, prev.experience + amount) } : prev);
    setXpInput("");
  };

  const handleXpInput = (key: string | number) => {
    if (key === "C") {
      setXpInput("");
    } else if (key === "←" || key === "Backspace") {
      setXpInput(prev => prev.slice(0, -1));
    } else if (typeof key === "string" || typeof key === "number") {
      setXpInput(prev => prev + key);
    }
  };

  const canLevelUp = (): boolean => 
    char !== null && char.level < 20 && char.experience >= getXpNeededForNextLevel(char.level);

  const handleLevelUpDown = () => {
  if (!char) return;

  if (canLevelUp()) {
    // Повышение уровня (как было)
    let newLevel = char.level + 1;
    while (newLevel <= 20 && char.experience >= getXpNeededForNextLevel(newLevel - 1)) {
      newLevel++;
    }
    setChar(prev => prev ? { ...prev, level: Math.min(20, newLevel - 1) } : prev);
  } else {
    // Понижение уровня
    let newLevel = char.level - 1;
    while (newLevel >= 1 && char.experience < getXpNeededForLevel(newLevel)) {
      newLevel--;
    }
    // Если опыта хватает хотя бы на 1 уровень — устанавливаем его
    if (newLevel >= 1) {
      setChar(prev => prev ? { ...prev, level: newLevel } : prev);
    } else {
      // Если опыта даже на 1 уровень не хватает — ставим 1 и обнуляем опыт (опционально)
      setChar(prev => prev ? { ...prev, level: 1, experience: 0 } : prev);
    }
  }
};

  const renderStatWithSkills = (stat: Stat | "reaction") => {
  if (!char) return null;

  const isReaction = stat === "reaction";
  const value = isReaction 
    ? Math.floor((char.stats.dex + char.stats.int + char.stats.wis) / 3)
    : char.stats[stat as Stat];
  const modifier = mod(value);

  const saveBonus = isReaction
    ? modifier + (char.reactionProf === "prof" ? profBonus : char.reactionProf === "expert" ? profBonus * 2 : 0)
    : (char.saves[stat as Stat] ? modifier + profBonus : modifier);

  const toggleSaveProf = () => {
    if (isReaction) {
      setChar(c => c ? {
        ...c,
        reactionProf: (c.reactionProf || "none") === "none" 
          ? "prof" 
          : (c.reactionProf || "none") === "prof" 
            ? "expert" 
            : "none"
      } : c);
    } else {
      setChar(c => c ? { 
        ...c, 
        saves: { ...c.saves, [stat as Stat]: !c.saves[stat as Stat] } 
      } : c);
    }
  };

  const statLabel = stat === "str" ? "СИЛА"
    : stat === "dex" ? "ЛОВКОСТЬ"
    : stat === "con" ? "ТЕЛОСЛОЖЕНИЕ"
    : stat === "int" ? "ИНТЕЛЛЕКТ"
    : stat === "wis" ? "МУДРОСТЬ"
    : stat === "cha" ? "ХАРИЗМА"
    : "РЕАКЦИЯ";

  const statFullName = stat === "str" ? "Сила"
    : stat === "dex" ? "Ловкость"
    : stat === "con" ? "Телосложение"
    : stat === "int" ? "Интеллект"
    : stat === "wis" ? "Мудрость"
    : stat === "cha" ? "Харизма"
    : "Реакция";

  return (
    <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-4 border-4 border-purple-800 shadow-2xl">

      {/* ВЕРХ: НАЗВАНИЕ + ЗНАЧЕНИЕ В ОДНОЙ СТРОКЕ */}
      <div className="flex items-center justify-between mb-3">
        <div className={`text-xl font-black ${isReaction ? "text-orange-400" : "text-purple-300"}`}>
          {statLabel}
        </div>

        {isReaction ? (
          <div className="text-4xl font-black text-orange-300">{value}</div>
        ) : (
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const v = Math.max(1, Math.min(30, Number(e.target.value) || 10));
              setChar(c => c ? { ...c, stats: { ...c.stats, [stat]: v } } : c);
            }}
            className="w-20 bg-gray-900 text-center text-4xl font-black rounded-xl outline-none focus:ring-4 focus:ring-purple-600"
          />
        )}
      </div>
      {/* СПАСБРОСОК + ПРОВЕРКА — МАЛЕНЬКИЕ */}
      {!isReaction && (
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {/* Проверка */}
          <button
            onClick={() => rollD20(modifier, `Проверка ${statFullName}`)}
            className="bg-gray-900/70 hover:bg-purple-900/60 rounded-lg px-3 py-2 flex items-center justify-between border border-purple-900 hover:border-purple-500 active:scale-95 transition-all"
          >
            <span className="text-xs text-gray-400">проверка</span>
            <span className="text-lg font-black text-purple-300">
              {modifier >= 0 ? "+" : ""}{modifier}
            </span>
          </button>

          {/* Спасбросок */}
          <div className="flex items-center justify-between bg-gray-900/70 hover:bg-emerald-900/50 rounded-lg px-3 py-2 border border-emerald-900 hover:border-emerald-500">
            <span className="text-xs text-gray-400">спас</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => rollD20(saveBonus, `Спасбросок ${statFullName}`)}
                className="text-lg font-black text-emerald-300"
              >
                {saveBonus >= 0 ? "+" : ""}{saveBonus}
              </button>
              <button
                onClick={toggleSaveProf}
                className={`w-5 h-5 rounded-full border-2 text-[9px] font-bold flex items-center justify-center transition-all
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

      {/* Реакция — отдельно */}
      {isReaction && (
        <button
          onClick={() => rollD20(saveBonus, "Спасбросок реакции")}
          className="w-full bg-gray-900/70 hover:bg-orange-900/50 rounded-lg px-3 py-2.5 flex items-center justify-between text-sm border-2 border-orange-800 hover:border-orange-500 active:scale-95 mb-3"
        >
          <span className="font-bold text-orange-300">Спасбросок реакции</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-orange-300">
              {saveBonus >= 0 ? "+" : ""}{saveBonus}
            </span>
            <div
              onClick={(e) => { e.stopPropagation(); toggleSaveProf(); }}
              className={`w-8 h-8 rounded-full border-3 text-xs font-bold transition-all
                ${char.reactionProf === "expert" ? "bg-yellow-600 border-yellow-400 text-black"
                  : char.reactionProf === "prof" ? "bg-orange-700 border-orange-400 text-white"
                  : "bg-gray-800 border-gray-600 text-gray-500"
                }`}
            >
              {char.reactionProf === "expert" ? "2×" : char.reactionProf === "prof" ? " " : "–"}
            </div>
          </div>
        </button>
      )}

      {/* НАВЫКИ — В 2 РАЗА МЕНЬШЕ */}
      {statsConfig.find(c => c.stat === stat)?.skills.map(sk => {
        const bonus = getSkillBonus(sk as SkillKey);
        const prof = char.skills[sk as SkillKey];

        return (
          <div
            key={sk}
            onClick={() => rollD20(bonus, skillLabels[sk as SkillKey])}
            className="w-full bg-gray-900/70 hover:bg-purple-900/60 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs border border-purple-900 hover:border-purple-500 active:scale-95 cursor-pointer group mt-1.5"
          >
            <span className="font-medium">{skillLabels[sk as SkillKey]}</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-cyan-300">
                {bonus >= 0 ? "+" : ""}{bonus}
              </span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  const current = char.skills[sk as SkillKey];
                  const next = current === "none" ? "prof" : current === "prof" ? "expert" : "none";
                  setChar(c => c ? { ...c, skills: { ...c.skills, [sk]: next } } : c);
                }}
                className={`w-6 h-6 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer
                  ${prof === "expert" ? "bg-yellow-600 border-yellow-400 text-black shadow-lg"
                    : prof === "prof" ? "bg-emerald-700 border-emerald-400 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-500"
                  } group-hover:scale-125 active:scale-110`}
              >
                {prof === "expert" ? "2" : prof === "prof" ? " " : "–"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

}

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white relative">

      {/* ВЕРХНЯЯ ПОЛОСА — ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ, ВЕЧНАЯ ВЕРСИЯ */}
      <div className="bg-black/50 backdrop-blur-2xl border-b-8 border-yellow-600 shadow-2xl py-8 relative">

        {/* ЛЕВЫЙ ВЕРХНИЙ УГОЛ — КНОПКИ НАЗАД */}
<div className="absolute top-6 left-6 flex gap-4 z-50">
  {/* Главное меню — домик */}
  <button
    onClick={() => router.replace("/")}  // ← Домой, на главную (или куда у тебя главное меню)
    className="w-14 h-14 bg-black/80 border-4 border-yellow-600 rounded-2xl flex items-center justify-center hover:bg-yellow-600 hover:text-black transition-all shadow-2xl"
    title="Главное меню"
  >
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>
  </button>

  {/* Кнопка «Назад к выбору персонажей» — ГАРАНТИРОВАННО РАБОТАЕТ */}
<button
  onClick={() => {
    // Принудительно переходим на /players, заменяя текущую страницу
    window.location.href = "/characters";
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
                      <span className="text-6xl font-black text-yellow-500"> </span>
                    </div>
                  )}
                </div>
              </div>

              {/* МЕНЮ ПОРТРЕТА — ПОРЯДОК: НАСТРОЙКИ → СМЕНЫ ПОРТРЕТА → ВСЁ РАБОТАЕТ */}
              {/* КОМПАКТНОЕ МЕНЮ ПОРТРЕТА — НЕ ВЫЛЕЗАЕТ ЗА ГРАНИЦЫ */}
              {showAvatarMenu && (
  <div className="absolute left-full top-0 h-full flex items-center ml-4 z-50 pointer-events-none">
    <div className="bg-black/95 border-4 border-yellow-600 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto w-64 min-w-[256px]">
      {/* Общий контейнер с фиксированной шириной + центрирование */}
      <div className="p-2 flex flex-col gap-2">
        {/* Кнопка Настройки */}
        <button
          onClick={() => { setShowFullSettings(true); setShowAvatarMenu(false); }}
          className="px-6 py-3 text-sm font-black text-yellow-400 hover:bg-yellow-600 hover:text-black transition-all duration-300 rounded-lg border-2 border-yellow-600/50 relative overflow-hidden group w-full"
        >
          <span className="relative z-10">Настройки</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          <div className="absolute inset-0 bg-yellow-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>

        {/* Кнопка Загрузить портрет */}
        <button
          onClick={() => { fileInputRef.current?.click(); setShowAvatarMenu(false); }}
          className="px-6 py-3 text-sm font-black text-cyan-400 hover:bg-cyan-600 hover:text-black transition-all duration-300 rounded-lg border-2 border-cyan-600/50 relative overflow-hidden group w-full"
        >
          <span className="relative z-10">Загрузить портрет</span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          <div className="absolute inset-0 bg-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>

        {/* Кнопка Экспериментальные функции (как было, но теперь унифицирована) */}
        <button
          onClick={() => setShowExperimental(true)}
          className="px-6 py-3 text-sm font-black text-pink-400 hover:bg-pink-600 hover:text-black transition-all duration-300 rounded-lg border-2 border-pink-600/50 relative overflow-hidden group w-full"
        >
          <span className="relative z-10">Экспериментальные функции</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          <div className="absolute inset-0 bg-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>
      </div>
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
    <div 
      className="absolute h-8 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-full mx-14 transition-all duration-1000"
      style={{ width: `${getXpProgressPercent(char)}%` }}  
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
{/* ЭФФЕКТЫ ИСТОЩЕНИЯ — АВТОМАТИЧЕСКИЕ */}
<div className="absolute top-4 right-4 text-right space-y-1 text-xs font-bold">
  {exhaustion >= 2 && exhaustion < 5 && (
    <div className="text-orange-400 animate-pulse">
      Скорость: {Math.floor(char.speed / 2)} фт (вдвое)
    </div>
  )}
  {exhaustion >= 4 && exhaustion < 5 && (
    <div className="text-red-500 animate-pulse">
      Макс. ХП: {Math.floor(char.hp.max / 2)}
    </div>
  )}
  {exhaustion >= 5 && exhaustion < 6 && (
    <div className="text-red-600 animate-pulse text-lg">
      СКОРОСТЬ = 0
    </div>
  )}
  {exhaustion >= 6 && (
    <div className="text-red-800 text-2xl font-black animate-ping">
      ☠️ СМЕРТЬ ☠️
    </div>
  )}
</div>
    {/* 2. СКОРОСТЬ */}
    <button onClick={() => setShowFullSettings(true)} className="bg-black/70 rounded-xl p-2 border-2 border-cyan-700 text-center hover:scale-105 transition text-xs">
      <div className="text-cyan-300 font-bold">СКОР.</div>
      <div className="text-3xl font-black">
  {exhaustion >= 5 ? 0 : exhaustion >= 2 ? Math.floor(char.speed / 2) : char.speed} фт
</div>
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

    {/* 5. ОТДЫХ — ОТКРЫВАЕТ МОДАЛКУ */}
<button 
  onClick={() => setShowRestModal(true)}
  className="bg-black/70 rounded-xl p-2 border-2 border-orange-600 text-center hover:scale-110 transition relative overflow-hidden group"
>
  <div className="relative z-10 flex justify-center items-center h-full text-2xl">
    ☀️ 🌙
  </div>
  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-purple-800/20 group-hover:from-yellow-600/40 group-hover:to-purple-800/40 transition"></div>
</button>

    {/* 6. ЗДОРОВЬЕ — ПОЛНОСТЬЮ ИСПРАВЛЕНО: ВРЕМЕННЫЕ ВИДНЫ! */}
  <button onClick={() => {
  setHpModalSource("header");  // ← запоминаем, что из шапки
  setShowHpModal(true);
}} className="bg-black/70 rounded-xl p-3 border-4 border-red-900 text-center hover:scale-105 transition text-xs relative overflow-hidden group">
  <div className="text-red-300 font-bold text-xs">ОД</div>
  <div className="text-4xl font-black text-red-400">
  {exhaustion >= 4 ? Math.floor(char.hp.max / 2) : char.hp.max}
</div>
    {char.hp.current}/<span className="text-red-300">{char.hp.max + (char.hp.bonusMax || 0)}</span>
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
  
  
  
 {/* КНОПКА ЭКСПОРТА + МЕНЮ — ВЫЛЕЗАЕТ СЛЕВА, КНОПКИ РАБОТАЮТ НА 100% */}
<div className="fixed top-6 right-6 z-50">
  {/* Круглая кнопка */}
  <button
    onClick={() => setShowExportMenu(prev => !prev)}
    className="w-16 h-16 bg-gradient-to-br from-cyan-800 to-blue-900 border-4 border-cyan-500 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
  >
    <span className="text-4xl text-cyan-400">💾</span>
  </button>

  {/* МЕНЮ */}
  {showExportMenu && (
    <>
      {/* Тёмный фон — ниже всего */}
      <div 
        className="fixed inset-0 z-40 bg-black/70" 
        onClick={() => setShowExportMenu(false)}
      />

      {/* Само меню — выше фона, клики работают */}
      <div 
        className="absolute top-0 right-full mr-6 w-96 bg-gradient-to-r from-gray-900/95 via-black to-gray-900/95 backdrop-blur-xl border-4 border-cyan-600 rounded-3xl p-5 shadow-2xl z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Скачать .json */}
          <button 
            onClick={() => {
              const data = localStorage.getItem(`character_${id}`);
              if (data) {
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${char?.name || "Персонаж"}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }
              setShowExportMenu(false);
            }}
            className="px-6 py-3 text-sm font-black text-cyan-400 hover:bg-cyan-600 hover:text-black transition rounded-lg border-2 border-cyan-600/50 hover:border-cyan-500 shadow-lg active:scale-95"
          >
            Скачать .json
          </button>

          {/* Загрузить .json */}
          <button 
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const parsed = JSON.parse(reader.result as string);
                      localStorage.setItem(`character_${id}`, JSON.stringify(parsed));
                      setChar(parsed);
                      alert("Персонаж успешно загружен!");
                    } catch (err) {
                      alert("Ошибка: файл повреждён");
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
              setShowExportMenu(false);
            }}
            className="px-6 py-3 text-sm font-black text-cyan-400 hover:bg-cyan-600 hover:text-black transition rounded-lg border-2 border-cyan-600/50 hover:border-cyan-500 shadow-lg active:scale-95"
          >
            Загрузить .json
          </button>

          {/* Скачать .pdf */}
          <PDFButton 
  char={char!} 
  onComplete={() => setShowExportMenu(false)} 
/>

          {/* Загрузить .pdf */}
          <button 
            onClick={() => {
              alert("Загрузка из PDF пока не поддерживается");
              setShowExportMenu(false);
            }}
            className="px-6 py-3 text-sm font-black text-emerald-400 hover:bg-emerald-600 hover:text-black transition rounded-lg border-2 border-emerald-600/50 hover:border-emerald-500 shadow-lg active:scale-95"
          >
            Загрузить .pdf
          </button>
        </div>
      </div>
    </>
  )}
</div>

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

            {/* ПАССИВНЫЕ ЧУВСТВА — В ОДНОЙ СТРОКЕ, В 2 РАЗА МЕНЬШЕ */}
<div className="bg-black/70 backdrop-blur-lg rounded-3xl p-4 border-4 border-cyan-600 shadow-2xl text-xs">
  <h3 className="text-xl font-black text-cyan-400 text-center mb-3">ПАССИВНЫЕ ЧУВСТВА</h3>
  <div className="grid grid-cols-3 gap-3">
    <div className="text-center">
      <div className="text-cyan-300 font-bold">Восприятие</div>
      <div className="text-3xl font-black text-white">
        {10 + mod(char.stats.wis) + (char.skills.perception === "prof" ? profBonus : char.skills.perception === "expert" ? profBonus * 2 : 0)}
      </div>
    </div>
    <div className="text-center">
      <div className="text-cyan-300 font-bold">Проницат.</div>
      <div className="text-3xl font-black text-white">
        {10 + mod(char.stats.wis) + (char.skills.insight === "prof" ? profBonus : char.skills.insight === "expert" ? profBonus * 2 : 0)}
      </div>
    </div>
    <div className="text-center">
      <div className="text-blue-300 font-bold">Анализ</div>
      <div className="text-3xl font-black text-white">
        {10 + mod(char.stats.int) + (char.skills.investigation === "prof" ? profBonus : char.skills.investigation === "expert" ? profBonus * 2 : 0)}
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

                {/* ===================== ПРАВАЯ ПОЛОВИНА ===================== */}
<div className="bg-black/80 backdrop-blur-xl rounded-3xl p-6 border-4 border-yellow-600 shadow-2xl">

  <div className="grid grid-cols-12 gap-3">

    {/* Инициатива — очень маленькая */}
    <button
      onClick={() => {
        const bonus = mod(char.stats.dex) + (char.initiative || 0);
        rollD20(bonus + (inspiration > 0 ? 1 : 0), "Инициатива");
      }}
      className="col-span-2 bg-gradient-to-br from-cyan-900 to-cyan-950 border-2 border-cyan-700 rounded-xl p-2 hover:scale-105 active:scale-95 transition-all shadow-md flex flex-col items-center justify-center min-h-[80px]"
    >
      <div className="text-cyan-200 font-black text-lg leading-tight">
        {mod(char.stats.dex) + (char.initiative || 0) >= 0 ? "+" : ""}
        {mod(char.stats.dex) + (char.initiative || 0)}
      </div>
      <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-tight mt-1">Иниц.</div>
    </button>

    {/* Вдохновение — очень маленькая */}
    <button
      onClick={() => setShowInspirationInput(true)}
      className="col-span-2 bg-gradient-to-br from-purple-900 to-purple-950 border-2 border-purple-700 rounded-xl p-2 hover:scale-105 active:scale-95 transition-all shadow-md flex flex-col items-center justify-center min-h-[80px]"
    >
      <div className="text-purple-200 font-black text-lg leading-tight">
        {inspiration > 0 ? `×${inspiration}` : "—"}
      </div>
      <div className="text-[9px] font-bold text-purple-400 uppercase tracking-tight mt-1">Вдохн.</div>
    </button>

    {/* Истощение — очень маленькая */}
    <button
      onClick={() => setShowExhaustionMenu(true)}
      className="col-span-2 bg-gradient-to-br from-emerald-900 to-emerald-950 border-2 border-emerald-700 rounded-xl p-2 hover:scale-105 active:scale-95 transition-all shadow-md flex flex-col items-center justify-center min-h-[80px]"
    >
      <div className="text-emerald-200 font-black text-lg leading-tight">
        {exhaustion ?? "—"}
      </div>
      <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight mt-1">Истощ.</div>
    </button>

    {/* Состояния — растянутая на всё оставшееся место */}
    <button
      onClick={() => setShowConditionsMenu(true)}
      className="col-span-6 bg-gradient-to-br from-orange-800 to-red-900 border-4 border-orange-600 rounded-2xl p-4 hover:scale-[1.02] active:scale-98 transition-all shadow-2xl flex flex-col items-center justify-center"
    >
      <div className="text-xl md:text-2xl font-black text-orange-200 mb-2">Состояния</div>

      {activeConditions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center text-xs">
          {activeConditions.map(id => {
            const cond = CONDITIONS.find(c => c.id === id);
            return (
              <span
                key={id}
                className="bg-black/50 px-2 py-0.5 rounded text-orange-200 border border-orange-500/40"
              >
                {cond?.short}
              </span>
            );
          })}
        </div>
      )}
    </button>

  </div>

        {/* Разделитель + отступ между кнопками действий и вкладками */}
<div className="h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent my-4 mx-2" />  

          {/* 7 ВКЛАДОК ВНИЗУ */}
          <div className="mb-6 px-1">
  <div className="grid grid-cols-7 gap-2">
    {["атаки", "способности", "снаряжение", "личность", "цели", "заметки", "заклинания"].map((t) => (
      <button
        key={t}
        onClick={() => setActiveTab(t as any)}
        className={`px-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all shadow-sm text-center leading-tight
          ${activeTab === t 
            ? "bg-yellow-600 text-black shadow-xl border-b-4 border-yellow-400" 
            : "bg-gray-800/90 text-gray-300 hover:bg-gray-700 hover:text-white border-b-4 border-transparent"
          }`}
      >
        {t.split(' ').map((word, i) => (
          <span key={i} className="block">{word}</span>
        ))}
      </button>
    ))}
  </div>
</div>

          {/* КОНТЕНТ ТАБА */}
<div className="bg-black/60 rounded-2xl p-6 border-2 border-gray-700 min-h-[400px]">
  {activeTab === "атаки" && (
  <div className="mt-6 space-y-8">
    {/* === СПИСОК ОРУЖИЯ С ПЕРЕТАСКИВАНИЕМ === */}
    <div>
      {/* Заголовки */}
      <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-900/50 border-b border-gray-700 text-sm font-bold text-gray-400">
        <div className="col-span-1"></div>
        <div className="col-span-4">Название</div>
        <div className="col-span-3 text-center">Бонус</div>
        <div className="col-span-3 text-center">Урон/вид</div>
        <div className="col-span-1 text-center">Удалить</div>
      </div>

      {/* Список оружия */}
      <div className="space-y-2 mt-2">
        {weapons.map((weapon, index) => (
          <div
            key={weapon.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", index.toString());
              e.currentTarget.classList.add("opacity-60", "scale-[0.98]");
            }}
            onDragEnd={(e) => e.currentTarget.classList.remove("opacity-60", "scale-[0.98]")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
              if (draggedIndex === index) return;

              const reordered = [...weapons];
              const [moved] = reordered.splice(draggedIndex, 1);
              reordered.splice(index, 0, moved);
              setWeapons(reordered);
            }}
            className="grid grid-cols-12 gap-4 px-6 py-4 bg-black/70 border border-gray-700 hover:border-yellow-500 rounded-2xl transition-all cursor-grab active:cursor-grabbing"
          >
            <div className="col-span-1 flex items-center justify-center text-2xl text-gray-500">☰</div>

            <div className="col-span-4 flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingWeaponId(weapon.id);
                  setShowWeaponModal(true);
                }}
                className="font-medium text-lg text-left hover:text-yellow-300 hover:underline"
              >
                {weapon.name || "Без названия"}
              </button>

              {weapon.showNote && weapon.note && (
                <div className="group relative inline-block">
                  <span className="text-xs font-bold text-gray-400 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 cursor-help">
                    i
                  </span>
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/95 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 max-w-[520px] shadow-2xl whitespace-pre-wrap break-words">
                    {weapon.note}
                  </div>
                </div>
              )}
            </div>

            <div 
              className="col-span-3 text-center text-cyan-300 font-medium text-lg cursor-pointer hover:underline hover:text-cyan-200 flex items-center justify-center"
              onClick={() => rollWeaponAttack(weapon)}
            >
              {getWeaponAttackBonus(weapon, char!, profBonus)}
            </div>

            <div 
              className="col-span-3 text-center text-emerald-300 font-medium text-lg cursor-pointer hover:underline hover:text-emerald-200 flex items-center justify-center"
              onClick={() => rollWeaponDamage(weapon)}
            >
              {weapon.damage || "—"}
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <button
                onClick={() => removeWeapon(weapon.id)}
                className="text-red-400 hover:text-red-300 text-3xl font-black leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addWeapon}
        className="mt-6 w-full bg-gradient-to-r from-green-700 to-emerald-700 py-5 rounded-2xl text-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
      >
        + Добавить оружие
      </button>
    </div>

    {/* === ТЕКСТОВЫЕ ПОЛЯ, КОТОРЫЕ ПРОПАЛИ === */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-bold text-cyan-300 mb-2">Атаки и заклинания</label>
        <textarea
          value={char?.attackNotes || ""}
          onChange={(e) => setChar(c => c ? { ...c, attackNotes: e.target.value } : c)}
          className="w-full h-32 bg-black/70 border-2 border-cyan-700 rounded-2xl px-4 py-3 text-cyan-100 resize-y focus:outline-none focus:border-cyan-400"
          placeholder="Например: Огненный шар 8d6, дальность 150 фт..."
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-purple-300 mb-2">Умения и способности</label>
        <textarea
          value={char?.abilityNotes || ""}
          onChange={(e) => setChar(c => c ? { ...c, abilityNotes: e.target.value } : c)}
          className="w-full h-32 bg-black/70 border-2 border-purple-700 rounded-2xl px-4 py-3 text-purple-100 resize-y focus:outline-none focus:border-purple-400"
          placeholder="Например: Ярость варвара, Лечение на 1d8+2..."
        />
      </div>
    </div>
  </div>
)}
</div>
      </div>
</div>

      {/* ===================== ВЫНЕСЕННЫЕ ПОПАПЫ (всё за пределами grid) ===================== */}

      {/* Универсальное меню сверху (Вдохновение / Истощение / Состояния и будущие вкладки) */}
      {(showInspirationInput || showExhaustionMenu || showConditionsMenu) && (
        <>
          <div className="fixed inset-0 bg-black/90 z-[99997]" onClick={() => {
            setShowInspirationInput(false);
            setShowExhaustionMenu(false);
            setShowConditionsMenu(false);
          }} />

          <div className="fixed inset-x-0 top-0 z-[99998]">
            <div className="bg-gradient-to-b from-black via-purple-950 to-black border-b-8 border-yellow-600 shadow-2xl">

              {/* Вкладки */}
              <div className="flex justify-center gap-3 py-4 px-6 overflow-x-auto scrollbar-hide">
                {[
                  {name: "Вдохновение", state: showInspirationInput},
                  {name: "Истощение",   state: showExhaustionMenu},
                  {name: "Состояния",   state: showConditionsMenu},
                ].map(tab => (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setShowInspirationInput(tab.name === "Вдохновение");
                      setShowExhaustionMenu(tab.name === "Истощение");
                      setShowConditionsMenu(tab.name === "Состояния");
                    }}
                    className={`px-6 py-3 rounded-t-2xl font-black text-sm transition-all whitespace-nowrap ${
                      tab.state
                        ? "bg-yellow-600 text-black scale-105 shadow-xl"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Контент активной вкладки */}
              <div className="min-h-96 bg-black/95 backdrop-blur-xl p-8">

                {showInspirationInput && (
  <div className="max-w-lg mx-auto text-center space-y-8">
    <h3 className="text-5xl font-black text-purple-400">Вдохновение</h3>
    
    <div className="text-mx-8">
      <div className="text-9xl font-black text-purple-300">
        {inspiration > 0 ? `×${inspiration}` : "—"}
      </div>
      {inspiration > 0 && (
        <div className="text-2xl text-purple-500 font-bold mt-2">
          Бонус к проверкам: +{inspiration}
        </div>
      )}
    </div>

    <input
      type="number"
      value={inspirationInput}
      onChange={(e) => setInspirationInput(e.target.value.replace(/\D/g, ""))}
      placeholder="0"
      autoFocus
      className="w-full bg-black/80 border-4 border-purple-600 rounded-2xl text-6xl text-center py-6 text-purple-300 placeholder-purple-700 focus:border-purple-400 focus:outline-none"
    />

    <div className="grid grid-cols-2 gap-6">
      {/* КНОПКА "УБРАТЬ" — отнимает введённое количество */}
      <button
        onClick={() => {
          const val = Number(inspirationInput) || 0;
          setInspiration(prev => Math.max(0, prev - val));
          setInspirationInput("");
        }}
        className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 py-6 rounded-2xl text-3xl font-black border-4 border-red-600 shadow-xl active:scale-95 transition-all"
      >
        Убрать
      </button>

      {/* КНОПКА "ДОБАВИТЬ" — прибавляет */}
      <button
        onClick={() => {
          const val = Number(inspirationInput) || 0;
          setInspiration(prev => prev + val);
          setInspirationInput("");
        }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-6 rounded-2xl text-3xl font-black shadow-xl active:scale-95 transition-all"
      >
        Добавить
      </button>
    </div>

    {/* Кнопка закрытия без изменений */}
    <button
      onClick={() => {
        setShowInspirationInput(false);
        setInspirationInput("");
      }}
      className="text-gray-500 hover:text-gray-300 text-xl uppercase tracking-wider"
    >
      ✕ Закрыть
    </button>
  </div>
)}


      {/* ВСЕ МОДАЛКИ */}
      
      {/* МОДАЛКА НАСТРОЕК — ГЛАВНОЕ МЕНЮ ПЕРСОНАЖА */}
      {showFullSettings && char && (
        <SettingsModal
          char={char}
          setChar={setChar}
          onClose={() => setShowFullSettings(false)}
        />
      )}

      {showExhaustionMenu && (
  <div className="max-w-4xl mx-auto text-center">
    <h3 className="text-6xl font-black text-emerald-400 mb-8">Уровень истощения</h3>
    
    <div className="grid grid-cols-7 gap-6 mb-12">
      {[0,1,2,3,4,5,6].map(l => (
        <button
          key={l}
          onClick={() => { setExhaustion(l); setShowExhaustionMenu(false); }}
          className={`relative w-24 h-24 rounded-full text-5xl font-black transition-all 
            ${exhaustion === l 
              ? "bg-emerald-600 border-8 border-emerald-300 shadow-2xl scale-110" 
              : "bg-gray-800 border-4 border-gray-600 hover:bg-gray-700"
            }`}
        >
          {l}
          {l >= 1 && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-gray-400">
              {l === 1 && "Помеха на хар-ки"}
              {l === 2 && "Скорость ×½"}
              {l === 3 && "Помеха на атаку/спасы"}
              {l === 4 && "Макс. ХП ×½"}
              {l === 5 && "Скорость = 0"}
              {l === 6 && "СМЕРТЬ"}
            </div>
          )}
        </button>
      ))}
    </div>

    {/* Текущий эффект */}
    {exhaustion > 0 && (
      <div className="text-2xl font-bold text-red-400 animate-pulse">
        {exhaustion === 1 && "Помеха на проверки характеристик"}
        {exhaustion === 2 && "Скорость уменьшена вдвое"}
        {exhaustion === 3 && "Помеха на броски атаки и спасброски"}
        {exhaustion === 4 && "Максимум хитов уменьшен вдвое"}
        {exhaustion === 5 && "Скорость = 0"}
        {exhaustion === 6 && "ПЕРСОНАЖ МЁРТВ"}
      </div>
    )}
  </div>
)}

                {showConditionsMenu && (
  <div className="max-w-5xl mx-auto px-4">
    <h3 className="text-4xl md:text-5xl font-black text-orange-400 mb-6 text-center">Состояния</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-gray-900/40">
      {CONDITIONS.map(cond => (
        <div 
  key={cond.id} 
  className="bg-gray-900/70 rounded-xl border border-gray-700/70 overflow-hidden relative"
>
  {/* Заголовок — с отступом справа, чтобы чекбокс не перекрывал */}
  <button
    onClick={() => setSelectedConditionId(prev => prev === cond.id ? null : cond.id)}
    className="w-full px-5 py-4 pr-14 text-left flex items-center justify-between hover:bg-gray-800/70 transition-colors"  // ← pr-14 = padding-right 3.5rem
  >
    <span className="text-xl font-bold text-orange-300">
      {cond.name}
    </span>
    <span className="text-2xl font-black text-orange-500/70 flex-shrink-0">
      {selectedConditionId === cond.id ? "−" : "+"}
    </span>
  </button>

  {/* Полное описание */}
  {selectedConditionId === cond.id && (
    <div className="px-5 pb-5 pt-1 text-gray-200 text-base leading-relaxed border-t border-gray-700/50">
      {cond.desc}
    </div>
  )}

  {/* Чекбокс — правый верхний угол, выше кнопки */}
  <div className="absolute top-3 right-3 z-10">
    <input
      type="checkbox"
      id={cond.id}
      checked={activeConditions.includes(cond.id)}
      onChange={() => {
        setActiveConditions(prev =>
          prev.includes(cond.id)
            ? prev.filter(c => c !== cond.id)
            : [...prev, cond.id]
        );
      }}
      className="w-5 h-5 accent-orange-500 cursor-pointer"
    />
  </div>
</div>
      ))}
    </div>

    <button
      onClick={() => setShowConditionsMenu(false)}
      className="mt-6 w-full bg-orange-700 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-xl transition-colors"
    >
      Закрыть
    </button>
  </div>
)}

              </div>
            </div>
          </div>
        </>
      )}
              
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
      
      {/* ЛЕВОЕ МЕНЮ — РУЧНАЯ НАСТРОЙКА */}
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

      {/* ОСНОВНОЙ КАЛЬКУЛЯТОР */}
      <div 
        className="bg-gradient-to-br from-purple-950 via-black to-purple-900 border-6 border-yellow-600 rounded-3xl shadow-2xl w-full max-w-2xl p-8 pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Уровни и прогресс */}
        <div className="flex items-center justify-center gap-10 text-5xl font-black mb-8">
          <span className="text-yellow-400">{char.level}</span>
          <div className="w-56 h-12 bg-gray-900/90 rounded-full overflow-hidden border-4 border-yellow-600 relative">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 transition-all duration-700" style={{ width: `${getXpProgressPercent(char)}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white bg-black/80 px-5 py-1 rounded-full">
              {char.experience.toLocaleString()}
            </span>
          </div>
          <span className="text-cyan-400">{char.level < 20 ? char.level + 1 : "МАКС"}</span>
        </div>

        {/* Поле ввода — теперь поддерживает выражения */}
        <input
          type="text"
          value={xpInput}
          onChange={e => setXpInput(e.target.value.replace(/[^\d+\-]/g, ''))} // только цифры, + и -
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

        {/* Кнопки действий — теперь считают ВСЁ выражение */}
        <div className="grid grid-cols-2 gap-5 text-3xl font-black">
          <button 
            onClick={() => {
              try {
                // Безопасно вычисляем выражение (eval опасен, но здесь только цифры и +-, поэтому ок)
                const result = Function('"use strict";return (' + xpInput + ')')();
                if (typeof result === 'number' && !isNaN(result)) {
                  addXp(result);
                  setXpInput("");
                }
              } catch (e) {
                // Если ошибка в выражении — просто ничего не делаем
              }
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 py-8 rounded-3xl active:scale-95 shadow-xl"
          >
            ПРИБАВИТЬ
          </button>

          <button 
            onClick={() => {
              try {
                const result = Function('"use strict";return (' + xpInput + ')')();
                if (typeof result === 'number' && !isNaN(result)) {
                  addXp(-result);
                  setXpInput("");
                }
              } catch (e) {}
            }}
            className="bg-gradient-to-r from-red-600 to-pink-600 py-8 rounded-3xl active:scale-95 shadow-xl"
          >
            ОТНЯТЬ
          </button>
        </div>

        {/* НИЖНИЕ КНОПКИ */}
<div className="grid grid-cols-2 gap-5 mt-6 text-2xl font-black">
  <button 
    onClick={() => setShowXpManual(prev => !prev)}
    className="bg-gradient-to-r from-yellow-600 to-orange-600 py-8 rounded-3xl active:scale-95 shadow-xl"
  >
    {showXpManual ? "СКРЫТЬ" : "НАСТРОЙКИ"}
  </button>

  <button 
    onClick={handleLevelUpDown}
    className={`py-8 rounded-3xl active:scale-95 shadow-xl transition-all
      ${canLevelUp() 
        ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black" 
        : "bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white"}`}
  >
    {canLevelUp() ? "ПОВЫСИТЬ УРОВЕНЬ" : "ПОНИЗИТЬ УРОВЕНЬ"}
  </button>
</div>
      </div>
    </div>
  </>
)}
  </>
)}
{/* МОДАЛКА НАСТРОЕК — ГЛАВНОЕ МЕНЮ ПЕРСОНАЖА */}
      {showFullSettings && char && (
        <SettingsModal
          char={char}
          setChar={setChar}
          onClose={() => setShowFullSettings(false)}
        />
      )}
{/* МОДАЛКА ХИТОВ */}
      {showHpModal && char && (
        <HPModal 
  char={char} 
  setChar={setChar} 
  onClose={() => {
    setShowHpModal(false);
    if (hpModalSource === "rest") {
      setShowRestModal(true);
    }
    setHpModalSource(null);
  }} 
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
    <div 
      className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[9999998]" 
      onClick={() => setShowExperimental(false)}
    />

    <div className="fixed inset-0 z-[9999999] flex items-center justify-center px-4 py-8 pointer-events-none">
      <div 
        className="relative bg-gradient-to-br from-purple-950 via-black to-pink-950 
                   border-8 border-pink-600 rounded-3xl p-10 w-full max-w-4xl max-h-[90vh] 
                   overflow-y-auto shadow-2xl shadow-pink-900/90 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <h1 className="text-7xl font-black text-center bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-widest mb-2">
          EXPERIMENTAL
        </h1>
        <p className="text-2xl text-pink-300 text-center font-bold mb-10">
          Лаборатория безумного бога — первая функция
        </p>

        {/* Первая экспериментальная функция */}
        <div className="bg-black/70 border-4 border-dashed border-cyan-500 rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-cyan-300">Убирать результат бросков со временем</h2>
              <p className="text-gray-400 mt-1">Всплывашки с кубиками, атаками и уроном будут исчезать автоматически</p>
            </div>

            {/* Красивый переключатель */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoHideRolls}
                onChange={(e) => setAutoHideRolls(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-16 h-9 bg-gray-700 rounded-full peer peer-checked:bg-emerald-600 
                            after:content-[''] after:absolute after:top-1 after:left-1 
                            after:bg-white after:rounded-full after:h-7 after:w-7 
                            after:transition-all peer-checked:after:translate-x-7"></div>
            </label>
          </div>

          {autoHideRolls && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div>
                <label className="block text-sm font-bold text-cyan-300 mb-2">
                  Начать исчезновение через
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.3"
                    step="0.1"
                    value={fadeStartSec}
                    onChange={(e) => setFadeStartSec(Math.max(0.3, Number(e.target.value)))}
                    className="w-24 bg-black border-2 border-cyan-700 rounded-xl px-4 py-3 text-2xl text-center font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-xl text-gray-400">секунд</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-cyan-300 mb-2">
                  Полное исчезновение за
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.2"
                    step="0.1"
                    value={fadeDurationSec}
                    onChange={(e) => setFadeDurationSec(Math.max(0.2, Number(e.target.value)))}
                    className="w-24 bg-black border-2 border-cyan-700 rounded-xl px-4 py-3 text-2xl text-center font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-xl text-gray-400">секунд</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={() => setShowExperimental(false)}
          className="w-full mt-8 bg-gradient-to-r from-pink-800 to-purple-800 hover:from-pink-700 hover:to-purple-700 
                     py-6 rounded-2xl text-2xl font-black tracking-widest shadow-2xl border-4 border-pink-500 
                     transition-all hover:scale-105 active:scale-95"
        >
          ЗАКРЫТЬ ЛАБОРАТОРИЮ
        </button>
      </div>
    </div>
  </>
)}

{/*модалка вкладки атаки*/}
{showWeaponModal && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={() => {
      setShowWeaponModal(false);
      setEditingWeaponId(null);
    }}
  >
    <div
      className="bg-gray-900 border-4 border-orange-600 rounded-2xl p-6 w-full max-w-lg mx-4"
      onClick={e => e.stopPropagation()}
    >
      <h3 className="text-3xl font-black text-orange-400 mb-6 text-center">
        {editingWeaponId ? "Редактировать оружие" : "Новое оружие"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-orange-300 mb-1">Название</label>
          <input
            type="text"
            value={weapons.find(w => w.id === editingWeaponId)?.name || ""}
            onChange={e => {
              const id = editingWeaponId!;
              updateWeapon(id, "name", e.target.value);
            }}
            className="w-full bg-black/70 border-2 border-orange-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-400"
            placeholder="Длинный меч, Арбалет, Огненный шар..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-cyan-300 mb-1">Доп бонус</label>
          <input
            type="text"
            value={weapons.find(w => w.id === editingWeaponId)?.bonus || ""}
            onChange={e => {
              const id = editingWeaponId!;
              updateWeapon(id, "bonus", e.target.value);
            }}
            className="w-full bg-black/70 border-2 border-cyan-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
            placeholder="+6, Лов + Влад, Сил +3..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-emerald-300 mb-1">Урон / тип</label>
          <input
            type="text"
            value={weapons.find(w => w.id === editingWeaponId)?.damage || ""}
            onChange={e => {
              const id = editingWeaponId!;
              updateWeapon(id, "damage", e.target.value);
            }}
            className="w-full bg-black/70 border-2 border-emerald-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-400"
            placeholder="1d8+4 рубящий, 2d6 огненный, 1d10 колющий..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-1">Примечание</label>
          <textarea
            value={weapons.find(w => w.id === editingWeaponId)?.note || ""}
            onChange={e => {
              const id = editingWeaponId!;
              updateWeapon(id, "note", e.target.value);
            }}
            className="w-full h-20 bg-black/70 border-2 border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400 resize-none"
            placeholder="Магическое, дальность 30/120, тяжёлое..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
  {/* Характеристика + владение — левая половина */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-700">
  <div>
    <label className="block text-sm font-bold text-orange-300 mb-1">Характеристика атаки</label>
    <select
      value={weapons.find(w => w.id === editingWeaponId)?.attackStat || "none"}
      onChange={e => {
        const id = editingWeaponId!;
        updateWeapon(id, "attackStat", e.target.value as Stat | "none");
      }}
      className="w-full bg-black/70 border-2 border-orange-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-400"
    >
      <option value="none">Без характеристики</option>
      <option value="str">Сила</option>
      <option value="dex">Ловкость</option>
      <option value="con">Телосложение</option>
      <option value="int">Интеллект</option>
      <option value="wis">Мудрость</option>
      <option value="cha">Харизма</option>
    </select>
  </div>

  <div className="flex items-end">
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={!!weapons.find(w => w.id === editingWeaponId)?.proficient}
        onChange={e => {
          const id = editingWeaponId!;
          updateWeapon(id, "proficient", e.target.checked);
        }}
        className="w-5 h-5 accent-orange-500 cursor-pointer"
      />
      <span className="text-sm font-medium">Владение оружием</span>
    </label>
  </div>
</div>

{/* Отображать примечание — правая половина, ниже, прижато к правому краю */}
<div className="mt-6 flex justify-end">
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={!!weapons.find(w => w.id === editingWeaponId)?.showNote}
      onChange={e => {
        const id = editingWeaponId!;
        updateWeapon(id, "showNote", e.target.checked);
      }}
      className="w-5 h-5 accent-orange-500 cursor-pointer"
    />
    <span className="text-sm font-medium">Отображать примечание (значок «i»)</span>
  </label>
</div>
</div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => {
            setShowWeaponModal(false);
            setEditingWeaponId(null);
          }}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition"
        >
          Отмена
        </button>
        <button
          onClick={() => {
            setShowWeaponModal(false);
            setEditingWeaponId(null);
          }}
          className="flex-1 bg-orange-700 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
)}

{/* МОДАЛКА ОТДЫХА — ФИНАЛЬНАЯ ВЕРСИЯ, ПО ПРАВИЛАМ D&D 5e */}
{showRestModal && char && (
  <div 
    className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center z-[99999] p-6" 
    onClick={() => {
      setShowRestModal(false);
      setTempSelectedDice(0);
    }}
  >
    <div 
      className="bg-gradient-to-br from-orange-950 via-black to-purple-950 border-8 border-yellow-500 rounded-3xl p-10 max-w-5xl w-full shadow-2xl relative overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* ФОН: Солнце и Луна */}
      <div className="absolute inset-0 pointer-events-none z-[-1] opacity-25">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      {/* КНОПКА ХИТОВ */}
      <button
        onClick={() => {
          setHpModalSource("rest");
          setShowRestModal(false);
          setShowHpModal(true);
        }}
        className="absolute top-8 left-8 bg-red-950/90 border-6 border-red-700 rounded-2xl px-8 py-5 text-center hover:scale-105 transition-all shadow-2xl group"
      >
        <div className="text-4xl font-black text-red-400 leading-tight">
          {char.hp.current}/<span className="text-red-300">{char.hp.max + (char.hp.bonusMax || 0)}</span>
        </div>
        {char.hp.temp > 0 && (
          <div className="absolute -top-3 -right-3 bg-purple-600 px-3 py-1 rounded-full border-2 border-purple-400 text-lg font-black animate-pulse">
            +{char.hp.temp}
          </div>
        )}
      </button>

      <h2 className="text-8xl font-black text-center text-yellow-400 mb-10 tracking-widest">
        ОТДЫХ
      </h2>

      <div className="flex justify-center gap-12 mb-10">
        <button onClick={() => { setRestTab("short"); setTempSelectedDice(0); }}
          className={`text-4xl font-black px-10 py-5 rounded-2xl transition-all shadow-lg ${restTab === "short" ? "bg-yellow-600 text-black scale-110 border-4 border-yellow-300" : "bg-gray-800 text-yellow-300 hover:bg-gray-700"}`}>
          Короткий
        </button>
        <button onClick={() => setRestTab("long")}
          className={`text-4xl font-black px-10 py-5 rounded-2xl transition-all shadow-lg ${restTab === "long" ? "bg-purple-700 text-white scale-110 border-4 border-purple-300" : "bg-gray-800 text-purple-300 hover:bg-gray-700"}`}>
          Продолжительный
        </button>
      </div>

      <div className="text-gray-300 text-xl leading-relaxed px-8">
        {restTab === "short" ? (
  <div className="space-y-8">
    <p><strong>Короткий отдых</strong> — минимум 1 час без напряжённой активности.</p>

    <div className="bg-black/60 rounded-2xl p-8 border-2 border-yellow-600 relative">
      <p className="text-2xl font-bold text-cyan-300 text-center mb-6">
        Выберите кости хитов (доступно: {char.level - (char.hitDieSpent || 0)})
      </p>

      {/* КНОПКА-ЗАМОК — В ПРАВОМ ВЕРХНЕМ УГЛУ */}
      <button
        onClick={() => setIsUnlockMode(prev => !prev)}
        className="absolute top-4 right-4 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all shadow-2xl z-10"
        title="Разрешить восстановление потраченных костей"
      >
        {isUnlockMode ? (
          // ОТКРЫТЫЙ ЗАМОК — ЗОЛОТОЙ
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-yellow-400">
            <path fill="currentColor" d="M12 13a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1zm5-9h-4V2a2 2 0 0 0-4 0v2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zM9 4a1 1 0 0 1 2 0v1h2V4a1 1 0 0 1 2 0v1h2a1 1 0 0 1 1 1v1H8V6a1 1 0 0 1 1-1h2V4z"/>
          </svg>
        ) : (
          // ЗАКРЫТЫЙ ЗАМОК — СЕРЫЙ
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-500">
            <path fill="currentColor" d="M12 13a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1zm5-9h-4V2a2 2 0 0 0-4 0v2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-7-2a1 1 0 0 1 2 0v1h2V4a1 1 0 0 1 2 0v1h2a1 1 0 0 1 1 1v1H8V6a1 1 0 0 1 1-1h2V4z"/>
          </svg>
        )}
      </button>

      {/* КОСТИ ХИТОВ */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {Array.from({ length: char.level }, (_, i) => {
          const spent = char.hitDieSpent || 0;
          const isSpent = i < spent;
          const isSelected = i >= spent && i < spent + tempSelectedDice;

          return (
            <button
              key={i}
              onClick={() => {
                if (isSpent) {
                  // Если кость уже потрачена — можно вернуть только при открытом замке
                  if (isUnlockMode) {
                    setChar(c => c ? { ...c, hitDieSpent: Math.max(0, (c.hitDieSpent || 0) - 1) } : c);
                  }
                  return;
                }

                // Обычный выбор для лечения
                if (isSelected) {
                  setTempSelectedDice(t => t - 1);
                } else if (tempSelectedDice < char.level - spent) {
                  setTempSelectedDice(t => t + 1);
                }
              }}
              className={`w-20 h-20 rounded-full border-4 text-3xl font-black transition-all relative group ${
                isSpent
                  ? isUnlockMode
                    ? "bg-red-900/70 border-red-600 text-red-400 cursor-pointer hover:bg-red-800 hover:scale-105"
                    : "bg-gray-800 border-gray-600 text-gray-500"
                  : isSelected
                    ? "bg-yellow-600 border-yellow-400 text-black scale-110 shadow-2xl"
                    : "bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600"
              }`}
            >
              d{char.hitDie || 8}

              {/* Подсказка при наведении на потраченную кость */}
              {isSpent && isUnlockMode && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-yellow-400 text-xs px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                  Вернуть кость
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Строка восстановления */}
      {tempSelectedDice > 0 && (
        <div className="text-center text-4xl font-black text-emerald-400 py-6 bg-black/80 rounded-2xl border-2 border-emerald-600">
          Восстановление хитов: {tempSelectedDice}к{char.hitDie || 8} + {mod(char.stats.con)}
        </div>
      )}

      {/* Подсказка о замке */}
      {isUnlockMode && (
        <div className="text-center text-yellow-400 text-lg font-bold mt-4 animate-pulse">
          Режим восстановления костей активен
        </div>
      )}
    </div>
  </div>
) : (
          <div className="space-y-6 text-center">
            <p className="text-2xl"><strong>Продолжительный отдых</strong> — минимум 8 часов.</p>
            <div className="bg-emerald-900/60 rounded-2xl p-8 border-2 border-emerald-500 text-2xl">
              <p className="text-emerald-300 font-black text-3xl mb-4">Восстановление:</p>
              <ul className="space-y-3 text-left max-w-2xl mx-auto">
                <li>Все хиты</li>
                <li>Половина костей хитов ({Math.floor(char.level / 2)} из {char.level})</li>
                <li>Все ячейки заклинаний</li>
                <li>Снятие истощения</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={() => {
            if (restTab === "long") {
              setChar(c => c ? {
                ...c,
                hp: { ...c.hp, current: c.hp.max + (c.hp.bonusMax || 0), temp: 0 },
                hitDieSpent: Math.floor(c.level / 2)
              } : c);
              alert("Царь Бимба провёл ночь в золотых покоях. Полное восстановление!");
            } else {
              if (tempSelectedDice === 0) {
                alert("Выберите хотя бы одну кость хитов!");
                return;
              }
              const dice = char.hitDie || 8;
              let healed = mod(char.stats.con) * tempSelectedDice;
              for (let i = 0; i < tempSelectedDice; i++) {
                healed += Math.floor(Math.random() * dice) + 1;
              }
              setChar(c => c ? {
                ...c,
                hp: { ...c.hp, current: Math.min(c.hp.max + (c.hp.bonusMax || 0), c.hp.current + healed) },
                hitDieSpent: (c.hitDieSpent || 0) + tempSelectedDice
              } : c);
              alert(`Короткий отдых завершён! Восстановлено ${healed} ОД`);
            }
            setTempSelectedDice(0);
          }}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-red-600 px-24 py-8 rounded-3xl text-6xl font-black uppercase tracking-wider shadow-2xl border-8 border-yellow-400 transition-all hover:scale-105 active:scale-95"
        >
          ОТДОХНУТЬ
        </button>
      </div>
    </div>
  </div>
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

      {/* DiceButton если есть */}
      {/* <DiceButton /> */}

{/* ОБЩИЙ СТЕК ВСПЛЫВАШЕК — максимум 5 любых (кубики + атаки + урон) */}
<div className="fixed bottom-4 left-4 z-[9999999] space-y-3 max-w-sm">
  {allRolls.map((item, index) => (
    <div
      key={item.id}
      className={`animate-in slide-in-from-bottom fade-in duration-500 flex items-end gap-3
        ${autoHideRolls ? 'animate-fade-out' : ''}`}
      style={{
        animationDelay: `${index * 80}ms`,
        '--fade-start-delay': `${fadeStartSec}s`,
        '--fade-duration': `${fadeDurationSec}s`,
      } as React.CSSProperties}
    >
      {/* Кубик */}
      {item.type === "cube" && (
        <div className="bg-black/98 backdrop-blur-2xl border-4 border-cyan-500 rounded-2xl p-4 shadow-2xl shadow-cyan-900/80 flex-1">
          <div className="text-cyan-400 text-lg font-black tracking-wider uppercase">
            {item.text}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className={`text-5xl font-black animate-bounce ${item.roll === 1 ? "text-red-500" : item.roll === 20 ? "text-emerald-400" : "text-white"}`}>
              {item.roll}
            </div>
            <div className="text-3xl text-cyan-300 font-bold">
              {item.bonus! >= 0 ? "+" : ""}{item.bonus}
            </div>
            <div className={`text-5xl font-black ${item.roll === 1 ? "text-red-500" : item.roll === 20 ? "text-emerald-400" : "text-yellow-400"}`}>
              = {item.total}
            </div>
          </div>
        </div>
      )}

      {/* Атака */}
      {item.type === "attack" && (
        <div className="bg-black/98 backdrop-blur-2xl border-4 border-cyan-500 rounded-2xl p-4 shadow-2xl shadow-cyan-900/80 flex-1">
          <div className="text-cyan-400 text-lg font-black tracking-wider uppercase">
            Бросок атаки: {item.weaponName}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className={`text-5xl font-black animate-bounce ${item.d20 === 1 ? "text-red-500" : item.d20 === 20 ? "text-emerald-400" : "text-white"}`}>
              {item.d20}
            </div>
            <div className="text-3xl text-cyan-300 font-bold">
              + {item.bonus}
            </div>
            <div className={`text-5xl font-black ${item.total >= 20 ? "text-emerald-400" : item.total <= 1 ? "text-red-500" : "text-yellow-400"}`}>
              = {item.total}
            </div>
          </div>
        </div>
      )}

      {/* Урон — теперь в общем стеке, не исчезает сама, закрывается крестиком */}
      {item.type === "damage" && (
        <div className="bg-black/98 backdrop-blur-2xl border-4 border-emerald-500 rounded-2xl p-4 shadow-2xl shadow-emerald-900/80 flex-1">
          <div className="text-emerald-400 text-lg font-black tracking-wider uppercase">
            Бросок урона: {item.damageText}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {item.damageRolls?.map((r, i) => (
              <div key={i} className="text-5xl font-black text-white">
                {r}
                {i < (item.damageRolls!.length - 1) && <span className="text-3xl text-gray-500 mx-1">+</span>}
              </div>
            ))}
            <div className="text-5xl font-black text-emerald-400">
              = {item.total}
            </div>
          </div>
        </div>
      )}

      {/* Общий крестик — справа снизу, точно как у кубиков */}
      <button
        onClick={() => setAllRolls(prev => prev.filter(x => x.id !== item.id))}
        className="w-10 h-10 bg-red-900/90 hover:bg-red-800 border-4 border-red-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all mb-1"
      >
        <span className="text-2xl font-black text-red-400">×</span>
      </button>
    </div>
  ))}
</div>
{damageRoll && (
  <div className="fixed bottom-4 left-4 z-[9999999] bg-black/98 backdrop-blur-2xl border-4 border-emerald-500 rounded-2xl p-6 shadow-2xl shadow-emerald-900/80">
    <div className="text-emerald-400 text-xl font-black tracking-wider uppercase mb-4">
      Бросок урона: {damageRoll.text}
    </div>

    <div className="flex flex-wrap items-center gap-3">
      {damageRoll.rolls.map((r, i) => (
        <div key={i} className="text-5xl font-black text-white">
          {r}
          {i < damageRoll.rolls.length - 1 && <span className="text-3xl text-gray-500"> + </span>}
        </div>
      ))}
      <div className="text-5xl font-black text-emerald-400">
        = {damageRoll.total}
      </div>
    </div>
  </div>
)}
    </main>
  );

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

  // Вычисление выражения из строки
  const calculateExpression = (expr: string): number => {
    try {
      return Function('"use strict";return (' + expr + ')')();
    } catch (e) {
      return 0;
    }
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
    const amount = calculateExpression(input);
    if (amount > 0) {
      setChar(c => c ? { ...c, hp: { ...c.hp, temp: (c.hp.temp || 0) + amount } } : c);
      setInput("");
    }
  };

  const handleKey = (k: string) => {
    if (k === "C") {
      setInput("");
    } else if (k === "←" || k === "Backspace") {
      setInput(prev => prev.slice(0, -1));
    } else if (k === "+" || k === "-") {
      if (/[\+\-]$/.test(input)) return;
      setInput(prev => prev + k);
    } else if (/\d/.test(k)) {
      setInput(prev => prev + k);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className="flex gap-6" onClick={e => e.stopPropagation()}>

        {/* ОСНОВНОЙ КАЛЬКУЛЯТОР */}
        <div className="bg-gradient-to-b from-black to-red-950 border-4 border-red-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">

          {/* Текущее здоровье — всегда видно */}
          <div className="text-center mb-6">
            <div className="text-7xl font-black leading-tight">
              <span className="text-red-500">{currentHp}</span>
              <span className="text-gray-500">/</span>
              <span className="text-red-400">{maxHp}</span>
              {tempHp > 0 && <span className="text-purple-400 ml-3">({tempHp})</span>}
            </div>
          </div>

          {/* Спасброски от смерти — появляются при 0 и ниже */}
          {isDown && (
            <div className="text-center py-4 mb-6">
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

          {/* Строка ввода */}
          <input 
            value={input} 
            onChange={e => setInput(e.target.value.replace(/[^\d+\-]/g, ''))} 
            placeholder="0"
            className="w-full bg-black/80 border-4 border-red-800 rounded-2xl text-5xl text-center py-4 font-black text-red-400 mb-4 placeholder-gray-600" 
            autoFocus 
          />

          {/* Клавиатура с + и - */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {["7","8","9","+","4","5","6","-","1","2","3","C","0","←"].map(k => (
              <button 
                key={k} 
                onClick={() => {
                  if (k === "C") setInput("");
                  else if (k === "←" || k === "Backspace") setInput(prev => prev.slice(0, -1));
                  else if (k === "+" || k === "-") {
                    if (/[\+\-]$/.test(input)) return;
                    setInput(prev => prev + k);
                  } else {
                    setInput(prev => prev + k);
                  }
                }}
                className={`h-14 text-2xl font-black rounded-xl transition-all active:scale-95 shadow-md
                  ${k === "+" || k === "-" 
                    ? "bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 hover:border-yellow-600 text-white" 
                    : "bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-yellow-600 text-gray-300"}`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Зелья — красивые круглые */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { dice: 2, bonus: 2, color: "from-red-600 to-red-800", height: "h-16" },
              { dice: 4, bonus: 4, color: "from-orange-600 to-red-700", height: "h-20" },
              { dice: 8, bonus: 8, color: "from-amber-500 to-orange-600", height: "h-24" },
              { dice: 10, bonus: 20, color: "from-yellow-400 to-amber-500", height: "h-28" }
            ].map((p, i) => (
              <button 
                key={i} 
                onClick={() => {
                  let res = p.bonus;
                  for (let j = 0; j < p.dice; j++) res += Math.floor(Math.random() * 4) + 1;
                  
                  const sign = input.startsWith('-') ? '-' : '+';
                  setInput(prev => prev + sign + res);
                }} 
                className={`relative group ${p.height} w-16 transform-gpu transition-all duration-300 hover:scale-125 active:scale-95`}
              >
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl border-4 border-white/30">
                  <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${p.color} opacity-95 ${p.height === "h-16" ? "h-10" : p.height === "h-20" ? "h-14" : p.height === "h-24" ? "h-18" : "h-24"} rounded-b-full`} />
                  {i >= 2 && <div className="absolute top-3 left-3 w-2 h-2 bg-white/50 rounded-full animate-float" />}
                  <div className="absolute top-1 left-2 w-4 h-8 bg-white/30 rounded-full blur-xl" />
                </div>
                <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-4 rounded-t-full ${i === 3 ? "bg-yellow-900 border-2 border-yellow-600" : "bg-red-900"} shadow-lg`} />
                <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white drop-shadow-lg">
                  {p.dice}d4 +{p.bonus}
                </div>
              </button>
            ))}
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => {
                const value = calculateExpression(input);
                if (value !== 0) applyDamageOrHeal(-Math.abs(value));
              }}
              className="bg-gradient-to-r from-red-800 to-red-900 py-6 rounded-2xl text-xl font-black hover:from-red-700 active:scale-95 shadow-2xl"
            >
              УРОН
            </button>

            <button 
              onClick={() => {
                const amount = calculateExpression(input);
                if (amount > 0) {
                  setChar(c => c ? { ...c, hp: { ...c.hp, temp: (c.hp.temp || 0) + amount } } : c);
                  setInput("");
                }
              }}
              className="bg-gradient-to-r from-purple-700 to-indigo-800 py-6 rounded-2xl text-xl font-black hover:from-purple-600 active:scale-95 shadow-2xl"
            >
              ВРЕМЕН.
            </button>

            <button 
              onClick={() => {
                const value = calculateExpression(input);
                if (value !== 0) applyDamageOrHeal(Math.abs(value));
              }}
              className="bg-gradient-to-r from-emerald-700 to-green-800 py-6 rounded-2xl text-xl font-black hover:from-emerald-600 active:scale-95 shadow-2xl"
            >
              ЛЕЧЕНИЕ
            </button>
          </div>

          {/* Кнопка «Настройки» */}
          <button 
            onClick={() => setShowSettings(s => !s)}
            className="mt-4 w-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl py-4 hover:border-yellow-500 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-3xl">⚙️</span>
            <span className="text-xl font-bold text-yellow-300">Настройки</span>
          </button>
        </div>

        {/* Панель настроек */}
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
}}