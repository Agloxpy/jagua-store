import { supabaseAdmin } from '@/lib/supabase/admin'
import NuevaVenta from './NuevaVenta'
import HistorialVentas from './HistorialVentas'

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

export default async function VentasFisicasPage() {
  const fechaHoy = new Date().toISOString().split('T')[0]
  const desde = `${fechaHoy}T00:00:00`
  const hasta = `${fechaHoy}T23:59:59`

  const [{ data: productos }, { data: ventasHoy }] = await Promise.all([
    supabaseAdmin
      .from('productos')
      .select('id, nombre, imagenes, tiene_variantes, precio_costo, precio_venta, precio_oferta, oferta_activa, variantes(id, talle, color, color_hex, precio_costo, precio_venta, precio_oferta, oferta_activa, stock, activo)')
      .eq('activo', true)
      .order('nombre'),
    supabaseAdmin
      .from('pedidos')
      .select('id, numero_pedido, cliente_nombre, metodo_pago, total, created_at, pedido_items(producto_nombre, cantidad, precio_venta)')
      .eq('es_venta_fisica', true)
      .gte('created_at', desde)
      .lte('created_at', hasta)
      .order('created_at', { ascending: false }),
  ])

  const ventas = ventasHoy ?? []
  const totalHoy = ventas.reduce((s, v) => s + (v.total ?? 0), 0)

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0F172A] mb-8">Ventas físicas</h1>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-black text-[#0F172A]">{ventas.length}</div>
          <div className="text-gray-500 text-sm mt-1">Ventas hoy</div>
        </div>
        <div className="bg-[#0F172A] rounded-2xl p-5">
          <div className="text-xl font-black text-[#F5C518] tabular-nums">{formatGs(totalHoy)}</div>
          <div className="text-gray-400 text-sm mt-1">Total hoy</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NuevaVenta productos={productos ?? []} />
        <HistorialVentas ventasIniciales={ventas as Parameters<typeof HistorialVentas>[0]['ventasIniciales']} fechaHoy={fechaHoy} />
      </div>
    </div>
  )
}
