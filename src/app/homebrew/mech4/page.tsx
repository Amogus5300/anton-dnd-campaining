import NavigationButtons from '@/components/NavigationButtons'

export default function CombatManeuvers() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-950 to-black text-amber-100 font-serif p-8">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-center mb-6 text-red-400">
            Боевые манёвры
          </h1>

          <div className="bg-stone-800 border-2 border-red-600 rounded-xl p-6 space-y-4">
            <p>
              <strong>Ты можешь потратить очко манёвра</strong> (1 на ход), чтобы выполнить особое действие:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Толчок:</strong> Сбей врага с ног (Сила vs Ловкость)</li>
              <li><strong>Обход:</strong> Переместись на 5 футов без провоцирования атаки</li>
              <li><strong>Удар щитом:</strong> +2 к КД до следующего хода</li>
            </ul>
            <p className="text-sm text-amber-300">
              *Очки манёвров восстанавливаются после короткого отдыха.*
            </p>
          </div>
        </div>
      </div>

      <NavigationButtons />
    </>
  )
}