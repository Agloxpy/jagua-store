import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductosGrid from '@/app/productos/ProductosGrid'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const { data: cat } = await supabaseAdmin
    .from('categorias')
    .select('nombre')
    .eq('slug', params.slug)
    .single()
  return { title: cat ? `${cat.nombre} — Jagua Store` : 'Categoría — Jagua Store' }
}

export default async function CategoriaPage({ params }: Props) {
  const { data: categoria } = await supabaseAdmin
    .from('categorias')
    .select('id, nombre, descripcion, imagen_url')
    .eq('slug', params.slug)
    .eq('activo', true)
    .maybeSingle()

  if (!categoria) return notFound()

  const { data: productos } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, slug, imagenes, precio_venta, precio_oferta, oferta_activa, categoria:categorias(id, nombre, slug)')
    .eq('activo', true)
    .eq('categoria_id', categoria.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Banner de categoría */}
      <div className="bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 flex items-center gap-6">
          {categoria.imagen_url && (
            <img
              src={categoria.imagen_url}
              alt={categoria.nombre}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-2 border-[#F5C518]"
            />
          )}
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <span>›</span>
              <Link href="/productos" className="hover:text-white transition-colors">Productos</Link>
              <span>›</span>
              <span className="text-white">{categoria.nombre}</span>
            </nav>
            <h1 className="text-3xl font-black">{categoria.nombre}</h1>
            {categoria.descripcion && (
              <p className="text-gray-400 text-sm mt-1">{categoria.descripcion}</p>
            )}
            <p className="text-[#F5C518] text-sm mt-1 font-semibold">
              {productos?.length ?? 0} producto{(productos?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <ProductosGrid
          productos={(productos as any) ?? []}
          tituloCategoria={categoria.nombre}
        />
      </div>
    </div>
  )
}
