'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isRegister) {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      })
      if (res.ok) {
        signIn('credentials', { name, password })
      } else {
        const data = await res.json()
        setError(data.error)
      }
    } else {
      const result = await signIn('credentials', {
        name, password, redirect: false
      })
      if (result?.error) setError('Неверное имя или пароль')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-black flex items-center justify-center p-4">
      <div className="bg-stone-800 border-2 border-amber-600 rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-amber-400 text-center mb-6">
          {isRegister ? 'Регистрация' : 'Вход'}
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя (Паша, Жека...)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-stone-700 text-white border border-amber-700"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-stone-700 text-white border border-amber-700"
            required
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold p-3 rounded">
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <p className="text-center mt-4 text-amber-300">
          <button onClick={() => setIsRegister(!isRegister)} className="underline">
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта? Зарегистрируйся'}
          </button>
        </p>
      </div>
    </div>
  )
}