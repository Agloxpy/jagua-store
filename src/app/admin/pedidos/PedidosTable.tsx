'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateEstadoPedido, type EstadoPedido } from './actions'

interface Pedido {
  id: string
  numero_pedido: number
  cliente_nombre: string
  cliente_telefono?: string | null
  tipo_entrega: string
  metodo_pago: string
  total: number
  estado_pago: string
  estado: string
  created_at: string
  es_venta_fisica?: boolean
}

interface Props {
  pedidos: Pedido[]
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

const entregaLabel: Record<string, string> = {
  delivery: '🚚 Delivery',
  retiro:   '🏪 Retiro',
}

const pagoLabel: Record<string, string> = {
  bancard:       '💳 Bancard',
  transferencia: '🏦 Transferencia',
  efectivo:      '💵 Efectivo',
}

const estadoLabel: Record<string, string> = {
  pendiente:  'Pendiente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado:    'Enviado',
  entregado:  'Entregado',
  cancelado:  'Cancelado',
}

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

export default function PedidosTable({ pedidos }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [estadoFilter, setEstadoFilter] = useState('')
  const [pagoFilter, setPagoFilter]     = useState('')
  const [search, setSearch]             = useState('')

  const filtered = pedidos.filter(p => {
    if (estadoFilter && p.estado !== estadoFilter) return false
    if (pagoFilter && p.metodo_pago !== pagoFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.cliente_nombre.toLowerCase().includes(q) ||
        String(p.numero_pedido).includes(q)
      )
    }
    return true
  })

  const handleEstadoChange = (id: string, estado: string) => {
    startTransition(async () => {
      await updateEstadoPedido(id, estado as EstadoPedido)
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por cliente o # pedido…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-52 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#0F172A]"
        />
        <select
          value={estadoFilter}
          onChange={e => setEstadoFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F172A]"
        >
          <option value="">Todos los estados</option>
          {Object.entries(estadoLabel).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={pagoFilter}
          onChange={e => setPagoFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F172A]"
        >
          <option value="">Todos los métodos</option>
          <option value="bancard">Bancard</option>
          <option value="transferencia">Transferencia</option>
          <option value="efectivo">Efectivo</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-12 text-sm">No se encontraron pedidos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs whitespace-nowrap">#</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Cliente</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Entrega</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Método pago</th>
                <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">Total</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Estado pago</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Estado pedido</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Fecha</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pedido => (
                <tr key={pedido.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#0F172A] whitespace-nowrap">
                    #{pedido.numero_pedido}
                    {pedido.es_venta_fisica && (
                      <span className="ml-1 text-xs text-gray-400 font-normal">física</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#0F172A] whitespace-nowrap">{pedido.cliente_nombre}</div>
                    {pedido.cliente_telefono && (
                      <div className="text-xs text-gray-400">{pedido.cliente_telefono}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-600 whitespace-nowrap">
                    {entregaLabel[pedido.tipo_entrega] ?? pedido.tipo_entrega}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-600 whitespace-nowrap">
                    {pagoLabel[pedido.metodo_pago] ?? pedido.metodo_pago}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold tabular-nums whitespace-nowrap">
                    {formatGs(pedido.total)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${pagoColors[pedido.estado_pago] ?? 'bg-gray-100 text-gray-600'}`}>
                      {pedido.estado_pago}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <select
                      value={pedido.estado}
                      onChange={e => handleEstadoChange(pedido.id, e.target.value)}
                      disabled={isPending || pedido.estado === 'entregado' || pedido.estado === 'cancelado'}
                      className={`px-2 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer disabled:cursor-default ${estadoColors[pedido.estado] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {Object.entries(estadoLabel).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(pedido.created_at).toLocaleDateString('es-PY', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3">
                    <Link
                      href={`/admin/pedidos/${pedido.id}`}
                      className="bg-[#0F172A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1e293b] transition-colors whitespace-nowrap"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== pedidos.length && ` de ${pedidos.length}`}
      </div>
    </div>
  )
}
