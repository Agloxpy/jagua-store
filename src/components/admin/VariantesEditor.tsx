'use client'

function formatGuaranies(value: string | number): string {
  const numbers = String(value).replace(/\D/g, '')
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parseGuaranies(value: string): number {
  return parseInt(value.replace(/\./g, '')) || 0
}

function formatGs(n: number): string {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(Math.round(n))}`
}

const TALLES = ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
const TALLE_LABELS: Record<string, string> = { '': 'Sin talle' }

export interface VarianteForm {
  id?: string
  talle: string
  color: string
  color_hex: string
  precio_costo: string
  precio_venta: string
  precio_oferta: string
  oferta_activa: boolean
  iva: string
  stock: string
  activo: boolean
  _delete?: boolean
}

interface Props {
  variantes: VarianteForm[]
  onChange: (variantes: VarianteForm[]) => void
}

export default function VariantesEditor({ variantes, onChange }: Props) {
  const addVariante = () => {
    onChange([...variantes, {
      talle: '',
      color: '',
      color_hex: '#000000',
      precio_costo: '',
      precio_venta: '',
      precio_oferta: '',
      oferta_activa: false,
      iva: '0.10',
      stock: '0',
      activo: true,
    }])
  }

  const update = (index: number, field: keyof VarianteForm, value: string | boolean) => {
    onChange(variantes.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const remove = (index: number) => {
    const v = variantes[index]
    if (v.id) {
      onChange(variantes.map((vv, i) => i === index ? { ...vv, _delete: true } : vv))
    } else {
      onChange(variantes.filter((_, i) => i !== index))
    }
  }

  const visible = variantes.filter(v => !v._delete)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[#0F172A] text-sm">Variantes</h3>
        <button
          type="button"
          onClick={addVariante}
          className="bg-[#F5C518] text-[#0F172A] font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-[#D4A80A] transition-colors"
        >
          + Agregar variante
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
          Sin variantes. Hacé click en &quot;Agregar variante&quot;.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Talle</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Color</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Hex</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">P. Costo</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">P. Venta</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Stock</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Activo</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Oferta activa</th>
                <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">P. Oferta</th>
                <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs">Margen</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {variantes.map((v, i) => {
                if (v._delete) return null

                const iva = 0.10
                const costo = parseGuaranies(v.precio_costo)
                const venta = parseGuaranies(v.precio_venta)
                const oferta = parseGuaranies(v.precio_oferta)

                const costoSinIva = costo > 0 ? costo / (1 + iva) : 0
                const ventaSinIva = venta > 0 ? venta / (1 + iva) : 0
                const ofertaSinIva = oferta > 0 ? oferta / (1 + iva) : 0

                const margen = costoSinIva > 0 && ventaSinIva > 0
                  ? Math.round((ventaSinIva - costoSinIva) / costoSinIva * 100)
                  : null
                const margenOferta = v.oferta_activa && costoSinIva > 0 && ofertaSinIva > 0
                  ? Math.round((ofertaSinIva - costoSinIva) / costoSinIva * 100)
                  : null

                const ivaPorUnidad = costo > 0 && venta > 0
                  ? (venta - costo) / (1 + iva) * iva
                  : null
                const ivaPorUnidadOferta = v.oferta_activa && costo > 0 && oferta > 0
                  ? (oferta - costo) / (1 + iva) * iva
                  : null

                const margenActivo = v.oferta_activa && margenOferta !== null ? margenOferta : margen
                const ivaActivo = v.oferta_activa && ivaPorUnidadOferta !== null ? ivaPorUnidadOferta : ivaPorUnidad

                const margenColor = margenActivo === null
                  ? 'text-gray-300'
                  : margenActivo >= 30 ? 'text-green-600'
                  : margenActivo >= 10 ? 'text-amber-500'
                  : 'text-red-500'

                return (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 px-3">
                      <select
                        value={v.talle}
                        onChange={e => update(i, 'talle', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-24 outline-none focus:border-[#0F172A]"
                      >
                        {TALLES.map(t => (
                          <option key={t} value={t}>{TALLE_LABELS[t] ?? t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.color}
                        onChange={e => update(i, 'color', e.target.value)}
                        placeholder="Rojo"
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-24 outline-none focus:border-[#0F172A]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="color"
                        value={v.color_hex || '#000000'}
                        onChange={e => update(i, 'color_hex', e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatGuaranies(v.precio_costo)}
                        onChange={e => update(i, 'precio_costo', e.target.value.replace(/\D/g, ''))}
                        placeholder="0"
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-24 outline-none focus:border-[#0F172A]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatGuaranies(v.precio_venta)}
                        onChange={e => update(i, 'precio_venta', e.target.value.replace(/\D/g, ''))}
                        placeholder="0"
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-24 outline-none focus:border-[#0F172A]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={e => update(i, 'stock', e.target.value)}
                        placeholder="0"
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-20 outline-none focus:border-[#0F172A]"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={v.activo}
                        onChange={e => update(i, 'activo', e.target.checked)}
                        className="w-4 h-4 accent-[#0F172A]"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={v.oferta_activa}
                        onChange={e => update(i, 'oferta_activa', e.target.checked)}
                        className="w-4 h-4 accent-[#F5C518]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      {v.oferta_activa ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatGuaranies(v.precio_oferta)}
                          onChange={e => update(i, 'precio_oferta', e.target.value.replace(/\D/g, ''))}
                          placeholder="0"
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-24 outline-none focus:border-[#F5C518]"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs px-2">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className={`text-xs font-semibold tabular-nums ${margenColor}`}>
                        {margenActivo !== null ? `${margenActivo}%` : '—'}
                      </div>
                      {ivaActivo !== null && (
                        <div className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                          IVA: {formatGs(ivaActivo)}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="text-red-400 hover:text-red-600 transition-colors text-sm"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
