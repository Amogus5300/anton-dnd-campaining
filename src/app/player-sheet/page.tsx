'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavigationButtons from '@/components/NavigationButtons'

interface Character {
  name: string
  race: string
  class: string
  level: number
  background: string
  alignment: string
  playerName: string
  stats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  hp: { current: number; max: number; temp: number }
  ac: number
  speed: number
  proficiency: number
  skills: Record<string, boolean>
  spells: string[]
  inventory: string[]
  notes: string
}

const defaultCharacter: Character = {
  name: '',
  race: '',
  class: '',
  level: 1,
  background: '',
  alignment: 'Нейтральный',
  playerName: '',
  stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  hp: { current: 0, max: 0, temp: 0 },
  ac: 10,
  speed: 30,
  proficiency: 2,
  skills: {},
  spells: [],
  inventory: [],
  notes: ''
}

export default function PlayerSheet() {
  const [character, setCharacter] = useState<Character>(defaultCharacter)
  const [pdfFile, setPdfFile] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'edit' | 'pdf'>('edit')
  const router = useRouter()

  // Автозагрузка игрока из localStorage (после входа)
  useEffect(() => {
    const player = localStorage.getItem('currentPlayer')
    if (!player) {
      router.push('/players')
      return
    }
    const saved = localStorage.getItem(`character_${player}`)
    if (saved) {
      setCharacter(JSON.parse(saved))
    } else {
      setCharacter({ ...defaultCharacter, playerName: player })
    }
  }, [router])

  // Автосохранение
  useEffect(() => {
    const player = localStorage.getItem('currentPlayer')
    if (player && character.playerName) {
      localStorage.setItem(`character_${player}`, JSON.stringify(character))
    }
  }, [character])

  const updateStat = (stat: keyof Character['stats'], value: string) => {
    const num = parseInt(value) || 0
    setCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: num }
    }))
  }

  const getModifier = (stat: number) => {
    const mod = Math.floor((stat - 10) / 2)
    return mod >= 0 ? `+${mod}` : mod.toString()
  }

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        setCharacter(data)
        alert('Лист импортирован!')
      } catch {
        alert('Ошибка: неверный формат JSON')
      }
    }
    reader.readAsText(file)
  }

  const exportJson = () => {
    const data = JSON.stringify(character, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.name || 'character'}.json`
    a.click()
  }

  const importPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPdfFile(ev.target?.result as string)
      setActiveTab('pdf')
    }
    reader.readAsDataURL(file)
  }

  const TabButton = ({ tab, label }: { tab: 'edit' | 'pdf'; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 font-bold rounded-t-lg transition-all ${
        activeTab === tab
          ? 'bg-amber-700 text-amber-100 border-b-4 border-amber-500'
          : 'bg-stone-700 text-amber-300 hover:bg-stone-600'
      }`}
    >
      {label}
    </button>
  )

  if (activeTab === 'pdf' && pdfFile) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-black text-amber-100 font-serif p-4">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-4 mb-4 flex justify-between items-center">
              <TabButton tab="edit" label="Редактор" />
              <TabButton tab="pdf" label="PDF Лист" />
              <button
                onClick={() => { setPdfFile(null); setActiveTab('edit') }}
                className="text-red-400 underline"
              >
                Закрыть PDF
              </button>
            </div>
            <iframe src={pdfFile} className="w-full h-screen rounded-lg border-2 border-amber-700" />
          </div>
        </div>
        <NavigationButtons />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-black text-amber-100 font-serif p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-4 mb-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
              <TabButton tab="edit" label="Редактор" />
              <TabButton tab="pdf" label="PDF Лист" />
            </div>

            <div className="flex gap-3 flex-wrap">
              <label className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
                Импорт JSON
                <input type="file" accept=".json" onChange={importJson} className="hidden" />
              </label>
              <button onClick={exportJson} className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Экспорт JSON
              </button>
              <label className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded cursor-pointer">
                Импорт PDF
                <input type="file" accept=".pdf" onChange={importPdf} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ОСНОВНЫЕ ХАРАКТЕРИСТИКИ */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-stone-900 border border-amber-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-amber-300 mb-4">Основное</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Имя персонажа" value={character.name} onChange={e => setCharacter(prev => ({ ...prev, name: e.target.value }))} className="p-3 bg-stone-800 border border-amber-600 rounded text-lg" />
                  <input placeholder="Игрок" value={character.playerName} readOnly className="p-3 bg-stone-800 border border-amber-600 rounded text-lg opacity-70" />
                  <input placeholder="Раса" value={character.race} onChange={e => setCharacter(prev => ({ ...prev, race: e.target.value }))} className="p-3 bg-stone-800 border border-amber-600 rounded" />
                  <input placeholder="Класс и уровень" value={`${character.class} ${character.level}`} onChange={e => {
                    const match = e.target.value.match(/(.+) (\d+)/)
                    if (match) {
                      setCharacter(prev => ({ ...prev, class: match[1], level: parseInt(match[2]) }))
                    }
                  }} className="p-3 bg-stone-800 border border-amber-600 rounded" />
                  <input placeholder="Предыстория" value={character.background} onChange={e => setCharacter(prev => ({ ...prev, background: e.target.value }))} className="p-3 bg-stone-800 border border-amber-600 rounded" />
                  <select value={character.alignment} onChange={e => setCharacter(prev => ({ ...prev, alignment: e.target.value }))} className="p-3 bg-stone-800 border border-amber-600 rounded">
                    <option>Законный добрый</option>
                    <option>Нейтральный добрый</option>
                    <option>Хаотичный добрый</option>
                    <option>Законный нейтральный</option>
                    <option>Нейтральный</option>
                    <option>Хаотичный нейтральный</option>
                    <option>Законный злой</option>
                    <option>Нейтральный злой</option>
                    <option>Хаотичный злой</option>
                  </select>
                </div>
              </div>

              {/* ХАРАКТЕРИСТИКИ */}
              <div className="bg-stone-900 border border-amber-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-amber-300 mb-4">Характеристики</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(stat => (
                    <div key={stat} className="text-center">
                      <label className="block text-sm text-amber-400 uppercase">{stat === 'strength' ? 'Сил' : stat === 'dexterity' ? 'Лов' : stat === 'constitution' ? 'Tel' : stat === 'intelligence' ? 'Инт' : stat === 'wisdom' ? 'Мдр' : 'Хар'}</label>
                      <input
                        type="number"
                        value={character.stats[stat]}
                        onChange={e => updateStat(stat, e.target.value)}
                        className="w-16 p-2 mt-1 bg-stone-800 border border-amber-600 rounded text-center text-xl font-bold"
                      />
                      <div className="mt-1 text-lg font-bold text-amber-300">{getModifier(character.stats[stat])}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* БОЕВЫЕ ХАРАКТЕРИСТИКИ */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-stone-900 border border-amber-700 rounded-lg p-4 text-center">
                  <label className="text-amber-400">КД</label>
                  <input type="number" value={character.ac} onChange={e => setCharacter(prev => ({ ...prev, ac: parseInt(e.target.value) || 0 }))} className="w-20 p-2 mt-1 bg-stone-800 border border-amber-600 rounded text-2xl font-bold text-center" />
                </div>
                <div className="bg-stone-900 border border-amber-700 rounded-lg p-4 text-center">
                  <label className="text-amber-400">ХП</label>
                  <div className="flex justify-center gap-1 mt-1">
                    <input type="number" value={character.hp.current} onChange={e => setCharacter(prev => ({ ...prev, hp: { ...prev.hp, current: parseInt(e.target.value) || 0 } }))} className="w-16 p-2 bg-stone-800 border border-red-600 rounded text-xl text-center" />
                    <span className="text-2xl">/</span>
                    <input type="number" value={character.hp.max} onChange={e => setCharacter(prev => ({ ...prev, hp: { ...prev.hp, max: parseInt(e.target.value) || 0 } }))} className="w-16 p-2 bg-stone-800 border border-amber-600 rounded text-xl text-center" />
                  </div>
                </div>
                <div className="bg-stone-900 border border-amber-700 rounded-lg p-4 text-center">
                  <label className="text-amber-400">Скорость</label>
                  <input type="number" value={character.speed} onChange={e => setCharacter(prev => ({ ...prev, speed: parseInt(e.target.value) || 0 }))} className="w-20 p-2 mt-1 bg-stone-800 border border-amber-600 rounded text-xl text-center" />
                </div>
              </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА */}
            <div className="space-y-6">
              {/* ЗАКЛИНАНИЯ */}
              <div className="bg-stone-900 border border-amber-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">Заклинания</h3>
                <textarea
                  placeholder="Fire Bolt, Shield, Magic Missile..."
                  value={character.spells.join('\n')}
                  onChange={e => setCharacter(prev => ({ ...prev, spells: e.target.value.split('\n').filter(s => s.trim()) }))}
                  className="w-full h-32 p-3 bg-stone-800 border border-amber-600 rounded text-sm"
                />
              </div>

              {/* ИНВЕНТАРЬ */}
              <div className="bg-stone-900 border border-amber-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">Инвентарь</h3>
                <textarea
                  placeholder="Меч +1, Кожаная броня, 50 зм..."
                  value={character.inventory.join('\n')}
                  onChange={e => setCharacter(prev => ({ ...prev, inventory: e.target.value.split('\n').filter(s => s.trim()) }))}
                  className="w-full h-32 p-3 bg-stone-800 border border-amber-600 rounded text-sm"
                />
              </div>

              {/* ЗАМЕТКИ */}
              <div className="bg-stone-900 border border-amber-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">Заметки</h3>
                <textarea
                  placeholder="Квест: найти артефакт..."
                  value={character.notes}
                  onChange={e => setCharacter(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full h-40 p-3 bg-stone-800 border border-amber-600 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <NavigationButtons />
    </>
  )
}