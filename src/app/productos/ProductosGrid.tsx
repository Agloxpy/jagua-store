'use client'

import { useState } from 'react'
import Link from 'next/link'

type Producto = {
  id: string
  nombre: string
  slug: string
  imagenes: string[] | null
  precio_venta: number
  precio_oferta: number | null
  oferta_activa: boolean
  categoria: { id: string; nombre: string; slug: string } | null
}

type Categoria = { id: string; nombre: string; slug: string }

interface Props {
  productos: Producto[]
  categorias?: Categoria[]
  initialSearch?: string
  tituloCategoria?: string
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n)
}

function calcDescuento(venta: number, oferta: number) {
  return Math.round((1 - oferta / venta) * 100)
}

export default function ProductosGrid({ productos, categorias, initialSearch = '', tituloCategoria }: Props) {
  const [search, setSearch] = useState(initialSearch)
  const [catFilter, setCatFilter] = useState('')

  const filtered = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || p.categoria?.id === catFilter
    return matchSearch && matchCat
  })

  return (
    <div>
      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-l-full outline-none focus:border-[#0F172A]"
          />
          <span className="bg-[#F5C518] px-4 py-2.5 rounded-r-full flex items-center">
            <svg className="w-4 h-4 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        {categorias && categorias.length > 0 && !tituloCategoria && (
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-full text-sm outline-none focus:border-[#0F172A] bg-white"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        )}

        <span className="flex items-center text-sm text-gray-400 px-2">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🐾</div>
          <p className="font-semibold text-lg">No encontramos productos</p>
          <p className="text-sm mt-2">
            {search ? `No hay resultados para "${search}"` : 'No hay productos en esta categoría aún'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-sm text-[#0F172A] underline hover:no-underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => {
            const precio = p.oferta_activa && p.precio_oferta ? p.precio_oferta : p.precio_venta
            const descuento = p.oferta_activa && p.precio_oferta
              ? calcDescuento(p.precio_venta, p.precio_oferta)
              : null

            return (
              <Link
                key={p.id}
                href={`/producto/${p.slug}`}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 group"
              >
                {/* Imagen */}
                <div className="aspect-square bg-[#F7F7F7] relative overflow-hidden">
                  {p.imagenes?.[0] ? (
                    <img
                      src={p.imagenes[0]}
                      alt={p.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🐾</div>
                  )}
                  {descuento && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                      -{descuento}%
                    </span>
                  )}
                  {p.categoria && (
                    <span className="absolute bottom-2 right-2 bg-white/90 text-[#1A1A1A] text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {p.categoria.nombre}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-2 mb-3 min-h-[2.5rem]">
                    {p.nombre}
                  </p>
                  <div className="flex items-end gap-2 mb-3 flex-wrap">
                    <span className="text-xl font-black text-[#0F172A]">
                      {formatPrice(precio)}
                    </span>
                    {descuento && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(p.precio_venta)}
                      </span>
                    )}
                  </div>
                  <span className="block w-full text-center py-2 bg-[#F5C518] text-[#0F172A] font-black rounded-xl text-sm group-hover:bg-[#D4A80A] transition-colors">
                    Ver producto
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
