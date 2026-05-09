'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

const categorias = [
  { nombre: 'Ropa', slug: 'ropa' },
  { nombre: 'Juguetes', slug: 'juguetes' },
  { nombre: 'Camas', slug: 'camas' },
  { nombre: 'Platos', slug: 'platos' },
  { nombre: 'Correas', slug: 'correas' },
  { nombre: 'Collares', slug: 'collares' },
  { nombre: 'Accesorios', slug: 'accesorios' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, signOut } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/productos?buscar=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Barra superior: azul marino */}
      <div className="bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center gap-4 overflow-visible">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-transparente.png"
              alt="Jagua Store"
              width={135}
              height={135}
              className="object-contain"
              style={{ height: '135px', width: '135px', position: 'relative', zIndex: 10 }}
              priority
            />
          </Link>

          {/* Buscador central */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿Qué necesita tu mascota?"
                className="w-full px-4 py-2.5 text-sm text-[#1A1A1A] bg-white rounded-l-full outline-none"
              />
              <button
                type="submit"
                className="bg-[#F5C518] hover:bg-[#D4A80A] px-4 py-2.5 rounded-r-full transition-colors"
              >
                <svg className="w-5 h-5 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Iconos derecha */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Login/Usuario */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 text-white hover:text-[#F5C518] transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden md:block text-xs font-medium">
                  {user ? 'Mi cuenta' : 'Ingresar'}
                </span>
              </button>

              {/* Dropdown usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {user ? (
                    <>
                      <Link href="/mi-cuenta" className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F7F7]" onClick={() => setUserMenuOpen(false)}>
                        Mi cuenta
                      </Link>
                      <Link href="/mis-pedidos" className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F7F7]" onClick={() => setUserMenuOpen(false)}>
                        Mis pedidos
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#F7F7F7]"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F7F7]" onClick={() => setUserMenuOpen(false)}>
                        Iniciar sesión
                      </Link>
                      <Link href="/registro" className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F7F7]" onClick={() => setUserMenuOpen(false)}>
                        Crear cuenta
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <Link href="/carrito" className="relative flex items-center gap-1.5 text-white hover:text-[#F5C518] transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden md:block text-xs font-medium">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 left-5 bg-[#F5C518] text-[#0F172A] text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Menú mobile */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Barra inferior: categorías (solo desktop) */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1">
            <Link href="/productos" className="px-4 py-3 text-sm font-semibold text-[#1A1A1A] hover:text-[#0F172A] hover:bg-[#F7F7F7] transition-colors">
              Todos
            </Link>
            {categorias.map(cat => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="px-4 py-3 text-sm font-semibold text-[#1A1A1A] hover:text-[#0F172A] hover:bg-[#F7F7F7] transition-colors whitespace-nowrap"
              >
                {cat.nombre}
              </Link>
            ))}
            <Link href="/ofertas" className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
              🔥 Ofertas
            </Link>
          </nav>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <form onSubmit={handleSearch} className="flex mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-l-full outline-none"
              />
              <button type="submit" className="bg-[#F5C518] px-4 py-2 rounded-r-full">
                <svg className="w-4 h-4 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            <Link href="/productos" className="block py-2.5 text-sm font-semibold text-[#1A1A1A]" onClick={() => setMenuOpen(false)}>Todos los productos</Link>
            {categorias.map(cat => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`}
                className="block py-2.5 text-sm font-semibold text-[#1A1A1A] border-t border-gray-50"
                onClick={() => setMenuOpen(false)}>
                {cat.nombre}
              </Link>
            ))}
            <Link href="/ofertas" className="block py-2.5 text-sm font-bold text-red-500 border-t border-gray-50" onClick={() => setMenuOpen(false)}>
              🔥 Ofertas
            </Link>
            <div className="border-t border-gray-100 mt-2 pt-2">
              {user ? (
                <>
                  <Link href="/mi-cuenta" className="block py-2.5 text-sm text-[#1A1A1A]" onClick={() => setMenuOpen(false)}>Mi cuenta</Link>
                  <Link href="/mis-pedidos" className="block py-2.5 text-sm text-[#1A1A1A]" onClick={() => setMenuOpen(false)}>Mis pedidos</Link>
                  <button onClick={() => { signOut(); setMenuOpen(false) }} className="block py-2.5 text-sm text-red-500">Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block py-2.5 text-sm text-[#1A1A1A]" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
                  <Link href="/registro" className="block py-2.5 text-sm text-[#1A1A1A]" onClick={() => setMenuOpen(false)}>Crear cuenta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
