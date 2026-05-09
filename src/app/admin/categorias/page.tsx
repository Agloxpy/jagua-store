import { supabaseAdmin } from '@/lib/supabase/admin'
import CategoriasClient from './CategoriasClient'

export default async function CategoriasPage() {
  const [{ data: categorias }, { data: productos }] = await Promise.all([
    supabaseAdmin.from('categorias').select('*').order('orden'),
    supabaseAdmin.from('productos').select('categoria_id'),
  ])

  const countMap: Record<string, number> = {}
  for (const p of productos || []) {
    if (p.categoria_id) {
      countMap[p.categoria_id] = (countMap[p.categoria_id] || 0) + 1
    }
  }

  const categoriasWithCount = (categorias || []).map(c => ({
    ...c,
    producto_count: countMap[c.id] || 0,
  }))

  return <CategoriasClient categorias={categoriasWithCount} />
}
