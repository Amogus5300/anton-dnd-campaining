// src/app/players/dashboard/page.tsx
import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-4xl text-purple-500 animate-pulse">Загрузка персонажей...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}