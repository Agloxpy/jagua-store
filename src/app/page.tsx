import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/HeroSlider'

const categorias = [
  { nombre: 'Ropa', slug: 'ropa', emoji: '👕', desc: 'Prendas para perros y gatos' },
  { nombre: 'Juguetes', slug: 'juguetes', emoji: '🎾', desc: 'Diversión garantizada' },
  { nombre: 'Camas', slug: 'camas', emoji: '🛏️', desc: 'Para el mejor descanso' },
  { nombre: 'Platos', slug: 'platos', emoji: '🍽️', desc: 'Hora de comer' },
  { nombre: 'Correas', slug: 'correas', emoji: '🦮', desc: 'Paseos seguros' },
  { nombre: 'Collares', slug: 'collares', emoji: '🏷️', desc: 'Estilo y seguridad' },
  { nombre: 'Accesorios', slug: 'accesorios', emoji: '✨', desc: 'Todo lo que necesitan' },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0
  }).format(price)
}

function calcDescuento(precioVenta: number, precioOferta: number) {
  return Math.round((1 - precioOferta / precioVenta) * 100)
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: ofertas } = await supabase
    .from('productos')
    .select('id, nombre, slug, imagenes, precio_venta, precio_oferta, oferta_hasta')
    .eq('activo', true)
    .eq('oferta_activa', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Slider */}
      <HeroSlider />

      {/* Categorías */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-[#1A1A1A] text-center mb-2">¿Qué estás buscando?</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Explorá nuestras categorías</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categorias.map(cat => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`}
                className="bg-[#F7F7F7] rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all border-2 border-transparent hover:border-[#F5C518]">
                <div className="text-4xl mb-2">{cat.emoji}</div>
                <div className="font-bold text-[#1A1A1A] text-sm">{cat.nombre}</div>
                <div className="text-xs text-gray-500 mt-1">{cat.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ofertas */}
      {ofertas && ofertas.length > 0 && (
        <section className="py-14 px-4 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#1A1A1A]">🔥 Ofertas especiales</h2>
                <p className="text-gray-500 text-sm mt-1">Aprovechá los mejores precios</p>
              </div>
              <Link href="/ofertas" className="text-sm font-bold text-[#0F172A] hover:text-[#F5C518] transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ofertas.map((producto) => (
                <Link key={producto.id} href={`/producto/${producto.slug}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="aspect-square bg-[#F7F7F7] relative">
                    {producto.imagenes?.[0] ? (
                      <img src={producto.imagenes[0]} alt={producto.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>
                    )}
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">
                      -{calcDescuento(producto.precio_venta, producto.precio_oferta)}%
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-2 mb-2">{producto.nombre}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-black text-[#0F172A]">{formatPrice(producto.precio_oferta)}</span>
                      <span className="text-xs text-gray-400 line-through">{formatPrice(producto.precio_venta)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Por qué elegirnos */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="font-black text-[#1A1A1A] text-lg mb-1">Delivery a todo el país</h3>
            <p className="text-gray-500 text-sm">Enviamos a los 18 departamentos del Paraguay</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-black text-[#1A1A1A] text-lg mb-1">Calidad garantizada</h3>
            <p className="text-gray-500 text-sm">Productos seleccionados para el bienestar de tu mascota</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">💛</div>
            <h3 className="font-black text-[#1A1A1A] text-lg mb-1">+23.000 clientes felices</h3>
            <p className="text-gray-500 text-sm">La tienda de mascotas más querida de Paraguay</p>
          </div>
        </div>
      </section>

    </div>
  )
}
