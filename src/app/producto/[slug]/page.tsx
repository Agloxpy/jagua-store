/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import ProductoDetalle from './ProductoDetalle'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabaseAdmin
    .from('productos')
    .select('nombre, descripcion, imagenes')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'Producto — Jagua Store' }

  return {
    title: `${data.nombre} — Jagua Store`,
    description: data.descripcion ?? undefined,
    openGraph: {
      images: data.imagenes?.[0] ? [data.imagenes[0]] : [],
    },
  }
}

export default async function ProductoPage({ params }: Props) {
  const { data: producto } = await supabaseAdmin
    .from('productos')
    .select(`
      id, nombre, slug, descripcion,
      precio_costo, precio_venta, precio_oferta, oferta_activa, oferta_hasta,
      imagenes, tiene_variantes, activo, destacado,
      categoria:categorias(id, nombre, slug),
      variantes(id, talle, color, color_hex, precio_costo, precio_venta, precio_oferta, oferta_activa, iva, stock, activo)
    `)
    .eq('slug', params.slug)
    .eq('activo', true)
    .maybeSingle()

  if (!producto) return notFound()

  return <ProductoDetalle producto={producto as any} />
}
