"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function UserAvatar() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleClick = () => {
    if (currentUser) {
      setShowMenu(true);
    } else {
      router.push("/login");
    }
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowMenu(false);
    setShowConfirm(false);
    router.push("/");
  };

  const displayName = currentUser ? (currentUser.nickname || currentUser.login) : null;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center gap-4 px-6 py-3 bg-black/80 border-4 border-yellow-600 rounded-2xl hover:bg-yellow-600 hover:text-black transition-all shadow-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        {displayName && <span className="text-2xl font-bold">{displayName}</span>}
      </button>

      {/* Меню */}
      {showMenu && currentUser && (
        <div className="absolute right-0 top-16 w-56 bg-black/95 border-4 border-purple-600 rounded-2xl shadow-2xl z-50">
          <button
            onClick={() => {
              setShowMenu(false);
              router.push("/profile");
            }}
            className="w-full px-5 py-3 text-left text-xl font-bold hover:bg-purple-900/50 transition"
          >
            Настройка профиля
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              handleLogout();
            }}
            className="w-full px-5 py-3 text-left text-xl font-bold text-red-400 hover:bg-red-900/50 transition border-t-2 border-purple-800"
          >
            Выйти
          </button>
        </div>
      )}

      {/* Подтверждение выхода */}
      {showConfirm && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setShowConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-red-950 to-black border-6 border-red-600 rounded-3xl p-8">
              <h3 className="text-3xl font-black text-red-400 mb-6 text-center">
                Выйти из аккаунта?
              </h3>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-8 py-3 bg-gray-700 rounded-2xl text-xl font-bold hover:bg-gray-600"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-8 py-3 bg-gradient-to-r from-red-700 to-red-900 rounded-2xl text-xl font-bold hover:scale-105 border-4 border-red-500"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
    </div>
  );
}