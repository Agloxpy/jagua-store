'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type EstadoPedido = 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'
export type EstadoPago = 'pendiente' | 'pagado' | 'rechazado'

export async function updateEstadoPedido(id: string, estado: EstadoPedido) {
  const { error } = await supabaseAdmin.from('pedidos').update({ estado }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${id}`)
}

export async function updateEstadoPago(id: string, estado_pago: EstadoPago) {
  const { error } = await supabaseAdmin.from('pedidos').update({ estado_pago }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${id}`)
}
