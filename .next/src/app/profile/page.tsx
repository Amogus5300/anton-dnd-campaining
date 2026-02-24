"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NavigationButtons from "@/components/NavigationButtons";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUser(parsed);
      setTempNickname(parsed.nickname || parsed.login || "Гость");
      // Загружаем аватар
      const savedAvatar = localStorage.getItem(`avatar_${parsed.login}`);
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem(`avatar_${currentUser.login}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const startEditingNickname = () => {
    setTempNickname(currentUser.nickname || currentUser.login || "Гость");
    setIsEditingNickname(true);
  };

  const saveNickname = () => {
    if (!currentUser) return;

    const newNickname = tempNickname.trim() || currentUser.login;
    const updatedUser = { ...currentUser, nickname: newNickname };
    
    // Сохраняем в localStorage
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setIsEditingNickname(false);
  };

  const cancelEditing = () => {
    setIsEditingNickname(false);
  };

  const displayName = currentUser ? (currentUser.nickname || currentUser.login || "Гость") : "Гость";

  if (!currentUser) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-8 relative">
      <NavigationButtons />

      <div className="w-full max-w-md text-center">
        {/* Круглый портрет */}
        <div className="mb-10">
          <button
            onClick={handleAvatarClick}
            className="relative inline-block"
          >
            <div className="w-48 h-48 rounded-full border-8 border-yellow-500 shadow-2xl overflow-hidden hover:border-yellow-300 transition-all">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Портрет" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/80 border-4 border-yellow-600 rounded-full p-3">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </button>
        </div>

        {/* Никнейм — теперь редактируемый */}
        <div className="mb-12">
          {isEditingNickname ? (
            <div className="flex items-center justify-center gap-4">
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveNickname();
                  if (e.key === "Escape") cancelEditing();
                }}
                autoFocus
                className="text-5xl font-black text-yellow-400 bg-transparent border-b-4 border-yellow-500 outline-none text-center px-4"
              />
              <div className="flex gap-2">
                <button onClick={saveNickname} className="text-green-400 text-3xl">✓</button>
                <button onClick={cancelEditing} className="text-red-400 text-3xl">✕</button>
              </div>
            </div>
          ) : (
            <h2 
              onClick={startEditingNickname}
              className="text-5xl font-black text-yellow-400 cursor-pointer hover:text-yellow-300 transition-all select-none"
              title="Кликни, чтобы изменить никнейм"
            >
              {displayName}
            </h2>
          )}
        </div>

        {/* Меню ссылок */}
        <div className="space-y-6">
          <button
            onClick={() => router.push("/characters")}
            className="w-full py-6 text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-xl hover:scale-105 transition-all border-4 border-purple-400"
          >
            МОИ ПЕРСОНАЖИ
          </button>

          <button
            onClick={() => router.push("/campaigns")}
            className="w-full py-6 text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl shadow-xl hover:scale-105 transition-all border-4 border-green-400"
          >
            МОИ КАМПАНИИ
          </button>

          <button
            onClick={() => router.push("/rules")}
            className="w-full py-6 text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl shadow-xl hover:scale-105 transition-all border-4 border-cyan-400"
          >
            ВАНИЛЬНЫЕ ПРАВИЛА
          </button>

          <button
            disabled
            className="w-full py-6 text-3xl font-bold bg-gray-800 rounded-2xl shadow-xl border-4 border-gray-600 cursor-not-allowed opacity-60"
          >
            ОБРАТНАЯ СВЯЗЬ (скоро)
          </button>
        </div>
      </div>

      {/* Скрытый инпут для аватара */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </main>
  );
}