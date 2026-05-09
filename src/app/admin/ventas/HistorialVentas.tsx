'use client'

import { useState, useEffect, useTransition } from 'react'
import { getVentasFisicasPorFecha } from './actions'

interface PedidoItem {
  producto_nombre: string
  cantidad: number
  precio_venta: number
}

interface Venta {
  id: string
  numero_pedido: number
  cliente_nombre: string
  metodo_pago: string
  total: number
  created_at: string
  pedido_items: PedidoItem[]
}

interface Props {
  ventasIniciales: Venta[]
  fechaHoy: string
}

const metodoLabel: Record<string, string> = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  bancard:       'Bancard',
}

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

export default function HistorialVentas({ ventasIniciales, fechaHoy }: Props) {
  const [fecha, setFecha] = useState(fechaHoy)
  const [ventas, setVentas] = useState<Venta[]>(ventasIniciales)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (fecha === fechaHoy) {
      setVentas(ventasIniciales)
    }
  }, [ventasIniciales, fechaHoy, fecha])

  const handleFechaChange = (nuevaFecha: string) => {
    setFecha(nuevaFecha)
    startTransition(async () => {
      const data = await getVentasFisicasPorFecha(nuevaFecha) as Venta[]
      setVentas(data)
    })
  }

  const totalDia = ventas.reduce((s, v) => s + (v.total ?? 0), 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <h2 className="font-black text-[#0F172A] text-lg">Historial del día</h2>
        <input
          type="date"
          value={fecha}
          max={fechaHoy}
          onChange={e => handleFechaChange(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F172A]"
        />
      </div>

      {isPending ? (
        <div className="text-center py-10 text-gray-300 text-sm">Cargando…</div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-10 text-gray-300 text-sm">Sin ventas en esta fecha</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">#</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Cliente</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Items</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">Total</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Método</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Hora</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(venta => {
                  const resumen = venta.pedido_items
                    ?.map(i => `${i.producto_nombre}${i.cantidad > 1 ? ` ×${i.cantidad}` : ''}`)
                    .join(', ')
                  const hora = new Date(venta.created_at).toLocaleTimeString('es-PY', {
                    hour: '2-digit', minute: '2-digit',
                  })
                  return (
                    <tr key={venta.id} className="border-t border-gray-100">
                      <td className="py-2.5 px-3 font-bold text-[#0F172A]">#{venta.numero_pedido}</td>
                      <td className="py-2.5 px-3 text-[#0F172A]">{venta.cliente_nombre}</td>
                      <td className="py-2.5 px-3 text-gray-500 text-xs max-w-xs truncate">{resumen}</td>
                      <td className="py-2.5 px-3 text-right font-semibold tabular-nums whitespace-nowrap">
                        {formatGs(venta.total)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 text-xs whitespace-nowrap">
                        {metodoLabel[venta.metodo_pago] ?? venta.metodo_pago}
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 text-xs whitespace-nowrap">{hora}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="py-3 px-3 text-sm font-semibold text-gray-500">
                    {ventas.length} venta{ventas.length !== 1 ? 's' : ''}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-[#0F172A] tabular-nums">
                    {formatGs(totalDia)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
