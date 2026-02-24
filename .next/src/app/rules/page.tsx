"use client";

import NavigationButtons from "@/components/NavigationButtons";

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-8 relative">
      <NavigationButtons />

      <div className="text-center">
        <h1 className="text-6xl font-black text-yellow-400 mb-12">
          ВАНИЛЬНЫЕ ПРАВИЛА 5E
        </h1>
        <p className="text-3xl text-gray-400">
          Официальные правила D&D 5-й редакции (скоро)
        </p>
      </div>
    </main>
  );
}