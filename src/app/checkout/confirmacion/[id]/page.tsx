import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const fmt = (n: number) => 'Gs. ' + new Intl.NumberFormat('es-PY').format(Math.round(n))

interface ItemRow {
  id: string
  producto_nombre: string
  producto_imagen?: string | null
  variante_talle?: string | null
  variante_color?: string | null
  cantidad: number
  subtotal: number
}

export default async function ConfirmacionPage({ params }: { params: { id: string } }) {
  const { data: pedido, error } = await supabaseAdmin
    .from('pedidos')
    .select('*, items:pedido_items(*)')
    .eq('id', params.id)
    .single()

  if (error || !pedido) return notFound()

  const items: ItemRow[] = (pedido.items ?? []) as ItemRow[]

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Encabezado de éxito */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">¡Pedido confirmado!</h1>
          <p className="text-gray-500 text-sm">
            Número de pedido:{' '}
            <span className="font-bold text-[#1A1A1A]">#{pedido.numero_pedido}</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Nos comunicaremos con vos a la brevedad para coordinar.
          </p>
        </div>

        <div className="space-y-4">
          {/* Datos del cliente */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span>👤</span> Datos del cliente
            </h2>
            <div className="text-sm space-y-1.5 text-gray-600">
              <p>
                <span className="font-medium text-[#1A1A1A]">Nombre:</span>{' '}
                {pedido.cliente_nombre}
              </p>
              <p>
                <span className="font-medium text-[#1A1A1A]">Teléfono:</span>{' '}
                {pedido.cliente_telefono}
              </p>
              {pedido.cliente_email && (
                <p>
                  <span className="font-medium text-[#1A1A1A]">Email:</span>{' '}
                  {pedido.cliente_email}
                </p>
              )}
            </div>
          </div>

          {/* Entrega */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-[#1A1A1A] mb-3">
              {pedido.tipo_entrega === 'delivery' ? '🚚 Entrega a domicilio' : '🏪 Retiro en local'}
            </h2>
            <div className="text-sm text-gray-600 space-y-1.5">
              {pedido.tipo_entrega === 'delivery' ? (
                <>
                  <p>
                    <span className="font-medium text-[#1A1A1A]">Departamento:</span>{' '}
                    {pedido.departamento_entrega}
                  </p>
                  <p>
                    <span className="font-medium text-[#1A1A1A]">Costo de envío:</span>{' '}
                    {fmt(pedido.costo_envio)}
                  </p>
                </>
              ) : (
                <p>
                  <span className="font-medium text-[#1A1A1A]">Dirección:</span> Campos Cervera
                  esq. Mac Arthur, Bo. Recoleta, Asunción
                </p>
              )}
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-[#1A1A1A] mb-3">Método de pago</h2>

            {pedido.metodo_pago === 'transferencia' && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  🏦 <span className="font-medium text-[#1A1A1A]">Transferencia bancaria</span>
                </p>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-2">
                    Realizá la transferencia a:
                  </p>
                  <div className="text-sm text-blue-700 space-y-1.5">
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
                    📲 Enviá el comprobante por WhatsApp indicando el número de pedido{' '}
                    <strong>#{pedido.numero_pedido}</strong>.
                  </p>
                </div>
              </>
            )}

            {pedido.metodo_pago === 'efectivo' && (
              <p className="text-sm text-gray-600">
                💵 <span className="font-medium text-[#1A1A1A]">Efectivo</span> —{' '}
                {pedido.tipo_entrega === 'retiro'
                  ? 'Pagás al retirar en el local'
                  : 'Pagás al recibir en Asunción'}
              </p>
            )}

            {pedido.metodo_pago === 'bancard' && (
              <p className="text-sm text-gray-600">
                💳 <span className="font-medium text-[#1A1A1A]">Bancard</span>
              </p>
            )}
          </div>

          {/* Productos */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-[#1A1A1A] mb-4">Productos</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {item.producto_imagen ? (
                      <img
                        src={item.producto_imagen}
                        alt={item.producto_nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🐾
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                      {item.producto_nombre}
                    </p>
                    {(item.variante_talle || item.variante_color) && (
                      <p className="text-xs text-gray-400">
                        {[
                          item.variante_talle && `Talle ${item.variante_talle}`,
                          item.variante_color,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">x{item.cantidad}</p>
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{fmt(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{fmt(pedido.subtotal)}</span>
              </div>
              {pedido.costo_envio > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span>{fmt(pedido.costo_envio)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#1A1A1A] text-base pt-1">
                <span>Total</span>
                <span>{fmt(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3.5 text-center border-2 border-gray-200 rounded-full font-semibold text-sm text-gray-600 hover:border-gray-300 transition-colors"
            >
              Volver al inicio
            </Link>
            <Link
              href="/productos"
              className="flex-1 py-3.5 text-center bg-[#F5C518] hover:bg-[#D4A80A] text-[#1A1A1A] font-bold rounded-full transition-colors text-sm"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
