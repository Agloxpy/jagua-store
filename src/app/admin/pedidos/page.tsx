import { supabaseAdmin } from '@/lib/supabase/admin'
import PedidosTable from './PedidosTable'

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

export default async function PedidosPage() {
  const hoy = new Date().toISOString().split('T')[0]

  const { data: pedidos } = await supabaseAdmin
    .from('pedidos')
    .select('id, numero_pedido, cliente_nombre, cliente_telefono, tipo_entrega, metodo_pago, total, estado_pago, estado, created_at, es_venta_fisica')
    .order('created_at', { ascending: false })

  const todos = pedidos ?? []
  const pedidosHoy = todos.filter(p => p.created_at?.startsWith(hoy))
  const totalHoy = pedidosHoy.reduce((sum, p) => sum + (p.total ?? 0), 0)
  const pendientes = todos.filter(p => p.estado === 'pendiente').length
  const enviados = todos.filter(p => p.estado === 'enviado').length

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0F172A] mb-8">Pedidos</h1>

      {/* Cards resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-black text-[#0F172A]">{pedidosHoy.length}</div>
          <div className="text-gray-500 text-sm mt-1">Pedidos hoy</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-black text-yellow-600">{pendientes}</div>
          <div className="text-gray-500 text-sm mt-1">Pendientes</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-black text-indigo-600">{enviados}</div>
          <div className="text-gray-500 text-sm mt-1">Enviados</div>
        </div>
        <div className="bg-[#0F172A] rounded-2xl p-5">
          <div className="text-xl font-black text-[#F5C518] tabular-nums">{formatGs(totalHoy)}</div>
          <div className="text-gray-400 text-sm mt-1">Vendido hoy</div>
        </div>
      </div>

      <PedidosTable pedidos={todos} />
    </div>
  )
}
