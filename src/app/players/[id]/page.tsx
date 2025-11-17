'use client'
import { useState } from 'react'
import DiceButton from '@/components/DiceButton'

export default function PlayerPage({ params }: { params: { id: string } }) {
  const { id } = params

  // Пример данных персонажей (потом будет из базы)
  const playerCharacters = {
    'pasha': [
      { id: 1, name: 'Громтар', class: 'Варвар', level: 5 },
      { id: 2, name: 'Лира', class: 'Бард', level: 4 },
    ],
    'zheka': [
      { id: 3, name: 'Сильвия', class: 'Друид', level: 6 },
    ],
    // ... другие игроки
  }[id] || []

  const [characters, setCharacters] = useState(playerCharacters)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newClass, setNewClass] = useState('')
  const [newLevel, setNewLevel] = useState('1')

  const createCharacter = () => {
    if (newName && newClass) {
      const newChar = {
        id: Date.now(),
        name: newName,
        class: newClass,
        level: parseInt(newLevel),
      }
      setCharacters([...characters, newChar])
      setNewName('')
      setNewClass('')
      setNewLevel('1')
      setShowCreate(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-black to-stone-950 text-amber-100 font-serif">
        <div className="container mx-auto p-8">
          <h1 className="text-5xl font-bold text-center mb-8 text-amber-400">
            {id.replace('-', ' ').toUpperCase()}
          </h1>

          {/* Кнопка создания */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCreate(true)}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-6 py-3 rounded-lg"
            >
              + Создать персонажа
            </button>
          </div>

          {/* Список персонажей */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {characters.map(char => (
              <div
                key={char.id}
                className="bg-stone-800 border-2 border-amber-600 rounded-xl p-6 hover:bg-stone-700 transition-all"
              >
                <h3 className="text-2xl font-bold text-amber-300">{char.name}</h3>
                <p className="text-amber-200">{char.class} — ур. {char.level}</p>
                <button className="mt-3 w-full bg-green-600 hover:bg-green-500 text-black font-bold py-2 rounded">
                  Редактировать лист
                </button>
              </div>
            ))}
          </div>

          {/* Модалка создания */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-amber-400 mb-4">Новый персонаж</h3>
                <input
                  type="text"
                  placeholder="Имя персонажа"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-3 mb-3 rounded bg-stone-700 text-white border border-amber-700"
                />
                <input
                  type="text"
                  placeholder="Класс"
                  value={newClass}
                  onChange={e => setNewClass(e.target.value)}
                  className="w-full p-3 mb-3 rounded bg-stone-700 text-white border border-amber-700"
                />
                <input
                  type="number"
                  placeholder="Уровень"
                  value={newLevel}
                  onChange={e => setNewLevel(e.target.value)}
                  className="w-full p-3 mb-4 rounded bg-stone-700 text-white border border-amber-700"
                  min="1"
                  max="20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={createCharacter}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold p-3 rounded"
                  >
                    Создать
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-black font-bold p-3 rounded"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DiceButton />
    </>
  )
}