'use client'
import DiceButton from '@/components/DiceButton'
import Link from 'next/link'
import NavigationButtons from '@/components/NavigationButtons'

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-black to-stone-950 text-amber-100 font-serif p-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-6xl font-bold mb-8 text-amber-400 drop-shadow-lg">
            D&D Кампейн
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Link
              href="/homebrew"
              className="bg-amber-900 border-2 border-amber-600 rounded-xl p-8 hover:scale-105 transition-transform"
            >
              <h3 className="text-3xl font-bold text-amber-200">Хоум Брю</h3>
              <p className="mt-2 opacity-80">→ Домашние правила</p>
            </Link>

            {/* НОВАЯ КНОПКА */}
            <Link
              href="/vanilla"
              className="bg-green-900 border-2 border-green-600 rounded-xl p-8 hover:scale-105 transition-transform"
            >
              <h3 className="text-3xl font-bold text-green-200">Ванильные правила и классы</h3>
              <p className="mt-2 opacity-80">→ Официальные D&D 5e</p>
            </Link>
          </div>

          <div className="text-amber-300">
            <Link href="/players" className="underline">
              → Вход для игроков
            </Link>
          </div>
        </div>
      </div>

      <NavigationButtons />
      <DiceButton />
    </>
  )
}