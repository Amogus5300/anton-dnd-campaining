"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CharacterSheetGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "bimbo";
  const password = searchParams.get("password") || "";

  useEffect(() => {
    // Ждём полной загрузки окна
    const handleLoad = () => {
      const width = window.innerWidth;

      // ЕСЛИ ШИРИНА ≤ 1024 — ЭТО ТЕЛЕФОН. ТОЧКА.
      if (width <= 1024) {
        router.replace(`/players/sheet/mobile/${id}?id=${id}&password=${password}`);
      } else {
        router.replace(`/players/sheet/desktop/${id}?id=${id}&password=${password}`);
      }
    };

    // Запускаем сразу + на всякий случай через 100мс и 500мс
    handleLoad();
    const t1 = setTimeout(handleLoad, 100);
    const t2 = setTimeout(handleLoad, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [router, id, password]);

  // Красивый экран ожидания
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-black text-yellow-500 animate-pulse">
          ЦАРЬ
        </div>
        <div className="text-4xl text-purple-400 mt-4">
          ВОСКРЕШАЕТСЯ...
        </div>
      </div>
    </div>
  );
}