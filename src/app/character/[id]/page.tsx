import DiceButton from '@/components/DiceButton'

export default function CharacterPage({ params }: { params: { id: string } }) {
  const { id } = params

  const character = {
    1: { name: 'Алекс', class: 'Варвар', level: 5 },
    2: { name: 'Марина', class: 'Маг', level: 6 },
    3: { name: 'Дима', class: 'Рейнджер', level: 4 },
  }[id] || { name: 'Неизвестно', class: '', level: 0 }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-black to-stone-950 text-amber-100 font-serif">
        <div className="container mx-auto p-8">
          <h1 className="text-5xl font-bold text-center mb-8 text-amber-400">
            {character.name} — {character.class} ур. {character.level}
          </h1>

          <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-center text-amber-300 mb-4">
              Это приватная страница. Только ты и Мастер можете её видеть.
            </p>
            <div className="text-center">
              <button className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-6 py-3 rounded-lg">
                Редактировать лист
              </button>
            </div>
          </div>
        </div>
      </div>
      <DiceButton />
    </>
  )
}