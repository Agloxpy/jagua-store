'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface ItemVenta {
  variante_id: string
  producto_id: string
  producto_nombre: string
  variante_talle?: string
  variante_color?: string
  precio_costo: number
  precio_venta: number
  cantidad: number
}

export async function registrarVentaFisica(
  items: ItemVenta[],
  clienteNombre: string,
  metodoPago: string
) {
  const { data: maxData } = await supabaseAdmin
    .from('pedidos')
    .select('numero_pedido')
    .order('numero_pedido', { ascending: false })
    .limit(1)
    .single()

  const numeroPedido = (maxData?.numero_pedido ?? 0) + 1
  const subtotal = items.reduce((s, i) => s + i.precio_venta * i.cantidad, 0)

  const { data: pedido, error: pedidoError } = await supabaseAdmin
    .from('pedidos')
    .insert({
      numero_pedido: numeroPedido,
      cliente_nombre: clienteNombre || 'Cliente mostrador',
      tipo_entrega: 'retiro',
      metodo_pago: metodoPago,
      estado: 'entregado',
      estado_pago: 'pagado',
      subtotal,
      costo_envio: 0,
      total: subtotal,
      es_venta_fisica: true,
    })
    .select('id')
    .single()

  if (pedidoError || !pedido) throw new Error(pedidoError?.message ?? 'Error al crear pedido')

  const pedidoItems = items.map(i => ({
    pedido_id: pedido.id,
    producto_id: i.producto_id,
    producto_nombre: i.producto_nombre,
    variante_talle: i.variante_talle ?? null,
    variante_color: i.variante_color ?? null,
    precio_costo: i.precio_costo,
    precio_venta: i.precio_venta,
    cantidad: i.cantidad,
    subtotal: i.precio_venta * i.cantidad,
  }))

  const { error: itemsError } = await supabaseAdmin.from('pedido_items').insert(pedidoItems)
  if (itemsError) throw new Error(itemsError.message)

  for (const item of items) {
    const { data: v } = await supabaseAdmin
      .from('variantes')
      .select('stock')
      .eq('id', item.variante_id)
      .single()
    if (v) {
      await supabaseAdmin
        .from('variantes')
        .update({ stock: Math.max(0, (v.stock ?? 0) - item.cantidad) })
        .eq('id', item.variante_id)
    }
  }

  revalidatePath('/admin/ventas')
  revalidatePath('/admin/pedidos')
  return { numero_pedido: numeroPedido }
}

export async function getVentasFisicasPorFecha(fecha: string) {
  const desde = `${fecha}T00:00:00`
  const hasta = `${fecha}T23:59:59`

  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select('id, numero_pedido, cliente_nombre, metodo_pago, total, created_at, pedido_items(producto_nombre, cantidad, precio_venta)')
    .eq('es_venta_fisica', true)
    .gte('created_at', desde)
    .lte('created_at', hasta)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
