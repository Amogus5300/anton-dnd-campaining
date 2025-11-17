'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavigationButtons from '@/components/NavigationButtons'

export default function PlayersPage() {
  const [password, setPassword] = useState('')
  const [player, setPlayer] = useState<string | null>(null)

  // ПАРОЛИ ДЛЯ 7 ИГРОКОВ (ТЫ ПОТОМ ПОМЕНЯЕШЬ)
  const passwords: Record<string, string> = {
    'Паша': '0',
    'Жека': 'zheka456',
    'Дима': 'dima789',
    'Саня (Белей)': 'sanyaB777',
    'Назар': 'nazar000',
    'Игорь': 'igor555',
    'Саня (Белоусов)': 'sanyaBel999',
  }

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  const found = Object.entries(passwords).find(([_, pass]) => pass === password)
  if (found) {
    const playerName = found[0]
    localStorage.setItem('currentPlayer', playerName) // ← ВОТ ЭТА СТРОКА
    setPlayer(playerName)
  } else {
    alert('Неверный пароль!')
    setPassword('')
  }
}

  // ЭКРАН ПОСЛЕ УСПЕШНОГО ВХОДА
  if (player) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-black text-amber-100 font-serif p-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold mb-6 text-purple-300 drop-shadow-lg">
              Добро пожаловать, {player}!
            </h1>
            <p className="text-xl mb-8 text-purple-200">
              Ты вошёл в кампейн.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
              <Link
                href="/player-sheet"
                className="bg-gradient-to-r from-purple-700 to-indigo-700 border-2 border-purple-500 rounded-xl p-6 hover:scale-105 transition-all shadow-lg"
              >
                <h3 className="text-2xl font-bold text-amber-100">Лист персонажа</h3>
                <p className="text-sm mt-1 opacity-80">→ Редактируй характеристики</p>
              </Link>

              <Link
                href="/homebrew"
                className="bg-gradient-to-r from-amber-700 to-red-700 border-2 border-amber-500 rounded-xl p-6 hover:scale-105 transition-all shadow-lg"
              >
                <h3 className="text-2xl font-bold text-amber-100">Хоум Брю</h3>
                <p className="text-sm mt-1 opacity-80">→ Домашние правила</p>
              </Link>
            </div>

            <button
              onClick={() => {
                setPlayer(null)
                setPassword('')
              }}
              className="text-purple-300 underline hover:text-purple-100 transition-colors"
            >
              ← Выйти
            </button>
          </div>
        </div>
        <NavigationButtons />
      </>
    )
  }

  // ЭКРАН ВХОДА
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 text-amber-100 font-serif p-8">
        <div className="container mx-auto max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 text-purple-400 drop-shadow-lg">
            Вход для игроков
          </h1>

          <form onSubmit={handleSubmit} className="bg-stone-800 border-2 border-purple-600 rounded-xl p-8 shadow-2xl">
            <label className="block text-lg mb-4 text-purple-200">
              Введи свой пароль:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-stone-900 border border-purple-700 text-amber-100 mb-6 focus:outline-none focus:border-purple-400 transition-colors"
              placeholder="••••••••"
              autoFocus
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 rounded transition-all shadow-md"
            >
              Войти в кампейн
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-purple-300">
            <p className="mb-2">Игроки:</p>
            <ul className="space-y-1 opacity-80">
              <li>Паша • Жека • Дима</li>
              <li>Саня (Белей) • Назар</li>
              <li>Игорь • Саня (Белоусов)</li>
            </ul>
          </div>

          <div className="text-center mt-8">
            <Link href="/" className="text-purple-300 underline hover:text-purple-100">
              ← На главную
            </Link>
          </div>
        </div>
      </div>
      <NavigationButtons />
    </>
  )
}