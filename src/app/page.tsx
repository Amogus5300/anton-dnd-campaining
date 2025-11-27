import DiceButton from '@/components/DiceButton'
export default function Home() {
  return (
    <>
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl md:text-7xl font-bold mb-16 text-center">
        D&D Кампейн
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Хоум Брю */}
        <a
          href="/homebrew"
          className="bg-orange-900 hover:bg-orange-800 transition-all duration-300 rounded-2xl p-10 text-center shadow-2xl transform hover:scale-105"
        >
          <h2 className="text-3xl font-bold">Хоум Брю</h2>
          <p className="text-orange-200 mt-2">+ Домашние правила</p>
        </a>

        {/* Ванильные правила и классы */}
        <a
          href="/rules"
          className="bg-green-900 hover:bg-green-800 transition-all duration-300 rounded-2xl p-10 text-center shadow-2xl transform hover:scale-105"
        >
          <h2 className="text-3xl font-bold">Ванильные правила и КЛАССЫ</h2>
          <p className="text-green-200 mt-2">← Официальные ДнД 5e</p>
        </a>

        {/* НОВАЯ КНОПКА — КАРТА */}
        <a
          href="/map"
          className="bg-purple-900 hover:bg-purple-800 transition-all duration-300 rounded-2xl p-10 text-center shadow-2xl transform hover:scale-105"
        >
          <h2 className="text-3xl font-bold">Карта кампейна</h2>
          <p className="text-purple-200 mt-2">Мир, города, подземелья</p>
        </a>

        {/* Вход для игроков — теперь в том же стиле! */}
        <a
          href="/players"
          className="bg-blue-900 hover:bg-blue-800 transition-all duration-300 rounded-2xl p-10 text-center shadow-2xl transform hover:scale-105"
        >
          <h2 className="text-3xl font-bold">Для игроков — вход</h2>
          <p className="text-blue-200 mt-2">Лист персонажа и всё остальное</p>
        </a>
      </div>

      <div className="mt-16 text-gray-500 text-sm">
        © #"Я ТУТ ПАПОЧКА"
      </div>
    </div>
    <DiceButton />
    </>
  )
}