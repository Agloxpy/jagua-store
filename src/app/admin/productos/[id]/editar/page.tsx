/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import ProductoFormClient from '@/components/admin/ProductoFormClient'

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const supabase = supabaseAdmin

  const [{ data: producto }, { data: categorias }] = await Promise.all([
    supabase
      .from('productos')
      .select(`
        id, nombre, slug, descripcion, categoria_id, precio_costo, precio_venta,
        precio_oferta, oferta_activa, oferta_hasta, imagenes,
        tiene_variantes, activo, destacado,
        variantes(id, talle, color, color_hex, precio_costo, precio_venta, precio_oferta, oferta_activa, iva, stock, activo)
      `)
      .eq('id', params.id)
      .single(),
    supabase
      .from('categorias')
      .select('id, nombre')
      .eq('activo', true)
      .order('orden'),
  ])

  if (!producto) notFound()

  return (
    <ProductoFormClient
      categorias={categorias ?? []}
      producto={producto as any}
    />
  )
}
