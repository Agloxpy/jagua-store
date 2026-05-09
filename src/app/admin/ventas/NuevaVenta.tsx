'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { registrarVentaFisica, type ItemVenta } from './actions'

interface Variante {
  id: string
  talle?: string | null
  color?: string | null
  color_hex?: string | null
  precio_costo: number
  precio_venta: number
  precio_oferta?: number | null
  oferta_activa?: boolean | null
  stock: number
  activo: boolean
}

interface Producto {
  id: string
  nombre: string
  imagenes?: string[] | null
  tiene_variantes: boolean
  precio_costo: number
  precio_venta: number
  precio_oferta?: number | null
  oferta_activa?: boolean | null
  variantes: Variante[]
}

interface CartItem {
  variante_id: string
  producto_id: string
  producto_nombre: string
  variante_talle?: string
  variante_color?: string
  precio_costo: number
  precio_venta: number
  cantidad: number
  stock: number
}

interface Props {
  productos: Producto[]
}

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

function getPrecio(v: { precio_venta: number; precio_oferta?: number | null; oferta_activa?: boolean | null }) {
  return v.oferta_activa && v.precio_oferta ? v.precio_oferta : v.precio_venta
}

export default function NuevaVenta({ productos }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [clienteNombre, setClienteNombre] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const productosActivos = productos.filter(p =>
    p.variantes.some(v => v.activo && v.stock > 0) || (!p.tiene_variantes && p.precio_venta > 0)
  )

  const filtered = search.length >= 1
    ? productosActivos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
    : []

  const addToCart = (
    producto: Producto,
    variante: Variante | null
  ) => {
    const precioVenta = variante ? getPrecio(variante) : getPrecio(producto)
    const precioCosto = variante ? variante.precio_costo : producto.precio_costo
    const stock = variante ? variante.stock : 999
    const varianteId = variante?.id ?? producto.id
    const key = varianteId

    setCart(prev => {
      const existing = prev.find(i => i.variante_id === key)
      if (existing) {
        if (existing.cantidad >= stock) return prev
        return prev.map(i => i.variante_id === key ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, {
        variante_id: key,
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        variante_talle: variante?.talle ?? undefined,
        variante_color: variante?.color ?? undefined,
        precio_costo: precioCosto,
        precio_venta: precioVenta,
        cantidad: 1,
        stock,
      }]
    })
    setSelectedProducto(null)
    setSearch('')
  }

  const updateCantidad = (varianteId: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.variante_id === varianteId
        ? { ...i, cantidad: Math.max(1, Math.min(i.stock, i.cantidad + delta)) }
        : i
      )
    )
  }

  const removeItem = (varianteId: string) => {
    setCart(prev => prev.filter(i => i.variante_id !== varianteId))
  }

  const total = cart.reduce((s, i) => s + i.precio_venta * i.cantidad, 0)

  const handleSubmit = () => {
    if (cart.length === 0) return
    setErrorMsg('')
    startTransition(async () => {
      try {
        const items: ItemVenta[] = cart.map(i => ({
          variante_id: i.variante_id,
          producto_id: i.producto_id,
          producto_nombre: i.producto_nombre,
          variante_talle: i.variante_talle,
          variante_color: i.variante_color,
          precio_costo: i.precio_costo,
          precio_venta: i.precio_venta,
          cantidad: i.cantidad,
        }))
        const { numero_pedido } = await registrarVentaFisica(items, clienteNombre, metodoPago)
        setCart([])
        setClienteNombre('')
        setMetodoPago('efectivo')
        setSuccessMsg(`Venta #${numero_pedido} registrada`)
        setTimeout(() => setSuccessMsg(''), 4000)
        router.refresh()
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : 'Error al registrar venta')
      }
    })
  }

  const variantesDisponibles = selectedProducto?.variantes.filter(v => v.activo && v.stock > 0) ?? []

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-black text-[#0F172A] text-lg mb-5">Nueva venta</h2>

      {/* Buscador */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar producto…"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setSelectedProducto(null)
          }}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0F172A]"
        />
        {filtered.length > 0 && !selectedProducto && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  if (!p.tiene_variantes) {
                    addToCart(p, null)
                  } else {
                    setSelectedProducto(p)
                    setSearch(p.nombre)
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
              >
                {p.imagenes?.[0] ? (
                  <img src={p.imagenes[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#0F172A] truncate">{p.nombre}</div>
                  <div className="text-xs text-gray-400">
                    {p.tiene_variantes
                      ? `${p.variantes.filter(v => v.activo && v.stock > 0).length} variantes`
                      : formatGs(getPrecio(p))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selector de variantes */}
      {selectedProducto && variantesDisponibles.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-2 font-semibold">Seleccionar variante de <span className="text-[#0F172A]">{selectedProducto.nombre}</span></p>
          <div className="flex flex-wrap gap-2">
            {variantesDisponibles.map(v => {
              const label = [v.talle, v.color].filter(Boolean).join(' · ') || 'Sin variante'
              return (
                <button
                  key={v.id}
                  onClick={() => addToCart(selectedProducto, v)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:border-[#0F172A] transition-colors"
                >
                  {v.color_hex && (
                    <span className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0" style={{ background: v.color_hex }} />
                  )}
                  {label}
                  <span className="text-gray-400 font-normal">({v.stock})</span>
                  <span className="text-[#0F172A]">{formatGs(getPrecio(v))}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => { setSelectedProducto(null); setSearch('') }}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Carrito */}
      {cart.length > 0 ? (
        <div className="mb-5">
          <div className="space-y-2 mb-4">
            {cart.map(item => {
              const variante = [item.variante_talle, item.variante_color].filter(Boolean).join(' · ')
              return (
                <div key={item.variante_id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#0F172A] truncate">{item.producto_nombre}</div>
                    {variante && <div className="text-xs text-gray-400">{variante}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateCantidad(item.variante_id, -1)}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold"
                    >−</button>
                    <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateCantidad(item.variante_id, +1)}
                      disabled={item.cantidad >= item.stock}
                      className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold disabled:opacity-30"
                    >+</button>
                  </div>
                  <div className="text-sm font-bold text-[#0F172A] tabular-nums w-28 text-right flex-shrink-0">
                    {formatGs(item.precio_venta * item.cantidad)}
                  </div>
                  <button
                    onClick={() => removeItem(item.variante_id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0"
                  >×</button>
                </div>
              )
            })}
          </div>

          {/* Datos cliente + pago */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Nombre del cliente (opcional)"
              value={clienteNombre}
              onChange={e => setClienteNombre(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#0F172A]"
            />
            <select
              value={metodoPago}
              onChange={e => setMetodoPago(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F172A]"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="bancard">Bancard</option>
            </select>
          </div>

          {/* Total + submit */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Total</div>
              <div className="text-2xl font-black text-[#0F172A] tabular-nums">{formatGs(total)}</div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-[#F5C518] text-[#0F172A] font-black px-8 py-3 rounded-xl hover:bg-[#D4A80A] transition-colors disabled:opacity-50 text-sm"
            >
              {isPending ? 'Registrando…' : 'Registrar venta'}
            </button>
          </div>

          {errorMsg && (
            <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{errorMsg}</p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-300 text-sm">
          Busca y agrega productos al carrito
        </div>
      )}

      {successMsg && (
        <div className="mt-3 bg-green-50 text-green-700 font-semibold text-sm rounded-xl px-4 py-3 text-center">
          {successMsg}
        </div>
      )}
    </div>
  )
}
