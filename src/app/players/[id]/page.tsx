// src/app/players/sheet/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CharacterSheetGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "bimbo";
  const password = searchParams.get("password") || "";

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const ua = navigator.userAgent;

    // ЕСЛИ ШИРИНА МЕНЬШЕ 1024 — ПРИНУДИТЕЛЬНО МОБИЛЬНАЯ ВЕРСИЯ
    if (width <= 1024) {
      router.replace(`/players/sheet/mobile/${id}?id=${id}&password=${password}`);
      return;
    }

    // ИНАЧЕ — ПК
    router.replace(`/players/sheet/desktop/${id}?id=${id}&password=${password}`);
  }, [router, id, password]);

  // Показываем, что определяем
  return (
    <div className="min-h-screen bg-red-900 flex items-center justify-center text-white text-center p-8">
      <div>
        <h1 className="text-6xl font-black mb-8">ДЕБАГ</h1>
        <p className="text-3xl">Ширина: {typeof window !== 'undefined' ? window.innerWidth : '??'}px</p>
        <p className="text-3xl mt-4">Через 1 сек — редирект...</p>
      </div>
    </div>
  );
}