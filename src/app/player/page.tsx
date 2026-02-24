"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavigationButtons from "@/components/NavigationButtons";

export default function PlayerPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-8 relative">
      <NavigationButtons />

      <div className="w-full max-w-2xl text-center space-y-12">
        <h1 className="text-6xl font-black text-yellow-400">
          АВАНТЮРИСТ
        </h1>

        <div className="space-y-8">
          <button
            onClick={() => router.push("/characters")}
            className="w-full py-8 text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl shadow-2xl hover:scale-105 transition-all border-6 border-cyan-400"
          >
            МОИ ПЕРСОНАЖИ
          </button>

          <button
            onClick={() => router.push("/campaigns")}
            className="w-full py-8 text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl hover:scale-105 transition-all border-6 border-purple-400"
          >
            МОИ КАМПАНИИ
          </button>
        </div>
      </div>
    </main>
  );
}