import { supabaseAdmin } from '@/lib/supabase/admin'
import ProductosGrid from './ProductosGrid'

interface Props {
  searchParams: { buscar?: string }
}

export const metadata = {
  title: 'Todos los productos — Jagua Store',
}

export default async function ProductosPage({ searchParams }: Props) {
  const buscar = searchParams.buscar || ''

  const [{ data: productos }, { data: categorias }] = await Promise.all([
    supabaseAdmin
      .from('productos')
      .select('id, nombre, slug, imagenes, precio_venta, precio_oferta, oferta_activa, categoria:categorias(id, nombre, slug)')
      .eq('activo', true)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('categorias')
      .select('id, nombre, slug')
      .eq('activo', true)
      .order('orden'),
  ])

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1A1A1A]">Todos los productos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Todo lo que tu mascota necesita en un solo lugar
          </p>
        </div>

        <ProductosGrid
          productos={(productos as any) ?? []}
          categorias={categorias ?? []}
          initialSearch={buscar}
        />
      </div>
    </div>
  )
}
