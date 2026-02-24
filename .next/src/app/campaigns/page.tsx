"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationButtons from "@/components/NavigationButtons";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("campaigns");
    if (stored) setCampaigns(JSON.parse(stored));
  }, []);

  const createCampaign = () => {
    if (!newName.trim()) return;

    const newCamp = {
      id: Date.now().toString(),
      name: newName,
      owner: localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")!).login : "Гость",
      members: [],
    };

    const updated = [...campaigns, newCamp];
    setCampaigns(updated);
    localStorage.setItem("campaigns", JSON.stringify(updated));
    setNewName("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-8 relative">
      <NavigationButtons />

      <div className="w-full max-w-4xl">
        <h1 className="text-6xl font-black text-center text-yellow-400 mb-12">
          МОИ КАМПАНИИ
        </h1>

        <div className="flex gap-4 mb-12">
          <input
            type="text"
            placeholder="Название кампании"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-6 py-4 text-2xl bg-black/60 border-4 border-purple-600 rounded-2xl focus:border-yellow-400 outline-none"
          />
          <button
            onClick={createCampaign}
            className="px-8 py-4 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl hover:scale-105 transition border-4 border-green-400"
          >
            Создать
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((camp) => (
            <div key={camp.id} className="bg-black/60 border-4 border-purple-600 rounded-2xl p-6 hover:border-yellow-400 transition">
              <h3 className="text-3xl font-bold text-yellow-300">{camp.name}</h3>
              <p className="text-xl text-gray-400">Мастер: {camp.owner}</p>
              <button
                onClick={() => router.push(`/campaigns/${camp.id}`)}
                className="mt-4 px-6 py-3 bg-purple-600 rounded-xl text-xl font-bold hover:bg-purple-500"
              >
                Открыть
              </button>
            </div>
          ))}
        </div>

        {campaigns.length === 0 && (
          <p className="text-3xl text-center text-gray-400">
            Пока нет кампаний. Создай первую!
          </p>
        )}
      </div>
    </main>
  );
}