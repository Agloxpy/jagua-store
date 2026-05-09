import { supabaseAdmin } from '@/lib/supabase/admin'
import ProductoFormClient from '@/components/admin/ProductoFormClient'

export default async function NuevoProductoPage() {
  const { data: categorias, error } = await supabaseAdmin
    .from('categorias')
    .select('id, nombre')
    .order('nombre')

  console.log('Categorias:', categorias)
  console.log('Error:', error)

  return <ProductoFormClient categorias={categorias ?? []} />
}
