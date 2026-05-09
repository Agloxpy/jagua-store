'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { Producto, Variante } from '@/types'

const WHATSAPP_NUMBER = '595971000000' // Cambiar por el número real de WhatsApp

interface ProductoConExtras extends Producto {
  precio_oferta: number | null
  oferta_activa: boolean
  oferta_hasta: string | null
}

interface Props {
  producto: ProductoConExtras
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n)
}

export default function ProductoDetalle({ producto }: Props) {
  const { addItem } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedTalle, setSelectedTalle] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  const variantes: Variante[] = (producto.variantes ?? []).filter(v => v.activo)

  // Opciones únicas disponibles
  const talles = Array.from(new Set(variantes.map(v => v.talle).filter(Boolean))) as string[]
  const colores = Array.from(new Set(variantes.map(v => v.color).filter(Boolean))) as string[]

  // Variante seleccionada (match talle + color)
  const varianteSeleccionada: Variante | undefined = producto.tiene_variantes
    ? variantes.find(v =>
        (!talles.length || v.talle === selectedTalle) &&
        (!colores.length || v.color === selectedColor)
      )
    : undefined

  // Precio a mostrar
  const tieneOferta = varianteSeleccionada
    ? (varianteSeleccionada.oferta_activa && varianteSeleccionada.precio_oferta != null)
    : (producto.oferta_activa && producto.precio_oferta != null)

  const precioActual = varianteSeleccionada
    ? (tieneOferta ? varianteSeleccionada.precio_oferta! : (varianteSeleccionada.precio_venta ?? producto.precio_venta))
    : (tieneOferta ? producto.precio_oferta! : producto.precio_venta)

  const precioTachado = tieneOferta
    ? (varianteSeleccionada?.precio_venta ?? producto.precio_venta)
    : null

  // Stock disponible
  const stockDisponible = varianteSeleccionada ? varianteSeleccionada.stock : (producto.tiene_variantes ? 0 : 999)
  const sinStock = producto.tiene_variantes && stockDisponible <= 0

  // WhatsApp
  const waText = encodeURIComponent(`Hola! Me interesa el producto: ${producto.nombre}`)
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`

  function handleAgregarCarrito() {
    if (sinStock) return
    addItem(producto as unknown as Producto, varianteSeleccionada, cantidad)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const imagenes = producto.imagenes ?? []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#0F172A] transition-colors">Inicio</Link>
          <span>›</span>
          {producto.categoria && (
            <>
              <Link
                href={`/categoria/${(producto.categoria as any).slug}`}
                className="hover:text-[#0F172A] transition-colors"
              >
                {(producto.categoria as any).nombre}
              </Link>
              <span>›</span>
            </>
          )}
          <span className="text-[#1A1A1A] font-medium truncate max-w-xs">{producto.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Galería ── */}
          <div className="space-y-3">
            {/* Imagen principal */}
            <div className="aspect-square bg-[#F7F7F7] rounded-2xl overflow-hidden">
              {imagenes[selectedImage] ? (
                <img
                  src={imagenes[selectedImage]}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl text-gray-200">🐾</div>
              )}
            </div>

            {/* Thumbnails */}
            {imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imagenes.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-[#F5C518]' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`${producto.nombre} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col gap-5">
            {/* Nombre + categoría */}
            {producto.categoria && (
              <Link
                href={`/categoria/${(producto.categoria as any).slug}`}
                className="inline-block text-xs font-semibold text-[#0F172A] bg-[#F5C518]/20 px-3 py-1 rounded-full w-fit hover:bg-[#F5C518]/40 transition-colors"
              >
                {(producto.categoria as any).nombre}
              </Link>
            )}
            <h1 className="text-3xl font-black text-[#1A1A1A] leading-tight">{producto.nombre}</h1>

            {/* Precio */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-4xl font-black text-[#0F172A]">{formatPrice(precioActual)}</span>
              {precioTachado && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(precioTachado)}</span>
                  <span className="bg-red-500 text-white text-sm font-black px-2.5 py-1 rounded-full">
                    -{Math.round((1 - precioActual / precioTachado) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <p className="text-gray-600 text-sm leading-relaxed">{producto.descripcion}</p>
            )}

            {/* Selector de talles */}
            {talles.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-2">
                  Talle: {selectedTalle && <span className="font-normal text-gray-600">{selectedTalle}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {talles.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTalle(t === selectedTalle ? null : t)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedTalle === t
                          ? 'border-[#0F172A] bg-[#0F172A] text-white'
                          : 'border-gray-200 text-[#1A1A1A] hover:border-[#0F172A]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de colores */}
            {colores.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-2">
                  Color: {selectedColor && <span className="font-normal text-gray-600">{selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colores.map(color => {
                    const varConColor = variantes.find(v => v.color === color)
                    const hex = varConColor?.color_hex || '#ccc'
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                        title={color}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          selectedColor === color
                            ? 'border-[#0F172A] bg-[#0F172A]/5'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sin stock */}
            {sinStock && producto.tiene_variantes && (
              <p className="text-sm text-red-500 font-semibold">
                {!selectedTalle && talles.length > 0 ? 'Seleccioná un talle' :
                 !selectedColor && colores.length > 0 ? 'Seleccioná un color' :
                 'Sin stock disponible'}
              </p>
            )}

            {/* Cantidad */}
            {!sinStock && (
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Cantidad</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCantidad(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-[#0F172A] transition-colors"
                  >
                    −
                  </button>
                  <span className="text-lg font-black text-[#1A1A1A] w-8 text-center">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(q => Math.min(stockDisponible, q + 1))}
                    className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-[#0F172A] transition-colors"
                  >
                    +
                  </button>
                  {stockDisponible < 10 && stockDisponible > 0 && (
                    <span className="text-xs text-amber-600 font-semibold">
                      Solo {stockDisponible} disponibles
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAgregarCarrito}
                disabled={sinStock}
                className={`flex-1 py-4 rounded-2xl font-black text-base transition-all ${
                  agregado
                    ? 'bg-green-500 text-white'
                    : sinStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#F5C518] text-[#0F172A] hover:bg-[#D4A80A] hover:-translate-y-0.5 shadow-sm hover:shadow-md'
                }`}
              >
                {agregado ? '✓ Agregado al carrito' : sinStock ? 'Sin stock' : '🛒 Agregar al carrito'}
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-green-500 text-green-600 font-black text-base hover:bg-green-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Consultar
              </a>
            </div>

            {/* Info extra */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <span>Delivery a todo el Paraguay</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <span>Cambios y devoluciones en 7 días</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💳</span>
                <span>Pagos seguros: transferencia o efectivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
