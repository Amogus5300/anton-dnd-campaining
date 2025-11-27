import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-4xl text-purple-400 animate-pulse">Загрузка империи...</div>}>
      <DashboardContent />
    </Suspense>
  );
}