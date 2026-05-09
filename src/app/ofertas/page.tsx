/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export const metadata = {
  title: '🔥 Ofertas — Jagua Store',
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n)
}

function calcDescuento(venta: number, oferta: number) {
  return Math.round((1 - oferta / venta) * 100)
}

export default async function OfertasPage() {
  const { data: productos } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, slug, imagenes, precio_venta, precio_oferta, oferta_activa, categoria:categorias(id, nombre, slug)')
    .eq('activo', true)
    .eq('oferta_activa', true)
    .not('precio_oferta', 'is', null)
    .order('created_at', { ascending: false })

  const ofertas = productos ?? []

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Banner */}
      <div className="bg-[#F5C518]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-xs text-[#0F172A]/60 mb-3">
            <Link href="/" className="hover:text-[#0F172A] transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-[#0F172A] font-semibold">Ofertas</span>
          </nav>
          <h1 className="text-4xl font-black text-[#0F172A]">🔥 Ofertas especiales</h1>
          <p className="text-[#0F172A]/70 mt-2">
            Aprovechá los mejores precios · {ofertas.length} producto{ofertas.length !== 1 ? 's' : ''} en oferta
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {ofertas.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-xl font-semibold">No hay ofertas activas en este momento</p>
            <p className="text-sm mt-2">Volvé pronto para ver nuestras promociones</p>
            <Link
              href="/productos"
              className="inline-block mt-6 px-6 py-3 bg-[#0F172A] text-white font-black rounded-xl hover:bg-[#1e2d47] transition-colors"
            >
              Ver todos los productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ofertas.map(p => {
              const descuento = p.precio_oferta ? calcDescuento(p.precio_venta, p.precio_oferta) : 0
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
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                      -{descuento}%
                    </span>
                    {(p.categoria as any)?.nombre && (
                      <span className="absolute bottom-2 right-2 bg-white/90 text-[#1A1A1A] text-xs font-semibold px-2 py-0.5 rounded-full">
                        {(p.categoria as any).nombre}
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
                        {formatPrice(p.precio_oferta!)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(p.precio_venta)}
                      </span>
                    </div>
                    <span className="block w-full text-center py-2 bg-[#F5C518] text-[#0F172A] font-black rounded-xl text-sm group-hover:bg-[#D4A80A] transition-colors">
                      Ver oferta
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
