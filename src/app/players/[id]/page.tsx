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
    // САМАЯ НАДЁЖНАЯ ПРОВЕРКА НА МОБИЛКУ В 2025 ГОДУ
    const checkIfMobile = () => {
      // 1. Ширина экрана — главный критерий
      if (window.innerWidth <= 1024) return true;

      // 2. Touch-экран (почти все телефоны)
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return true;

      // 3. User-Agent (на всякий случай, даже если замаскирован)
      const ua = navigator.userAgent.toLowerCase();
      if (/android|iphone|ipad|ipod|mobile|tablet/i.test(ua)) return true;

      return false;
    };

    const isMobile = checkIfMobile();

    // Формируем правильный путь
    const version = isMobile ? "mobile" : "desktop";
    const newPath = `/players/sheet/${version}/${id}?id=${id}&password=${password}`;

    // Редиректим только если ещё не там
    if (window.location.pathname !== newPath.split("?")[0]) {
      router.replace(newPath);
    }
  }, [router, id, password]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-black text-purple-500 animate-pulse mb-8">
          ЦАРЬ ПРОБУЖДАЕТСЯ
        </div>
        <div className="text-yellow-400 text-3xl">Определяем устройство...</div>
      </div>
    </div>
  );
}