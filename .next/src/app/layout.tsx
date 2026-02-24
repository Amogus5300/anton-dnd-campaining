import type { Metadata } from "next";
import './globals.css';
import { roboto } from "@/lib/fonts";   // предполагаю, что путь правильный

export const metadata: Metadata = {
  title: "D&D Character Sheet",
  description: "Современный лист персонажа для D&D 5e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={roboto.variable}>
      <body
        className={`
          min-h-screen 
          bg-gradient-to-br from-purple-950 via-black to-indigo-950 
          text-white
          ${roboto.className}   // если хочешь применить класс вместо переменной
        `}
      >
        {children}
      </body>
    </html>
  );
}