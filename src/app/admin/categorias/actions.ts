'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface CategoriaInput {
  nombre: string
  slug: string
  descripcion: string
  imagen_url: string | null
  orden: number
  activo: boolean
}

export async function createCategoria(data: CategoriaInput) {
  const { error } = await supabaseAdmin.from('categorias').insert({
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion || null,
    imagen_url: data.imagen_url,
    orden: data.orden,
    activo: data.activo,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
  revalidatePath('/')
}

export async function updateCategoria(id: string, data: CategoriaInput) {
  const { error } = await supabaseAdmin
    .from('categorias')
    .update({
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || null,
      imagen_url: data.imagen_url,
      orden: data.orden,
      activo: data.activo,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
  revalidatePath('/')
}

export async function deleteCategoria(id: string) {
  const { count } = await supabaseAdmin
    .from('productos')
    .select('*', { count: 'exact', head: true })
    .eq('categoria_id', id)

  if (count && count > 0) {
    throw new Error(`No se puede eliminar: tiene ${count} producto(s) asociado(s)`)
  }

  const { error } = await supabaseAdmin.from('categorias').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
  revalidatePath('/')
}

export async function uploadCategoriaImage(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  const categoriaId = formData.get('categoriaId') as string

  if (!file) throw new Error('Archivo requerido')

  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (!buckets?.some((b: { name: string }) => b.name === 'categorias')) {
    await supabaseAdmin.storage.createBucket('categorias', { public: true })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${categoriaId}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from('categorias')
    .upload(filename, bytes, { contentType: file.type, upsert: true })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabaseAdmin.storage.from('categorias').getPublicUrl(filename)
  return publicUrl
}
