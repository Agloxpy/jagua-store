'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

const fmt = (n: number) => 'Gs. ' + new Intl.NumberFormat('es-PY').format(Math.round(n))

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">Explorá nuestros productos y agregá lo que necesita tu mascota</p>
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">
          Mi carrito{' '}
          <span className="text-base font-normal text-gray-400">
            ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const precio = item.variante?.precio_venta ?? item.producto.precio_venta
              const subtotal = precio * item.cantidad
              const imagen = item.producto.imagenes?.[0]
              const varianteLabel = [
                item.variante?.talle && `Talle ${item.variante.talle}`,
                item.variante?.color,
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <div
                  key={`${item.producto.id}-${item.variante?.id ?? 'base'}`}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm"
                >
                  {/* Imagen */}
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {imagen ? (
                      <img
                        src={imagen}
                        alt={item.producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🐾
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#1A1A1A] text-sm md:text-base leading-snug">
                          {item.producto.nombre}
                        </h3>
                        {varianteLabel && (
                          <p className="text-xs text-gray-500 mt-0.5">{varianteLabel}</p>
                        )}
                        <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{fmt(precio)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.producto.id, item.variante?.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Selector cantidad */}
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.producto.id, item.cantidad - 1, item.variante?.id)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-medium text-gray-600"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.producto.id, item.cantidad + 1, item.variante?.id)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-medium text-gray-600"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-bold text-[#1A1A1A] text-sm md:text-base">{fmt(subtotal)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">Resumen del pedido</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1A1A1A]">{fmt(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-gray-400 italic text-xs">Se calcula en el checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-[#1A1A1A]">
                  <span>Total estimado</span>
                  <span>{fmt(totalPrice)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full mt-6 bg-[#F5C518] hover:bg-[#D4A80A] text-[#1A1A1A] font-bold text-center py-3.5 rounded-full transition-colors text-sm"
              >
                Continuar al checkout →
              </Link>

              <Link
                href="/productos"
                className="block w-full mt-3 text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                ← Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
