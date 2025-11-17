'use client'

import NavigationButtons from '@/components/NavigationButtons'
import Tooltip from '@/components/Tooltip'

export default function Page() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-950 text-amber-100 font-serif p-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-5xl font-bold text-center mb-8 text-red-400 drop-shadow-lg">
            Контратаки и дуэли
          </h1>

          <div className="bg-stone-800 border-2 border-red-600 rounded-xl p-8 space-y-10 shadow-2xl">

            {/* ПАРИРОВАНИЕ */}
            <section>
              <h2 className="text-2xl font-bold text-amber-300 mb-4">
                <Tooltip text="Попытка заблокировать атаку, с возможностью контратаки">
                  Парирование
                </Tooltip>
              </h2>
              <div className="bg-stone-900 border border-red-700 rounded-lg p-5">
                <p className="mb-3">
                  Проверка <strong>Ловкости</strong> определяет результат:
                </p>
                <ul className="space-y-2 text-sm">
                  <li><strong>1</strong> → Потеря оружия или падение</li>
                  <li><strong>1 &lt; результат &lt; сложность</strong> → Атака проходит</li>
                  <li><strong>= сложность</strong> → Соревнование Силы до 3 очков</li>
                  <li><strong>&gt; сложность</strong> → Атака с <strong>преимуществом</strong></li>
                  <li><strong>20</strong> → Враг теряет равновесие, атака с <strong>помехой</strong></li>
                </ul>
                <p className="text-red-300 text-xs mt-2">Помеха против тяжёлого оружия</p>
              </div>
            </section>

            {/* КОНТРАТАКА */}
            <section>
              <h2 className="text-2xl font-bold text-amber-300 mb-4">
                <Tooltip text="Удар в уязвимое место после блока">
                  Контратака
                </Tooltip>
              </h2>
              <div className="bg-stone-900 border border-red-700 rounded-lg p-5">
                <ul className="space-y-2 text-sm">
                  <li>Проверка Ловкости с <strong>помехой</strong></li>
                  <li>Противодействие — с <strong>помехой</strong></li>
                  <li>Нельзя контратаковать контратаку</li>
                </ul>
              </div>
            </section>

            {/* ДУЭЛЬ */}
            <section>
              <h2 className="text-2xl font-bold text-amber-300 mb-4">
                Дуэль
              </h2>
              <div className="bg-stone-900 border border-red-700 rounded-lg p-5">
                <p className="mb-3">
                  При <strong>парировании</strong> или <strong>контратаке</strong> — начинается <strong>дуэль</strong>:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Ходят друг за другом <strong>3 раунда</strong></li>
                  <li>Каждый 4-й — с обычным раундом</li>
                  <li>Перемещение: <strong>÷10</strong></li>
                  <li>1 действие или БД за ход</li>
                  <li>Провоцированная атака при постороннем действии</li>
                </ul>
              </div>
            </section>

            {/* ОКРУЖЕНИЕ */}
            <section>
            <h2 className="text-2xl font-bold text-amber-300 mb-4">
             Окружение
            </h2>
              <div className="bg-stone-900 border border-red-700 rounded-lg p-5 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-red-700">
                      <th className="py-2">Врагов</th>
                      <th className="py-2">Штрафы</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="py-1">2</td><td>Помеха на уклонение/парирование</td></tr>
                    <tr><td className="py-1">3</td><td>— + <strong>-5</strong> ко всем</td></tr>
                    <tr><td className="py-1">4</td><td>— + <strong>-10</strong></td></tr>
                    <tr><td className="py-1">5+</td><td>Двойная помеха + <strong>-15</strong></td></tr>
                  </tbody>
                </table>
                <p className="text-xs text-amber-300 mt-2">
                  Если враги на 1+ уровень выше — штрафы не применяются
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      <NavigationButtons />
    </>
  )
}