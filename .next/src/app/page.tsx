"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserAvatar from "@/components/UserAvatar";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    setIsLoggedIn(!!user);
  }, []);

  const handleAdventurerClick = () => {
    if (isLoggedIn) {
      router.push("/player");
    } else {
      router.push("/login");
    }
  };

  const handleMasterClick = () => {
    if (isLoggedIn) {
      router.push("/campaigns");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex flex-col items-center justify-center p-8 relative">
      {/* Аватар в правом верхнем углу */}
      <div className="absolute top-8 right-8 z-50">
        <UserAvatar />
      </div>

      <div className="text-center space-y-16">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-600 tracking-wider drop-shadow-2xl">
          D&D CHARACTER SHEET
        </h1>

        <div className="space-y-10">
          {/* Авантюрист — работает как ты хочешь */}
          <button
            onClick={handleAdventurerClick}
            className="w-96 py-10 text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-8 border-cyan-400"
          >
            ПРОДОЛЖИТЬ КАК АВАНТЮРИСТ
          </button>

          {/* Мастер — теперь тоже проверяет авторизацию */}
          <button
            onClick={handleMasterClick}
            className="w-96 py-10 text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-8 border-purple-400"
          >
            ПРОДОЛЖИТЬ КАК МАСТЕР
          </button>

          {/* Правила — для всех */}
          <button
            onClick={() => router.push("/rules")}
            className="w-96 py-10 text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-8 border-green-400"
          >
            ВАНИЛЬНЫЕ ПРАВИЛА
          </button>
        </div>

        <p className="text-gray-400 text-xl mt-20">
          Создавай героев • Веди кампании • Погружайся в приключения
        </p>
      </div>
    </main>
  );
}