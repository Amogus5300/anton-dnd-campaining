"use client";

import { useRouter } from "next/navigation";

export default function NavigationButtons() {
  const router = useRouter();

  return (
    <div className="fixed top-8 left-8 z-50 flex gap-6">
      {/* Кнопка "Назад" — стрелка влево */}
      <button
        onClick={() => router.back()}
        className="w-14 h-14 bg-black/80 border-4 border-yellow-600 rounded-2xl flex items-center justify-center hover:bg-yellow-600 hover:text-black transition-all shadow-2xl"
        title="Назад"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Кнопка "Домой" */}
      <button
        onClick={() => router.push("/")}
        className="w-14 h-14 bg-black/80 border-4 border-yellow-600 rounded-2xl flex items-center justify-center hover:bg-yellow-600 hover:text-black transition-all shadow-2xl"
        title="На главную"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </button>
    </div>
  );
}