'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteProducto } from './actions'

type Producto = {
  id: string
  nombre: string
  slug: string
  imagenes: string[] | null
  precio_costo: number
  precio_venta: number
  precio_oferta: number | null
  oferta_activa: boolean
  activo: boolean
  tiene_variantes: boolean
  created_at: string
  categoria: { id: string; nombre: string } | null
  variantes: { id: string; stock: number; activo: boolean }[] | null
}

type Categoria = { id: string; nombre: string }

interface Props {
  productos: Producto[]
  categorias: Categoria[]
}

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

function calcMargen(costo: number, venta: number) {
  if (costo === 0) return 0
  return Math.round((venta - costo) / costo * 100)
}

export default function ProductosTable({ productos, categorias }: Props) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || p.categoria?.id === catFilter
    return matchSearch && matchCat
  })

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    try {
      await deleteProducto(id)
    } catch {
      alert('Error al eliminar el producto')
      setDeleting(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Filtros */}
      <div className="p-4 border-b border-gray-100 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0F172A]"
        />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0F172A]"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <span className="flex items-center text-sm text-gray-400 px-2">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left py-3 px-4 text-gray-500 font-semibold">Producto</th>
              <th className="text-left py-3 px-4 text-gray-500 font-semibold">Categoría</th>
              <th className="text-right py-3 px-4 text-gray-500 font-semibold">P. Costo</th>
              <th className="text-right py-3 px-4 text-gray-500 font-semibold">P. Venta</th>
              <th className="text-right py-3 px-4 text-gray-500 font-semibold">Margen</th>
              <th className="text-right py-3 px-4 text-gray-500 font-semibold">Stock</th>
              <th className="text-center py-3 px-4 text-gray-500 font-semibold">Oferta</th>
              <th className="text-center py-3 px-4 text-gray-500 font-semibold">Estado</th>
              <th className="text-center py-3 px-4 text-gray-500 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-400">
                  {search || catFilter ? 'No se encontraron productos con ese filtro' : 'No hay productos aún'}
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const stockTotal = p.variantes?.reduce((sum, v) => sum + (v.activo ? v.stock : 0), 0) ?? 0
                const margen = calcMargen(p.precio_costo, p.precio_venta)
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.imagenes?.[0] ? (
                            <img src={p.imagenes[0]} alt={p.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">🐾</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0F172A] max-w-48 truncate">{p.nombre}</div>
                          <div className="text-xs text-gray-400 font-mono">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{p.categoria?.nombre ?? '—'}</td>
                    <td className="py-3 px-4 text-right text-gray-500 text-xs">{formatGs(p.precio_costo)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0F172A]">{formatGs(p.precio_venta)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold text-sm ${margen >= 30 ? 'text-green-600' : margen >= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                        {margen}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${stockTotal === 0 ? 'text-red-500' : stockTotal <= 5 ? 'text-amber-500' : 'text-gray-700'}`}>
                        {stockTotal}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.oferta_activa ? (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">🔥 Oferta</span>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/productos/${p.id}/editar`}
                          className="p-1.5 rounded-lg hover:bg-[#F5C518]/20 text-[#0F172A] transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.nombre)}
                          disabled={deleting === p.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30"
                          title="Eliminar"
                        >
                          {deleting === p.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
