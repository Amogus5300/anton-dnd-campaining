import NavigationButtons from '@/components/NavigationButtons'
import DiceButton from '@/components/DiceButton'

export default function MapPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-black to-stone-950 text-amber-100 font-serif">
        <div className="container mx-auto p-8">
          <h1 className="text-5xl font-bold text-center mb-8 text-amber-400">Карта мира</h1>

          <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-12 max-w-4xl mx-auto text-center">
            <p className="text-xl text-amber-300">
              Она ушла, но обещала вернуться...
            </p>
          </div>
        </div>
      </div>
      <NavigationButtons />
      <DiceButton />
    </>
  )
}