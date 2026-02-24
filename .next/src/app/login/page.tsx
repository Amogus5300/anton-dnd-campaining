"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavigationButtons from "@/components/NavigationButtons";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrLogin, setEmailOrLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => 
      (u.email === emailOrLogin || u.login === emailOrLogin) && u.password === password
    );

    if (!user) {
      setError("Неверный логин/email или пароль");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-8 relative">
      <NavigationButtons />

      <div className="w-full max-w-xl">
        <h1 className="text-6xl font-black text-center text-yellow-400 mb-12">
          ВХОД
        </h1>

        <div className="space-y-6">
          <input
            type="text"
            placeholder="Логин или email"
            value={emailOrLogin}
            onChange={(e) => setEmailOrLogin(e.target.value)}
            className="w-full px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
          />

          {error && (
            <p className="text-red-400 text-2xl text-center font-bold">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-8 text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl hover:scale-105 transition-all border-6 border-purple-400"
          >
            ВОЙТИ
          </button>

          <div className="text-center space-y-4">
            <p className="text-2xl text-gray-300">
              Для новых авантюристов:
            </p>
            <Link href="/register">
              <button className="text-3xl font-black text-cyan-400 underline hover:text-cyan-300">
                РЕГИСТРАЦИЯ
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}