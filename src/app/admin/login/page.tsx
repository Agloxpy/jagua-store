'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-claro.png" alt="Jagua Store" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#0F172A]">Panel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresá con tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#0F172A] transition-colors text-sm"
              placeholder="admin@jaguastore.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#0F172A] transition-colors text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F172A] text-white font-black py-3 rounded-xl hover:bg-[#1E293B] transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
