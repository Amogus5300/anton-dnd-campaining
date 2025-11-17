'use client'
import NavigationButtons from '@/components/NavigationButtons'

export default function ACDamagePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-950 to-black text-amber-100 font-serif p-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-6 text-amber-400">
            КД, броня и повреждения
          </h1>

          <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-amber-300">Класс доспеха (КД):</h3>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li>От брони — <strong>не зависит от Ловкости</strong></li>
              <li>Распространяется на <strong>защиту без доспехов</strong></li>
              <li>Броня с помехой на скрытность — <strong>помеха на реакцию</strong></li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-amber-300">Атака:</h3>
            <ul className="list-disc list-inside ml-6 space-y-2">
              <li><strong>Через Ловкость</strong> — в уязвимое место</li>
              <li><strong>Через Силу</strong> — пробивает броню</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 text-amber-300">Пробитие брони:</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-700">
                  <th className="py-1">Тип</th>
                  <th className="py-1">Снижение КД</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Рубящий</td><td><strong>-3</strong></td></tr>
                <tr><td>Дробящий</td><td><strong>-2</strong></td></tr>
                <tr><td>Колющий</td><td><strong>-1</strong></td></tr>
              </tbody>
            </table>
            <p className="text-sm text-amber-300 mt-2">Полное разрушение магией → КД = 10</p>

            <h3 className="text-xl font-bold mt-6 text-amber-300">Система повреждений:</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-700">
                  <th className="py-1">% урона</th>
                  <th className="py-1">Эффект</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>10%+</td><td>Конечность <strong>повреждена</strong></td></tr>
                <tr><td>20%+</td><td>Конечность <strong>недееспособна</strong></td></tr>
                <tr><td>30%+</td><td>Конечность <strong>потеряна</strong></td></tr>
                <tr><td>40%+ в голову</td><td>ОД = 0</td></tr>
                <tr><td>50%+ в голову</td><td>Смерть (если нужна голова)</td></tr>
              </tbody>
            </table>

            <p className="mt-6 text-sm text-amber-300">
              Атака в голову через Ловкость: <strong>КД +1</strong>, цель уклоняется с <strong>преимуществом</strong>
            </p>
          </div>
        </div>
      </div>

      <NavigationButtons />
    </>
  )
}