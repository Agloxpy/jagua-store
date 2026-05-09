import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalProductos },
    { count: totalPedidos },
    { data: pedidosRecientes },
  ] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('pedidos').select('*', { count: 'exact', head: true }),
    supabase.from('pedidos').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const { data: ventasHoy } = await supabase
    .from('pedidos')
    .select('total')
    .gte('created_at', new Date().toISOString().split('T')[0])

  const totalHoy = ventasHoy?.reduce((sum, p) => sum + p.total, 0) ?? 0

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency', currency: 'PYG', maximumFractionDigits: 0
    }).format(price)
  }

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmado: 'bg-blue-100 text-blue-700',
    preparando: 'bg-purple-100 text-purple-700',
    enviado: 'bg-indigo-100 text-indigo-700',
    entregado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0F172A] mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-3xl font-black text-[#0F172A]">{totalProductos ?? 0}</div>
          <div className="text-gray-500 text-sm mt-1">Productos activos</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-3xl font-black text-[#0F172A]">{totalPedidos ?? 0}</div>
          <div className="text-gray-500 text-sm mt-1">Pedidos totales</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-3xl font-black text-[#0F172A]">{formatPrice(totalHoy)}</div>
          <div className="text-gray-500 text-sm mt-1">Ventas hoy</div>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-black text-[#0F172A] mb-4">Pedidos recientes</h2>
        {pedidosRecientes && pedidosRecientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">#</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Estado</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecientes.map(pedido => (
                  <tr key={pedido.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">#{pedido.numero_pedido}</td>
                    <td className="py-3 px-4">{pedido.cliente_nombre}</td>
                    <td className="py-3 px-4 font-semibold">{formatPrice(pedido.total)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColors[pedido.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(pedido.created_at).toLocaleDateString('es-PY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No hay pedidos aún</p>
        )}
      </div>
    </div>
  )
}
