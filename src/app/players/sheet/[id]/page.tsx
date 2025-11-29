// src/app/players/sheet/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileCharacterSheetContent from "../MobileCharacterSheetContent";

export default function CharacterSheetMobileEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "bimbo";
  const password = searchParams.get("password") || "";

  useEffect(() => {
    // Проверка, что мы на клиенте и экран большой → ПК → редирект на десктоп
    if (typeof window !== "undefined" && window.innerWidth > 1024) {
      const current = window.location.pathname + window.location.search;
      const desktop = current.replace("/sheet/", "/sheet/desktop/");
      window.location.replace(desktop);
    }
  }, []);

  return <MobileCharacterSheetContent id={id} password={password} />;
}