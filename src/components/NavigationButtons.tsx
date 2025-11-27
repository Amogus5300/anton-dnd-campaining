'use client'
import { useRouter } from 'next/navigation'

export default function NavigationButtons() {
  const router = useRouter()

  return (
    <div className="fixed bottom-4 left-4 flex gap-3 z-50">
      {/* Главная */}
      <button
        onClick={() => router.push('/')}
        className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-5 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Главная
      </button>

      {/* Назад */}
      <button
        onClick={() => router.back()}
        className="bg-stone-700 hover:bg-stone-600 text-amber-300 font-bold px-5 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад
      </button>
    </div>
  )
}