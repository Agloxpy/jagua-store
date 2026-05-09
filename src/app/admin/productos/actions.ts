'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface VarianteInput {
  id?: string
  talle: string
  color: string
  color_hex: string
  precio_costo: number | null
  precio_venta: number | null
  precio_oferta: number | null
  oferta_activa: boolean
  iva: number
  stock: number
  activo: boolean
  _delete?: boolean
}

export interface ProductoInput {
  id: string
  nombre: string
  slug: string
  descripcion: string
  categoria_id: string | null
  precio_costo: number
  precio_venta: number
  precio_oferta: number | null
  oferta_activa: boolean
  oferta_hasta: string | null
  imagenes: string[]
  tiene_variantes: boolean
  activo: boolean
  destacado: boolean
}

export async function deleteProducto(id: string) {
  const supabase = supabaseAdmin
  await supabase.from('variantes').delete().eq('producto_id', id)
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/productos')
}

export async function saveProducto(data: ProductoInput, variantes: VarianteInput[]) {
  const supabase = supabaseAdmin

  const { data: producto, error } = await supabase
    .from('productos')
    .insert({
      id: data.id,
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || null,
      categoria_id: data.categoria_id || null,
      precio_costo: data.precio_costo,
      precio_venta: data.precio_venta,
      precio_oferta: data.precio_oferta,
      oferta_activa: data.oferta_activa,
      oferta_hasta: data.oferta_hasta,
      imagenes: data.imagenes,
      tiene_variantes: data.tiene_variantes,
      activo: data.activo,
      destacado: data.destacado,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const toInsert = variantes
    .filter(v => !v._delete)
    .map(v => ({
      producto_id: producto.id,
      talle: v.talle || null,
      color: v.color || null,
      color_hex: v.color_hex || null,
      precio_costo: v.precio_costo,
      precio_venta: v.precio_venta,
      precio_oferta: v.precio_oferta,
      oferta_activa: v.oferta_activa,
      iva: v.iva,
      stock: v.stock,
      activo: v.activo,
    }))

  if (toInsert.length > 0) {
    const { error: ve } = await supabase.from('variantes').insert(toInsert)
    if (ve) throw new Error(ve.message)
  }

  revalidatePath('/admin/productos')
  return { id: producto.id }
}

export async function updateProducto(
  id: string,
  data: Omit<ProductoInput, 'id'>,
  variantes: VarianteInput[]
) {
  const supabase = supabaseAdmin

  const { error } = await supabase
    .from('productos')
    .update({
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || null,
      categoria_id: data.categoria_id || null,
      precio_costo: data.precio_costo,
      precio_venta: data.precio_venta,
      precio_oferta: data.precio_oferta,
      oferta_activa: data.oferta_activa,
      oferta_hasta: data.oferta_hasta,
      imagenes: data.imagenes,
      tiene_variantes: data.tiene_variantes,
      activo: data.activo,
      destacado: data.destacado,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  for (const v of variantes) {
    if (v._delete && v.id) {
      await supabase.from('variantes').delete().eq('id', v.id)
    } else if (v.id && !v._delete) {
      await supabase.from('variantes').update({
        talle: v.talle || null,
        color: v.color || null,
        color_hex: v.color_hex || null,
        precio_costo: v.precio_costo,
        precio_venta: v.precio_venta,
        precio_oferta: v.precio_oferta,
        oferta_activa: v.oferta_activa,
        iva: v.iva,
        stock: v.stock,
        activo: v.activo,
      }).eq('id', v.id)
    } else if (!v.id && !v._delete) {
      await supabase.from('variantes').insert({
        producto_id: id,
        talle: v.talle || null,
        color: v.color || null,
        color_hex: v.color_hex || null,
        precio_costo: v.precio_costo,
        precio_venta: v.precio_venta,
        precio_oferta: v.precio_oferta,
        oferta_activa: v.oferta_activa,
        iva: v.iva,
        stock: v.stock,
        activo: v.activo,
      })
    }
  }

  revalidatePath('/admin/productos')
  revalidatePath(`/admin/productos/${id}/editar`)
}

export async function uploadProductImage(formData: FormData): Promise<string> {
  const supabase = supabaseAdmin
  const file = formData.get('file') as File
  const productId = formData.get('productId') as string

  if (!file || !productId) throw new Error('File y productId requeridos')

  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some((b: { name: string }) => b.name === 'productos')) {
    await supabase.storage.createBucket('productos', { public: true })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${productId}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('productos')
    .upload(filename, bytes, { contentType: file.type })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(filename)
  return publicUrl
}
