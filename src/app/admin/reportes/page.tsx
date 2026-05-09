import { supabaseAdmin } from '@/lib/supabase/admin'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(Math.round(n))}`
}

interface SearchParams { mes?: string; anio?: string }

export default async function ReportesPage({ searchParams }: { searchParams: SearchParams }) {
  const now = new Date()
  const mes = Math.min(12, Math.max(1, Number(searchParams.mes ?? now.getMonth() + 1)))
  const anio = Number(searchParams.anio ?? now.getFullYear())

  const desde = `${anio}-${String(mes).padStart(2, '0')}-01T00:00:00`
  const ultimoDia = new Date(anio, mes, 0).getDate()
  const hasta = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}T23:59:59`

  // 1. Pedidos del mes (sin cancelados ni rechazados)
  const { data: pedidos } = await supabaseAdmin
    .from('pedidos')
    .select('id')
    .gte('created_at', desde)
    .lte('created_at', hasta)
    .not('estado', 'eq', 'cancelado')

  const pedidoIds = pedidos?.map(p => p.id) ?? []

  // 2. Items de esos pedidos con variante (para IVA) y producto (para categoría)
  type ItemRaw = {
    precio_costo: number
    precio_venta: number
    cantidad: number
    variante_id: string | null
    producto_id: string | null
  }
  let items: ItemRaw[] = []
  const categoriasPorProducto: Record<string, string> = {}
  const ivaPorVariante: Record<string, number> = {}

  if (pedidoIds.length > 0) {
    const { data: itemsData } = await supabaseAdmin
      .from('pedido_items')
      .select('precio_costo, precio_venta, cantidad, variante_id, producto_id')
      .in('pedido_id', pedidoIds)

    items = (itemsData ?? []) as ItemRaw[]

    // Obtener categorías de productos únicos
    const productoIds = Array.from(new Set(items.map(it => it.producto_id).filter((id): id is string => id !== null)))
    if (productoIds.length > 0) {
      const { data: prods } = await supabaseAdmin
        .from('productos')
        .select('id, categorias(nombre)')
        .in('id', productoIds)

      for (const p of (prods ?? []) as { id: string; categorias: unknown }[]) {
        const cat = p.categorias as { nombre: string } | { nombre: string }[] | null
        const nombre = Array.isArray(cat) ? (cat[0]?.nombre ?? 'Sin categoría') : (cat?.nombre ?? 'Sin categoría')
        categoriasPorProducto[p.id] = nombre
      }
    }

    // Obtener iva de variantes únicas
    const varianteIds = Array.from(new Set(items.map(it => it.variante_id).filter((id): id is string => id !== null)))
    if (varianteIds.length > 0) {
      const { data: vars } = await supabaseAdmin
        .from('variantes')
        .select('id, iva')
        .in('id', varianteIds)

      for (const vr of (vars ?? []) as { id: string; iva: number | null }[]) {
        ivaPorVariante[vr.id] = vr.iva ?? 0.10
      }
    }
  }

  // 3. Calcular totales
  type Acum = {
    ventaConIva: number
    ventaSinIva: number
    ivaCobrado: number
    costoConIva: number
    costoSinIva: number
    ivaPagado: number
  }

  const totales: Acum = { ventaConIva: 0, ventaSinIva: 0, ivaCobrado: 0, costoConIva: 0, costoSinIva: 0, ivaPagado: 0 }
  const porCategoria: Record<string, Acum & { nombre: string }> = {}

  for (const item of items) {
    const iva = item.variante_id ? (ivaPorVariante[item.variante_id] ?? 0.10) : 0.10
    const categoria = item.producto_id ? (categoriasPorProducto[item.producto_id] ?? 'Sin categoría') : 'Sin categoría'

    const ventaConIva = item.precio_venta * item.cantidad
    const costoConIva = item.precio_costo * item.cantidad
    const ventaSinIva = ventaConIva / (1 + iva)
    const costoSinIva = costoConIva / (1 + iva)
    const ivaCobrado = ventaConIva - ventaSinIva
    const ivaPagado = costoConIva - costoSinIva

    totales.ventaConIva += ventaConIva
    totales.ventaSinIva += ventaSinIva
    totales.ivaCobrado += ivaCobrado
    totales.costoConIva += costoConIva
    totales.costoSinIva += costoSinIva
    totales.ivaPagado += ivaPagado

    if (!porCategoria[categoria]) {
      porCategoria[categoria] = { nombre: categoria, ventaConIva: 0, ventaSinIva: 0, ivaCobrado: 0, costoConIva: 0, costoSinIva: 0, ivaPagado: 0 }
    }
    porCategoria[categoria].ventaConIva += ventaConIva
    porCategoria[categoria].ventaSinIva += ventaSinIva
    porCategoria[categoria].ivaCobrado += ivaCobrado
    porCategoria[categoria].costoConIva += costoConIva
    porCategoria[categoria].costoSinIva += costoSinIva
    porCategoria[categoria].ivaPagado += ivaPagado
  }

  const ivaNetoTotal = totales.ivaCobrado - totales.ivaPagado
  const categoriasList = Object.values(porCategoria).sort((a, b) => b.ventaConIva - a.ventaConIva)

  const anios = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]

  const rowCls = 'flex justify-between items-center py-3 border-b border-gray-100 last:border-0'
  const labelCls = 'text-sm text-gray-500'
  const valueCls = 'text-sm font-semibold text-[#0F172A] tabular-nums'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-[#0F172A]">Reportes</h1>

        <form method="GET" className="flex items-center gap-3">
          <select
            name="mes"
            defaultValue={mes}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F172A] bg-white"
          >
            {MESES.map((nombre, idx) => (
              <option key={idx + 1} value={idx + 1}>{nombre}</option>
            ))}
          </select>
          <select
            name="anio"
            defaultValue={anio}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F172A] bg-white"
          >
            {anios.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            type="submit"
            className="bg-[#0F172A] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#1e293b] transition-colors"
          >
            Ver reporte
          </button>
        </form>
      </div>

      {pedidoIds.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
          <p className="text-lg font-semibold">Sin pedidos en {MESES[mes - 1]} {anio}</p>
          <p className="text-sm mt-1">No hay pedidos activos para el período seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen de IVA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Ventas */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-black text-[#0F172A] text-lg mb-4">Ventas — {MESES[mes - 1]} {anio}</h2>
              <div>
                <div className={rowCls}>
                  <span className={labelCls}>Total ventas (con IVA)</span>
                  <span className={valueCls}>{formatGs(totales.ventaConIva)}</span>
                </div>
                <div className={rowCls}>
                  <span className={labelCls}>Total ventas sin IVA</span>
                  <span className={valueCls}>{formatGs(totales.ventaSinIva)}</span>
                </div>
                <div className={`${rowCls} bg-green-50 -mx-2 px-2 rounded-xl`}>
                  <span className="text-sm font-semibold text-green-700">IVA cobrado en ventas</span>
                  <span className="text-sm font-black text-green-700 tabular-nums">{formatGs(totales.ivaCobrado)}</span>
                </div>
              </div>
            </div>

            {/* Compras */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-black text-[#0F172A] text-lg mb-4">Compras — {MESES[mes - 1]} {anio}</h2>
              <div>
                <div className={rowCls}>
                  <span className={labelCls}>Total costos (con IVA)</span>
                  <span className={valueCls}>{formatGs(totales.costoConIva)}</span>
                </div>
                <div className={rowCls}>
                  <span className={labelCls}>Total costos sin IVA</span>
                  <span className={valueCls}>{formatGs(totales.costoSinIva)}</span>
                </div>
                <div className={`${rowCls} bg-red-50 -mx-2 px-2 rounded-xl`}>
                  <span className="text-sm font-semibold text-red-700">IVA pagado en compras</span>
                  <span className="text-sm font-black text-red-700 tabular-nums">{formatGs(totales.ivaPagado)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* IVA neto */}
          <div className={`rounded-2xl p-6 flex items-center justify-between ${ivaNetoTotal >= 0 ? 'bg-[#0F172A]' : 'bg-red-900'}`}>
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">IVA neto a pagar al Estado</p>
              <p className="text-gray-400 text-xs mt-1">IVA cobrado en ventas − IVA pagado en compras</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-black tabular-nums ${ivaNetoTotal >= 0 ? 'text-[#F5C518]' : 'text-red-300'}`}>
                {formatGs(ivaNetoTotal)}
              </p>
              <p className="text-gray-400 text-xs mt-1">{pedidoIds.length} pedidos</p>
            </div>
          </div>

          {/* Desglose por categoría */}
          {categoriasList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-black text-[#0F172A] text-lg mb-4">Desglose por categoría</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Categoría</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">Ventas (c/IVA)</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">IVA cobrado</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">Costos (c/IVA)</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">IVA pagado</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">IVA neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriasList.map(cat => {
                      const ivaNeto = cat.ivaCobrado - cat.ivaPagado
                      return (
                        <tr key={cat.nombre} className="border-t border-gray-100">
                          <td className="py-2 px-3 font-semibold text-[#0F172A]">{cat.nombre}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-700">{formatGs(cat.ventaConIva)}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-green-600 font-semibold">{formatGs(cat.ivaCobrado)}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-gray-700">{formatGs(cat.costoConIva)}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-red-500 font-semibold">{formatGs(cat.ivaPagado)}</td>
                          <td className={`py-2 px-3 text-right tabular-nums font-black ${ivaNeto >= 0 ? 'text-[#0F172A]' : 'text-red-600'}`}>
                            {formatGs(ivaNeto)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td className="py-2 px-3 font-black text-[#0F172A] text-xs uppercase">Total</td>
                      <td className="py-2 px-3 text-right tabular-nums font-black text-[#0F172A]">{formatGs(totales.ventaConIva)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-black text-green-700">{formatGs(totales.ivaCobrado)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-black text-[#0F172A]">{formatGs(totales.costoConIva)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-black text-red-600">{formatGs(totales.ivaPagado)}</td>
                      <td className={`py-2 px-3 text-right tabular-nums font-black ${ivaNetoTotal >= 0 ? 'text-[#0F172A]' : 'text-red-600'}`}>
                        {formatGs(ivaNetoTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
