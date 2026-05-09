'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VariantesEditor, { VarianteForm } from '@/components/admin/VariantesEditor'
import {
  saveProducto,
  updateProducto,
  uploadProductImage,
  ProductoInput,
  VarianteInput,
} from '@/app/admin/productos/actions'

type Categoria = { id: string; nombre: string }

interface ProductoExistente {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  categoria_id: string | null
  precio_costo: number
  precio_venta: number
  precio_oferta: number | null
  oferta_activa: boolean
  oferta_hasta: string | null
  imagenes: string[] | null
  tiene_variantes: boolean
  activo: boolean
  destacado: boolean
  variantes: {
    id: string
    talle: string | null
    color: string | null
    color_hex: string | null
    precio_costo: number | null
    precio_venta: number | null
    precio_oferta: number | null
    oferta_activa: boolean
    iva: number | null
    stock: number
    activo: boolean
  }[]
}

interface Props {
  categorias: Categoria[]
  producto?: ProductoExistente
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function formatGs(n: number) {
  return `Gs. ${new Intl.NumberFormat('es-PY').format(n)}`
}

function parseGuaranies(value: string): number {
  return parseInt(value.replace(/\./g, '')) || 0
}

const VARIANTE_VACIA: VarianteForm = {
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
}

export default function ProductoFormClient({ categorias, producto }: Props) {
  const router = useRouter()
  const isEditing = !!producto
  const [productId] = useState(() => producto?.id ?? crypto.randomUUID())

  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    slug: producto?.slug ?? '',
    descripcion: producto?.descripcion ?? '',
    categoria_id: producto?.categoria_id ?? '',
    destacado: producto?.destacado ?? false,
    activo: producto?.activo ?? true,
    imagenes: (producto?.imagenes ?? []) as string[],
  })

  const [variantes, setVariantes] = useState<VarianteForm[]>(() => {
    if (producto?.variantes?.length) {
      return producto.variantes.map(v => ({
        id: v.id,
        talle: v.talle ?? '',
        color: v.color ?? '',
        color_hex: v.color_hex ?? '#000000',
        precio_costo: v.precio_costo?.toString() ?? '',
        precio_venta: v.precio_venta?.toString() ?? '',
        precio_oferta: v.precio_oferta?.toString() ?? '',
        oferta_activa: v.oferta_activa ?? false,
        iva: v.iva?.toString() ?? '0.10',
        stock: v.stock.toString(),
        activo: v.activo,
      }))
    }
    return [{ ...VARIANTE_VACIA }]
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleNombreChange = (nombre: string) => {
    setForm(prev => ({
      ...prev,
      nombre,
      ...(!isEditing && { slug: generateSlug(nombre) }),
    }))
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('productId', productId)
        const url = await uploadProductImage(fd)
        newUrls.push(url)
      }
      setForm(prev => ({ ...prev, imagenes: [...prev.imagenes, ...newUrls] }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) =>
    setForm(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, i) => i !== index) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.slug) { setError('Nombre y slug son obligatorios'); return }

    const variantesActivas = variantes.filter(v => !v._delete)
    const preciosVenta = variantesActivas.map(v => parseGuaranies(v.precio_venta)).filter(p => p > 0)
    const preciosCosto = variantesActivas.map(v => parseGuaranies(v.precio_costo)).filter(p => p > 0)

    if (preciosVenta.length === 0) { setError('Agregá al menos un precio de venta en la tabla de precios'); return }

    setSaving(true)
    setError('')

    try {
      const tieneVariantes = variantesActivas.some(
        v => (v.talle && v.talle !== '') || (v.color && v.color !== '')
      )
      const precioCosto = preciosCosto.length > 0 ? Math.min(...preciosCosto) : 0
      const precioVenta = Math.min(...preciosVenta)

      const data: ProductoInput = {
        id: productId,
        nombre: form.nombre,
        slug: form.slug,
        descripcion: form.descripcion,
        categoria_id: form.categoria_id || null,
        precio_costo: precioCosto,
        precio_venta: precioVenta,
        precio_oferta: null,
        oferta_activa: false,
        oferta_hasta: null,
        imagenes: form.imagenes,
        tiene_variantes: tieneVariantes,
        activo: form.activo,
        destacado: form.destacado,
      }

      const variantesInput: VarianteInput[] = variantes.map(v => ({
        id: v.id,
        talle: v.talle,
        color: v.color,
        color_hex: v.color_hex,
        precio_costo: v.precio_costo ? parseGuaranies(v.precio_costo) : null,
        precio_venta: v.precio_venta ? parseGuaranies(v.precio_venta) : null,
        precio_oferta: v.precio_oferta ? parseGuaranies(v.precio_oferta) : null,
        oferta_activa: v.oferta_activa,
        iva: parseFloat(v.iva || '0.10'),
        stock: parseInt(v.stock) || 0,
        activo: v.activo,
        _delete: v._delete,
      }))

      if (isEditing) {
        await updateProducto(productId, data, variantesInput)
      } else {
        await saveProducto(data, variantesInput)
      }

      router.push('/admin/productos')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
      setSaving(false)
    }
  }

  // Resumen calculado desde variantes
  const variantesVisibles = variantes.filter(v => !v._delete)
  const preciosVenta = variantesVisibles.map(v => parseGuaranies(v.precio_venta)).filter(p => p > 0)
  const preciosCosto = variantesVisibles.map(v => parseGuaranies(v.precio_costo)).filter(p => p > 0)
  const ventaMin = preciosVenta.length > 0 ? Math.min(...preciosVenta) : 0
  const ventaMax = preciosVenta.length > 0 ? Math.max(...preciosVenta) : 0
  const costoMin = preciosCosto.length > 0 ? Math.min(...preciosCosto) : 0
  const margenMin = costoMin > 0 && ventaMin > 0 ? Math.round((ventaMin - costoMin) / costoMin * 100) : 0

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#0F172A] transition-colors text-sm'
  const labelCls = 'block text-sm font-semibold text-[#1A1A1A] mb-1.5'

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-400 hover:text-[#0F172A] transition-colors">
          ← Volver
        </Link>
        <h1 className="text-3xl font-black text-[#0F172A]">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Info básica */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="font-black text-[#0F172A] text-lg">Información básica</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className={labelCls}>Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => handleNombreChange(e.target.value)}
                  className={inputCls}
                  placeholder="Ej: Campera impermeable para perro"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Slug (URL) *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => set('slug', e.target.value)}
                  className={`${inputCls} font-mono text-xs`}
                  placeholder="campera-impermeable-perro"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">jaguastore.com/producto/{form.slug || '...'}</p>
              </div>

              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => set('descripcion', e.target.value)}
                  className={`${inputCls} h-28 resize-none`}
                  placeholder="Descripción del producto..."
                />
              </div>

              <div>
                <label className={labelCls}>Categoría</label>
                <select
                  value={form.categoria_id}
                  onChange={e => set('categoria_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Imágenes */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="font-black text-[#0F172A] text-lg">Imágenes</h2>

              {form.imagenes.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {form.imagenes.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#0F172A] text-white text-xs px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <label className={`flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#F5C518] transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className="text-2xl">{uploading ? '⏳' : '📸'}</span>
                <span className="text-sm font-semibold text-gray-600">
                  {uploading ? 'Subiendo...' : 'Agregar imágenes'}
                </span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => handleImageUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">

            {/* Estado */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="font-black text-[#0F172A] text-lg">Estado</h2>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => set('activo', e.target.checked)}
                  className="w-4 h-4 accent-[#0F172A]"
                />
                <div>
                  <div className="text-sm font-semibold text-[#1A1A1A]">Activo</div>
                  <div className="text-xs text-gray-400">Visible en la tienda</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={e => set('destacado', e.target.checked)}
                  className="w-4 h-4 accent-[#0F172A]"
                />
                <div>
                  <div className="text-sm font-semibold text-[#1A1A1A]">Destacado</div>
                  <div className="text-xs text-gray-400">Aparece en secciones especiales</div>
                </div>
              </label>
            </div>

            {/* Resumen de precios */}
            {ventaMin > 0 && (
              <div className="bg-[#0F172A] rounded-2xl p-6 text-white space-y-3">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Resumen</h3>
                {costoMin > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Costo mín.</span>
                    <span className="font-semibold">{formatGs(costoMin)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {ventaMin === ventaMax ? 'Precio' : 'Precio mín.'}
                  </span>
                  <span className="font-semibold">{formatGs(ventaMin)}</span>
                </div>
                {ventaMin !== ventaMax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Precio máx.</span>
                    <span className="font-semibold">{formatGs(ventaMax)}</span>
                  </div>
                )}
                {margenMin > 0 && (
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-gray-400 text-sm">Margen mín.</span>
                    <span className={`font-black text-lg ${margenMin >= 30 ? 'text-green-400' : margenMin >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {margenMin}%
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
                  <span className="text-gray-400">Variantes</span>
                  <span className="font-semibold">{variantesVisibles.filter(v => v.activo).length}</span>
                </div>
              </div>
            )}

            {/* Botón guardar */}
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full bg-[#F5C518] text-[#0F172A] font-black py-4 rounded-2xl text-lg hover:bg-[#D4A80A] transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>

            <Link
              href="/admin/productos"
              className="block w-full text-center py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>

          {/* Precios y Stock - ancho completo */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <h2 className="font-black text-[#0F172A] text-lg">Precios y Stock</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Producto sin variantes: dejá Talle y Color vacíos. Con variantes: completá Talle o Color.
              </p>
            </div>
            <VariantesEditor variantes={variantes} onChange={setVariantes} />
          </div>
        </div>
      </form>
    </div>
  )
}
