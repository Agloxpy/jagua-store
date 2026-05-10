'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearPedido } from './actions'

const DEPARTAMENTOS = [
  'Asunción',
  'Central',
  'Alto Paraná',
  'Cordillera',
  'Guairá',
  'Caaguazú',
  'Caazapá',
  'Itapúa',
  'Misiones',
  'Paraguarí',
  'Presidente Hayes',
  'Alto Paraguay',
  'Boquerón',
  'Amambay',
  'Concepción',
  'San Pedro',
  'Canindeyú',
  'Ñeembucú',
]

function getCostoEnvio(depto: string): number {
  if (['Asunción', 'Central'].includes(depto)) return 25000
  if (['Alto Paraná', 'Cordillera', 'Guairá', 'Caaguazú'].includes(depto)) return 35000
  return 45000
}

const fmt = (n: number) => 'Gs. ' + new Intl.NumberFormat('es-PY').format(Math.round(n))

const STEP_LABELS = ['Datos', 'Entrega', 'Pago']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)

  const [step, setStep] = useState(1)

  // Step 1
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')

  // Step 2
  const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retiro' | ''>('')
  const [departamento, setDepartamento] = useState('')

  // Step 3
  const [metodoPago, setMetodoPago] = useState<'bancard' | 'transferencia' | 'efectivo' | ''>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setMounted(true), [])

  const costoEnvio =
    tipoEntrega === 'delivery' && departamento ? getCostoEnvio(departamento) : 0
  const total = totalPrice + costoEnvio

  const efectivoDisponible =
    tipoEntrega === 'retiro' || (tipoEntrega === 'delivery' && departamento === 'Asunción')

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!nombre.trim()) return 'Ingresá tu nombre completo'
      if (!telefono.trim()) return 'Ingresá tu número de celular'
    }
    if (s === 2) {
      if (!tipoEntrega) return 'Seleccioná un tipo de entrega'
      if (tipoEntrega === 'delivery' && !departamento) return 'Seleccioná tu departamento'
    }
    if (s === 3) {
      if (!metodoPago) return 'Seleccioná un método de pago'
    }
    return ''
  }

  const handleNext = () => {
    const err = validateStep(step)
    setError(err)
    if (!err) {
      setError('')
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    const err = validateStep(3)
    setError(err)
    if (err || !metodoPago || !tipoEntrega) return

    setLoading(true)
    setError('')
    try {
      const result = await crearPedido({
        cliente_nombre: nombre.trim(),
        cliente_telefono: telefono.trim(),
        cliente_email: email.trim() || undefined,
        tipo_entrega: tipoEntrega,
        departamento_entrega: tipoEntrega === 'delivery' ? departamento : undefined,
        metodo_pago: metodoPago,
        subtotal: totalPrice,
        costo_envio: costoEnvio,
        total,
        items: items.map((i) => ({
          producto_id: i.producto.id,
          variante_id: i.variante?.id,
          producto_nombre: i.producto.nombre,
          producto_imagen: i.producto.imagenes?.[0],
          variante_talle: i.variante?.talle,
          variante_color: i.variante?.color,
          precio_venta: i.variante?.precio_venta ?? i.producto.precio_venta,
          cantidad: i.cantidad,
          subtotal: (i.variante?.precio_venta ?? i.producto.precio_venta) * i.cantidad,
        })),
      })
      clearCart()
      router.push(`/checkout/confirmacion/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido. Intentá de nuevo.')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
        <div className="text-center py-20">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Tu carrito está vacío</h2>
          <Link
            href="/productos"
            className="inline-block bg-[#F5C518] hover:bg-[#D4A80A] text-[#1A1A1A] font-bold px-8 py-3.5 rounded-full transition-colors text-sm"
          >
            Ver productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1
            const done = step > s
            const active = step === s
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      done
                        ? 'bg-[#F5C518] text-[#1A1A1A]'
                        : active
                        ? 'bg-[#1A1A1A] text-[#F5C518]'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {done ? '✓' : s}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium ${
                      active ? 'text-[#1A1A1A]' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-14 md:w-24 h-0.5 mb-5 mx-1 transition-colors ${
                      step > s ? 'bg-[#F5C518]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* PASO 1 — Datos del cliente */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">Tus datos</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#F5C518] transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Celular <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="Ej: 0981 123 456"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#F5C518] transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email{' '}
                        <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ej: juan@email.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#F5C518] transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2 — Tipo de entrega */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">Tipo de entrega</h2>
                  <div className="space-y-3">
                    {/* Delivery */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        tipoEntrega === 'delivery'
                          ? 'border-[#F5C518] bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="entrega"
                        value="delivery"
                        checked={tipoEntrega === 'delivery'}
                        onChange={() => {
                          setTipoEntrega('delivery')
                          setDepartamento('')
                        }}
                        className="mt-0.5 accent-[#F5C518]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🚚</span>
                          <span className="font-semibold text-[#1A1A1A]">Delivery</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">Enviamos a todo el Paraguay</p>
                      </div>
                    </label>

                    {/* Selector de departamento */}
                    {tipoEntrega === 'delivery' && (
                      <div className="ml-8 space-y-2">
                        <select
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#F5C518] text-sm bg-white"
                        >
                          <option value="">Seleccioná tu departamento</option>
                          {DEPARTAMENTOS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        {departamento && (
                          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                            <span>📦</span>
                            <span>
                              Costo de envío:{' '}
                              <strong>{fmt(getCostoEnvio(departamento))}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Precios de referencia */}
                    {tipoEntrega === 'delivery' && !departamento && (
                      <div className="ml-8 text-xs text-gray-400 space-y-0.5">
                        <p>• Asunción y Central: Gs. 25.000</p>
                        <p>• Alto Paraná, Cordillera, Guairá, Caaguazú: Gs. 35.000</p>
                        <p>• Resto del país: Gs. 45.000</p>
                      </div>
                    )}

                    {/* Retiro en local */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        tipoEntrega === 'retiro'
                          ? 'border-[#F5C518] bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="entrega"
                        value="retiro"
                        checked={tipoEntrega === 'retiro'}
                        onChange={() => {
                          setTipoEntrega('retiro')
                          setDepartamento('')
                        }}
                        className="mt-0.5 accent-[#F5C518]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">🏪</span>
                          <span className="font-semibold text-[#1A1A1A]">Retiro en local</span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            Sin costo
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Campos Cervera esq. Mac Arthur, Bo. Recoleta, Asunción
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* PASO 3 — Método de pago */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">Método de pago</h2>
                  <div className="space-y-3">
                    {/* Bancard — próximamente */}
                    <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed select-none">
                      <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">💳</span>
                          <span className="font-semibold text-gray-500">Bancard (tarjeta)</span>
                          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                            Próximamente
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">Débito o crédito</p>
                      </div>
                    </div>

                    {/* Transferencia */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        metodoPago === 'transferencia'
                          ? 'border-[#F5C518] bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pago"
                        value="transferencia"
                        checked={metodoPago === 'transferencia'}
                        onChange={() => setMetodoPago('transferencia')}
                        className="mt-0.5 accent-[#F5C518]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏦</span>
                          <span className="font-semibold text-[#1A1A1A]">
                            Transferencia bancaria
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Recibís los datos al confirmar el pedido
                        </p>
                      </div>
                    </label>

                    {/* Datos bancarios (se muestra al seleccionar transferencia) */}
                    {metodoPago === 'transferencia' && (
                      <div className="ml-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-semibold text-blue-800 mb-2">
                          Datos para la transferencia:
                        </p>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>
                            <span className="font-medium">Banco:</span> Banco Regional
                          </p>
                          <p>
                            <span className="font-medium">Cuenta:</span> [Número de cuenta]
                          </p>
                          <p>
                            <span className="font-medium">Titular:</span> Jagua Store
                          </p>
                        </div>
                        <p className="text-xs text-blue-500 mt-3">
                          Enviá el comprobante por WhatsApp para confirmar tu pedido.
                        </p>
                      </div>
                    )}

                    {/* Efectivo */}
                    {efectivoDisponible ? (
                      <label
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          metodoPago === 'efectivo'
                            ? 'border-[#F5C518] bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pago"
                          value="efectivo"
                          checked={metodoPago === 'efectivo'}
                          onChange={() => setMetodoPago('efectivo')}
                          className="mt-0.5 accent-[#F5C518]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">💵</span>
                            <span className="font-semibold text-[#1A1A1A]">Efectivo</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {tipoEntrega === 'retiro'
                              ? 'Pagás al retirar en el local'
                              : 'Pagás al recibir en Asunción'}
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed select-none">
                        <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">💵</span>
                            <span className="font-semibold text-gray-500">Efectivo</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-0.5">
                            Solo disponible para Asunción o retiro en local
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold text-sm text-gray-600 hover:border-gray-300 transition-colors"
                  >
                    ← Volver
                  </button>
                )}
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-[#F5C518] hover:bg-[#D4A80A] text-[#1A1A1A] font-bold py-3 rounded-full transition-colors text-sm"
                  >
                    Continuar →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-[#1A1A1A] hover:bg-[#333] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-colors text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        Procesando...
                      </span>
                    ) : (
                      'Confirmar pedido'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resumen lateral */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm md:sticky md:top-28">
              <h3 className="font-bold text-[#1A1A1A] mb-4 text-sm">Tu pedido</h3>
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => {
                  const precio = item.variante?.precio_venta ?? item.producto.precio_venta
                  return (
                    <div
                      key={`${item.producto.id}-${item.variante?.id ?? 'base'}`}
                      className="flex gap-3 items-center"
                    >
                      <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {item.producto.imagenes?.[0] ? (
                          <img
                            src={item.producto.imagenes[0]}
                            alt={item.producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🐾
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                          {item.producto.nombre}
                        </p>
                        <p className="text-xs text-gray-400">x{item.cantidad}</p>
                      </div>
                      <p className="text-xs font-bold text-[#1A1A1A] flex-shrink-0">
                        {fmt(precio * item.cantidad)}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{fmt(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span>
                    {costoEnvio > 0
                      ? fmt(costoEnvio)
                      : tipoEntrega === 'retiro'
                      ? 'Gratis'
                      : 'A calcular'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#1A1A1A] text-sm pt-1">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
