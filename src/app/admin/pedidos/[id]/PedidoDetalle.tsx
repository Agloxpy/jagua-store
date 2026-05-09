'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateEstadoPedido, updateEstadoPago, type EstadoPedido, type EstadoPago } from '../actions'

interface PedidoItem {
  id: string
  producto_id?: string
  producto_nombre: string
  variante_talle?: string
  variante_color?: string
  precio_costo: number
  precio_venta: number
  cantidad: number
  subtotal: number
}

interface Pedido {
  id: string
  numero_pedido: number
  cliente_nombre: string
  cliente_email?: string
  cliente_telefono?: string
  tipo_entrega: string
  direccion_entrega?: string
  ciudad_entrega?: string
  departamento_entrega?: string
  costo_envio: number
  metodo_pago: string
  estado_pago: string
  estado: string
  subtotal: number
  total: number
  notas?: string
  es_venta_fisica?: boolean
  created_at: string
  items: PedidoItem[]
}

interface Props {
  pedido: Pedido
  imagenesPorProducto: Record<string, string>
}

const estadoColors: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  preparando: 'bg-purple-100 text-purple-700',
  enviado:    'bg-indigo-100 text-indigo-700',
  entregado:  'bg-green-100 text-green-700',
  cancelado:  'bg-red-100 text-red-700',
}

const pagoColors: Record<string, string> = {
  pendiente:  'bg-amber-100 text-amber-700',
  pagado:     'bg-green-100 text-green-700',
  rechazado:  'bg-red-100 text-red-700',
}

const NEXT_ESTADO: Record<string, EstadoPedido | null> = {
  pendiente:  'confirmado',
  confirmado: 'preparando',
  preparando: 'enviado',
  enviado:    'entregado',
  entregado:  null,
  cancelado:  null,
}

const NEXT_ESTADO_LABEL: Record<string, string> = {
  pendiente:  'Confirmar pedido',
  confirmado: 'Marcar preparando',
  preparando: 'Marcar enviado',
  enviado:    'Marcar entregado',
}

const metodoLabel: Record<string, string> = {
  bancard:       '💳 Bancard',
  transferencia: '🏦 Transferencia',
  efectivo:      '💵 Efectivo',
}

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-[#0F172A]">{value}</span>
    </div>
  )
}

export default function PedidoDetalle({ pedido, imagenesPorProducto }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const doEstado = (estado: EstadoPedido) => {
    startTransition(async () => {
      await updateEstadoPedido(pedido.id, estado)
      router.refresh()
    })
  }

  const doPago = (estado_pago: EstadoPago) => {
    startTransition(async () => {
      await updateEstadoPago(pedido.id, estado_pago)
      router.refresh()
    })
  }

  const nextEstado = NEXT_ESTADO[pedido.estado]
  const canCancel = pedido.estado !== 'entregado' && pedido.estado !== 'cancelado'

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/admin/pedidos" className="text-gray-400 hover:text-[#0F172A] transition-colors">
            ← Volver
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-[#0F172A]">Pedido #{pedido.numero_pedido}</h1>
              {pedido.es_venta_fisica && (
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-full">Venta física</span>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(pedido.created_at).toLocaleDateString('es-PY', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${pagoColors[pedido.estado_pago] ?? 'bg-gray-100 text-gray-600'}`}>
            Pago: {pedido.estado_pago}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${estadoColors[pedido.estado] ?? 'bg-gray-100 text-gray-600'}`}>
            {pedido.estado}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Cliente */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="font-black text-[#0F172A] text-base">Cliente</h2>
          <InfoRow label="Nombre" value={pedido.cliente_nombre} />
          <InfoRow label="Teléfono" value={pedido.cliente_telefono} />
          <InfoRow label="Email" value={pedido.cliente_email} />
        </div>

        {/* Entrega */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="font-black text-[#0F172A] text-base">Entrega</h2>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">Tipo</span>
            <span className="text-sm font-semibold text-[#0F172A] capitalize">
              {pedido.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Retiro en tienda'}
            </span>
          </div>
          <InfoRow label="Dirección" value={pedido.direccion_entrega} />
          <InfoRow label="Ciudad" value={pedido.ciudad_entrega} />
          <InfoRow label="Departamento" value={pedido.departamento_entrega} />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">Método de pago</span>
            <span className="text-sm font-semibold text-[#0F172A]">
              {metodoLabel[pedido.metodo_pago] ?? pedido.metodo_pago}
            </span>
          </div>
          {pedido.notas && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400">Notas</span>
              <span className="text-sm text-gray-600 italic">&quot;{pedido.notas}&quot;</span>
            </div>
          )}
        </div>

        {/* Acciones de estado */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-black text-[#0F172A] text-base">Estado del pedido</h2>

          <div>
            <p className="text-xs text-gray-400 mb-2">Estado actual</p>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${estadoColors[pedido.estado] ?? 'bg-gray-100 text-gray-600'}`}>
              {pedido.estado}
            </span>
          </div>

          {nextEstado && (
            <button
              onClick={() => doEstado(nextEstado)}
              disabled={isPending}
              className="w-full bg-[#F5C518] text-[#0F172A] font-bold py-2.5 rounded-xl text-sm hover:bg-[#D4A80A] transition-colors disabled:opacity-50"
            >
              {isPending ? 'Actualizando…' : NEXT_ESTADO_LABEL[pedido.estado]}
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => doEstado('cancelado')}
              disabled={isPending}
              className="w-full border border-red-200 text-red-500 font-semibold py-2 rounded-xl text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Cancelar pedido
            </button>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2">Estado del pago</p>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${pagoColors[pedido.estado_pago] ?? 'bg-gray-100 text-gray-600'}`}>
              {pedido.estado_pago}
            </span>
            <div className="flex gap-2 mt-3">
              {pedido.estado_pago !== 'pagado' && (
                <button
                  onClick={() => doPago('pagado')}
                  disabled={isPending}
                  className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-xl text-xs hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  Marcar pagado
                </button>
              )}
              {pedido.estado_pago !== 'rechazado' && (
                <button
                  onClick={() => doPago('rechazado')}
                  disabled={isPending}
                  className="flex-1 border border-red-200 text-red-500 font-semibold py-2 rounded-xl text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Rechazar
                </button>
              )}
              {pedido.estado_pago === 'rechazado' && (
                <button
                  onClick={() => doPago('pendiente')}
                  disabled={isPending}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Reintento pago
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-black text-[#0F172A] text-base mb-4">
          Items ({pedido.items.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs" colSpan={2}>Producto</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Cantidad</th>
                <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">P. Costo</th>
                <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">P. Venta</th>
                <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map(item => {
                const imagen = item.producto_id ? imagenesPorProducto[item.producto_id] : undefined
                const variante = [item.variante_talle, item.variante_color].filter(Boolean).join(' · ')
                return (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="py-3 px-3 w-12">
                      {imagen ? (
                        <img
                          src={imagen}
                          alt={item.producto_nombre}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#0F172A]">{item.producto_nombre}</div>
                      {variante && <div className="text-xs text-gray-400 mt-0.5">{variante}</div>}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">{item.cantidad}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-gray-500 text-xs">{formatGs(item.precio_costo)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold">{formatGs(item.precio_venta)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0F172A]">{formatGs(item.subtotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatGs(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Envío</span>
              <span className="font-semibold tabular-nums">{formatGs(pedido.costo_envio)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-black text-[#0F172A]">Total</span>
              <span className="font-black text-[#0F172A] tabular-nums text-lg">{formatGs(pedido.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
