'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export interface CheckoutPayload {
  cliente_nombre: string
  cliente_telefono: string
  cliente_email?: string
  tipo_entrega: 'delivery' | 'retiro'
  departamento_entrega?: string
  metodo_pago: 'bancard' | 'transferencia' | 'efectivo'
  subtotal: number
  costo_envio: number
  total: number
  items: Array<{
    producto_id: string
    variante_id?: string
    producto_nombre: string
    producto_imagen?: string
    variante_talle?: string
    variante_color?: string
    precio_venta: number
    cantidad: number
    subtotal: number
  }>
}

export async function crearPedido(
  payload: CheckoutPayload
): Promise<{ id: string; numero_pedido: number }> {
  const { data: pedido, error: pedidoError } = await supabaseAdmin
    .from('pedidos')
    .insert({
      cliente_nombre: payload.cliente_nombre,
      cliente_telefono: payload.cliente_telefono,
      cliente_email: payload.cliente_email || null,
      tipo_entrega: payload.tipo_entrega,
      departamento_entrega:
        payload.tipo_entrega === 'delivery' ? payload.departamento_entrega : null,
      direccion_entrega:
        payload.tipo_entrega === 'retiro'
          ? 'Campos Cervera esq. Mac Arthur, Bo. Recoleta, Asunción'
          : null,
      metodo_pago: payload.metodo_pago,
      estado_pago: 'pendiente',
      subtotal: payload.subtotal,
      costo_envio: payload.costo_envio,
      total: payload.total,
      estado: 'pendiente',
      es_venta_fisica: false,
    })
    .select('id, numero_pedido')
    .single()

  if (pedidoError) throw new Error(pedidoError.message)

  const pedidoItems = payload.items.map((item) => ({
    pedido_id: pedido.id,
    producto_id: item.producto_id || null,
    variante_id: item.variante_id || null,
    producto_nombre: item.producto_nombre,
    producto_imagen: item.producto_imagen || null,
    variante_talle: item.variante_talle || null,
    variante_color: item.variante_color || null,
    precio_costo: 0,
    precio_venta: item.precio_venta,
    cantidad: item.cantidad,
    subtotal: item.subtotal,
  }))

  const { error: itemsError } = await supabaseAdmin.from('pedido_items').insert(pedidoItems)
  if (itemsError) throw new Error(itemsError.message)

  return { id: pedido.id as string, numero_pedido: pedido.numero_pedido as number }
}
