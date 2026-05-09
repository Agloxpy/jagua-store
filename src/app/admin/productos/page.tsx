/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import ProductosTable from './ProductosTable'

export default async function AdminProductosPage() {
  const supabase = supabaseAdmin

  const [{ data: productos }, { data: categorias }] = await Promise.all([
    supabase
      .from('productos')
      .select(`
        id, nombre, slug, imagenes, precio_costo, precio_venta, precio_oferta,
        oferta_activa, activo, tiene_variantes, created_at,
        categoria:categorias(id, nombre),
        variantes(id, stock, activo)
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('categorias')
      .select('id, nombre')
      .eq('activo', true)
      .order('orden'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A]">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{productos?.length ?? 0} productos en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-[#F5C518] text-[#0F172A] font-black px-6 py-3 rounded-xl hover:bg-[#D4A80A] transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <ProductosTable productos={(productos as any) ?? []} categorias={categorias ?? []} />
    </div>
  )
}
