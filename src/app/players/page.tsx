"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayersLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      router.push(`/players/dashboard?password=${encodeURIComponent(password)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-12 rounded-3xl shadow-2xl border-4 border-purple-600">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
          Вход для игроков
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введи свой пароль"
          className="w-full px-6 py-4 text-2xl bg-gray-800 border-2 border-purple-500 rounded-xl focus:border-pink-500 outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="mt-8 w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold rounded-xl hover:scale-105 transition-all"
        >
          Войти
        </button>
      </form>
    </div>
  );
}