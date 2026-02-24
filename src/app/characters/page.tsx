"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NavigationButtons from "@/components/NavigationButtons";

interface SimpleCharacter {
  id: string;
  name: string;
  race?: string;
  class?: string;
  level: number;
  avatar?: string;
}

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<SimpleCharacter[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const hasCreated = useRef(false);

  // Пароль от аккаунта — берём из localStorage (как в login)
  const accountPassword = localStorage.getItem("password") || localStorage.getItem("userPassword") || "";

  // Загрузка персонажей — с защитой от дублей по ID
  useEffect(() => {
    const charsMap = new Map<string, SimpleCharacter>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("character_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          if (data.id && !charsMap.has(data.id)) {
            charsMap.set(data.id, {
              id: data.id,
              name: data.name || "Без имени",
              race: data.race,
              class: data.class,
              level: data.level || 1,
              avatar: data.avatar,
            });
          }
        } catch (e) {
          console.error("Ошибка чтения персонажа:", key);
        }
      }
    }
    setCharacters(Array.from(charsMap.values()));
  }, []);

  const createNewCharacter = () => {
    router.push("/characters/new");
  };

  const deleteCharacter = (id: string) => {
    if (confirm("Ты уверен, что хочешь удалить этого героя навсегда?")) {
      localStorage.removeItem(`character_${id}`);
      setCharacters(prev => prev.filter(ch => ch.id !== id));
    }
  };

  const deleteAllCharacters = () => {
    if (deletePassword === accountPassword) {
      if (confirm("ВНИМАНИЕ! Это удалит ВСЕХ персонажей навсегда. Ты точно уверен?")) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("character_")) {
            localStorage.removeItem(key);
          }
        }
        setCharacters([]);
        setShowDeleteAllModal(false);
        setDeletePassword("");
        alert("Все персонажи удалены.");
      }
    } else {
      alert("Неверный пароль!");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex flex-col p-8 relative">
      <NavigationButtons />

      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-6xl font-black text-yellow-400 tracking-wider">
            МОИ ПЕРСОНАЖИ
          </h1>

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="w-14 h-14 bg-black/80 border-4 border-yellow-600 rounded-full flex items-center justify-center hover:bg-yellow-600 hover:text-black transition-all shadow-2xl"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {viewMode === "grid" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              )}
            </svg>
          </button>
        </div>

        <button
          onClick={createNewCharacter}
          className="w-full py-5 text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl shadow-xl hover:scale-105 transition-all border-4 border-yellow-400 mb-10"
        >
          + СОЗДАТЬ НОВОГО ПЕРСОНАЖА
        </button>

        {characters.length === 0 ? (
          <div className="text-center mt-32">
            <p className="text-4xl text-gray-400 mb-12">Пока нет ни одного героя...</p>
          </div>
        ) : (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-6"}>
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="relative group bg-black/60 backdrop-blur-xl border-4 border-purple-600 rounded-3xl overflow-hidden shadow-2xl hover:border-yellow-400 transition-all"
                >
                  <button
                    onClick={() => router.replace(`/characters/${char.id}`)}
                    className="w-full p-6 flex items-center gap-8"
                  >
                    <div className={`rounded-3xl border-4 border-yellow-600 overflow-hidden flex-shrink-0 ${
                      viewMode === "grid" ? "w-48 h-48" : "w-36 h-36"
                    }`}>
                      {char.avatar ? (
                        <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
                          <span className={`font-black text-yellow-500 ${viewMode === "grid" ? "text-8xl" : "text-6xl"}`}>
                            {char.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <h2 className="text-4xl font-black text-yellow-300 mb-1">
                        {char.name}
                      </h2>
                      <p className="text-2xl text-cyan-300">
                        {char.race || "??"} — {char.class || "??"} • Ур. {char.level}
                      </p>
                    </div>
                  </button>

                  {/* Кнопка удаления — мусорка */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCharacter(char.id);
                    }}
                    className="absolute top-4 right-4 w-12 h-12 bg-red-900/80 border-4 border-red-600 rounded-full flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all shadow-xl"
                    title="Удалить персонажа"
                  >
                    <span className="text-3xl font-black text-red-300">🗑</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Кнопка удаления всех */}
            <div className="mt-12 text-center">
              <button
                onClick={() => setShowDeleteAllModal(true)}
                className="px-8 py-4 text-xl font-black bg-red-900/80 border-4 border-red-600 rounded-2xl hover:bg-red-800 hover:scale-105 transition-all shadow-xl"
              >
                УДАЛИТЬ ВСЕХ ПЕРСОНАЖЕЙ
              </button>
            </div>
          </>
        )}
      </div>

      {/* Модалка подтверждения удаления всех */}
      {showDeleteAllModal && (
        <>
          <div className="fixed inset-0 bg-black/90 z-50" onClick={() => setShowDeleteAllModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <div className="bg-black/90 border-8 border-red-600 rounded-3xl p-10 max-w-md w-full shadow-2xl">
              <h2 className="text-5xl font-black text-red-400 text-center mb-8">
                ПОДТВЕРЖДЕНИЕ
              </h2>
              <p className="text-2xl text-gray-300 text-center mb-8">
                Введи пароль от аккаунта, чтобы удалить всех персонажей навсегда:
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full bg-gray-900 border-4 border-red-600 rounded-2xl text-3xl text-center py-4 mb-8 text-white"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setShowDeleteAllModal(false);
                    setDeletePassword("");
                  }}
                  className="py-4 text-2xl font-black bg-gray-800 rounded-2xl border-4 border-gray-600"
                >
                  ОТМЕНА
                </button>
                <button
                  onClick={deleteAllCharacters}
                  className="py-4 text-2xl font-black bg-red-700 rounded-2xl border-4 border-red-500 hover:bg-red-600"
                >
                  УДАЛИТЬ ВСЕХ
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}