"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavigationButtons from "@/components/NavigationButtons";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [login, setLogin] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleGetCode = () => {
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Введите корректный email");
      return;
    }
    setCodeSent(true);
    setError("Код отправлен! (заглушка — введите 123456)");
  };

  const handleRegister = () => {
    setError("");

    if (!email || !code || !login || !password || !confirmPassword) {
      setError("Заполните все обязательные поля");
      return;
    }

    if (code !== "123456") {
      setError("Неверный код подтверждения");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    // Сохраняем пользователя в localStorage (временная база)
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u: any) => u.email === email || u.login === login)) {
      setError("Email или логин уже заняты");
      return;
    }

    const newUser = {
      email,
      login,
      nickname: nickname || login,
      password, // В реальности — хэшировать!
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Автовход
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Регистрация успешна! Добро пожаловать в приключение!");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-8 relative">
      <NavigationButtons />

      <div className="w-full max-w-xl">
        <h1 className="text-6xl font-black text-center text-yellow-400 mb-12">
          РЕГИСТРАЦИЯ
        </h1>

        <div className="space-y-6">
          {/* Почта + кнопка */}
          <div className="flex items-center gap-4">
            <input
              type="email"
              placeholder="Почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
            />
            <button
              onClick={handleGetCode}
              className="px-6 py-4 text-xl font-bold bg-cyan-600 rounded-2xl hover:bg-cyan-500 transition"
            >
              Получить код
            </button>
          </div>

          {codeSent && (
            <input
              type="text"
              placeholder="Код из почты"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
            />
          )}

          <input
            type="text"
            placeholder="Логин (обязательно)"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
          />

          <input
            type="text"
            placeholder="Никнейм (по желанию)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
          />

          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
          />

          {error && (
            <p className="text-red-400 text-2xl text-center font-bold">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            className="w-full py-8 text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl shadow-2xl hover:scale-105 transition-all border-6 border-yellow-400"
          >
            НАЧАТЬ ПРИКЛЮЧЕНИЕ
          </button>
        </div>
      </div>
    </main>
  );
}