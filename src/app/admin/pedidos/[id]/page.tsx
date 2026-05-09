import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PedidoDetalle from './PedidoDetalle'

export default async function PedidoDetallePage({ params }: { params: { id: string } }) {
  const { data: pedido } = await supabaseAdmin
    .from('pedidos')
    .select('*, pedido_items(*)')
    .eq('id', params.id)
    .single()

  if (!pedido) notFound()

  const items: { producto_id?: string }[] = pedido.pedido_items ?? []
  const productoIds = Array.from(
    new Set(items.map(i => i.producto_id).filter((id): id is string => !!id))
  )

  const imagenesPorProducto: Record<string, string> = {}
  if (productoIds.length > 0) {
    const { data: prods } = await supabaseAdmin
      .from('productos')
      .select('id, imagenes')
      .in('id', productoIds)
    for (const p of prods ?? []) {
      if (p.imagenes?.[0]) imagenesPorProducto[p.id] = p.imagenes[0]
    }
  }

  return (
    <PedidoDetalle
      pedido={{ ...pedido, items: pedido.pedido_items ?? [] }}
      imagenesPorProducto={imagenesPorProducto}
    />
  )
}
