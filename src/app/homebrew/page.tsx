'use client'

import Link from 'next/link'
import NavigationButtons from '@/components/NavigationButtons'

export default function HomebrewPage() {
  const mechanics = [
    { name: 'Реакция', slug: 'mech1', color: 'bg-red-900' },
    { name: 'Контратаки и дуэли', slug: 'mech2', color: 'bg-purple-900' },
    { name: 'КД, броня и повреждения', slug: 'mech3', color: 'bg-amber-900' },
    { name: 'Другие хоумрулы', slug: 'mech4', color: 'bg-emerald-900' },
    { name: 'Другие изменения в правилах', slug: 'mech5', color: 'bg-blue-900' },
  ]

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-black to-stone-950 text-amber-100 font-serif p-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold text-center mb-4 text-amber-400">
            Хоум Брю
          </h1>
          <p className="text-center text-amber-300 mb-12">
            Домашние правила и механики кампейна
          </p>

          {/* ПЕРВЫЕ 4 КНОПКИ — 2 колонки */}
          <div className="grid md:grid-cols-2 gap-6">
            {mechanics.slice(0, 4).map(mech => (
              <Link
                key={mech.slug}
                href={`/homebrew/${mech.slug}`}
                className={`${mech.color} border-2 border-amber-600 rounded-xl p-6 text-center hover:scale-105 transition-transform`}
              >
                <h3 className="text-2xl font-bold text-amber-200">{mech.name}</h3>
                <p className="text-sm mt-2 opacity-80">→ Подробнее</p>
              </Link>
            ))}

            {/* ПЯТАЯ КНОПКА — ПО ЦЕНТРУ */}
            <div className="md:col-span-2 flex justify-center mt-6">
              <Link
                href={`/homebrew/${mechanics[4].slug}`}
                className={`${mechanics[4].color} border-2 border-amber-600 rounded-xl p-6 text-center hover:scale-105 transition-transform w-full md:w-1/2 lg:w-1/3`}
              >
                <h3 className="text-2xl font-bold text-amber-200">{mechanics[4].name}</h3>
                <p className="text-sm mt-2 opacity-80">→ Подробнее</p>
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/" className="text-amber-300 underline">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>

      {/* КНОПКИ НАВИГАЦИИ */}
      <NavigationButtons />
    </>
  )
}