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
    // САМАЯ НАДЁЖНАЯ ПРОВЕРКА В 2025 ГОДУ — ТОЛЬКО ПО ШИРИНЕ ЭКРАНА
    const width = typeof window !== "undefined" ? window.innerWidth : 1920;

    if (width <= 1024) {
      // ЕСЛИ ЭКРАН МАЛЕНЬКИЙ — ПРИНУДИТЕЛЬНО МОБИЛЬНАЯ ВЕРСИЯ
      router.replace(`/players/sheet/mobile/${id}?id=${id}&password=${password}`);
    } else {
      // ЕСЛИ БОЛЬШОЙ — ПОЛНАЯ ВЕРСИЯ
      router.replace(`/players/sheet/desktop/${id}?id=${id}&password=${password}`);
    }
  }, [router, id, password]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-black text-purple-500 animate-pulse mb-8">
          ЦАРЬ ОПРЕДЕЛЯЕТ УСТРОЙСТВО
        </div>
        <div className="text-yellow-400 text-3xl">
          Ширина: {typeof window !== "undefined" ? window.innerWidth : "??"}px
        </div>
      </div>
    </div>
  );
}