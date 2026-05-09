'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  createCategoria,
  updateCategoria,
  deleteCategoria,
  uploadCategoriaImage,
  type CategoriaInput,
} from './actions'

type CategoriaWithCount = {
  id: string
  nombre: string
  slug: string
  descripcion?: string | null
  imagen_url?: string | null
  activo: boolean
  orden: number
  producto_count: number
}

type CategoriaForm = {
  nombre: string
  slug: string
  descripcion: string
  orden: string
  activo: boolean
  imagen_url: string
}

const emptyForm: CategoriaForm = {
  nombre: '',
  slug: '',
  descripcion: '',
  orden: '0',
  activo: true,
  imagen_url: '',
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface Props {
  categorias: CategoriaWithCount[]
}

export default function CategoriasClient({ categorias }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoriaWithCount | null>(null)
  const [form, setForm] = useState<CategoriaForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, orden: String(categorias.length) })
    setImageFile(null)
    setImagePreview('')
    setError('')
    setModalOpen(true)
  }

  function openEdit(cat: CategoriaWithCount) {
    setEditing(cat)
    setForm({
      nombre: cat.nombre,
      slug: cat.slug,
      descripcion: cat.descripcion || '',
      orden: String(cat.orden),
      activo: cat.activo,
      imagen_url: cat.imagen_url || '',
    })
    setImageFile(null)
    setImagePreview(cat.imagen_url || '')
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setError('')
    setImageFile(null)
    setImagePreview('')
  }

  function handleNombreChange(nombre: string) {
    setForm(f => ({
      ...f,
      nombre,
      slug: toSlug(nombre),
    }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.slug.trim()) { setError('El slug es obligatorio'); return }

    setSaving(true)
    setError('')
    try {
      let finalImageUrl: string | null = form.imagen_url || null

      if (imageFile) {
        const tempId = editing?.id || crypto.randomUUID()
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('categoriaId', tempId)
        finalImageUrl = await uploadCategoriaImage(formData)
      }

      const data: CategoriaInput = {
        nombre: form.nombre.trim(),
        slug: form.slug.trim(),
        descripcion: form.descripcion,
        imagen_url: finalImageUrl,
        orden: parseInt(form.orden) || 0,
        activo: form.activo,
      }

      if (editing) {
        await updateCategoria(editing.id, data)
      } else {
        await createCategoria(data)
      }

      closeModal()
      startTransition(() => router.refresh())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat: CategoriaWithCount) {
    if (cat.producto_count > 0) {
      setError(`No se puede eliminar "${cat.nombre}": tiene ${cat.producto_count} producto(s)`)
      return
    }
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"? Esta acción no se puede deshacer.`)) return

    setDeleting(cat.id)
    setError('')
    try {
      await deleteCategoria(cat.id)
      startTransition(() => router.refresh())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A]">Categorías</h1>
          <p className="text-gray-500 text-sm mt-1">{categorias.length} categoría{categorias.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#F5C518] text-[#0F172A] font-black px-6 py-3 rounded-xl hover:bg-[#D4A80A] transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      {/* Error global */}
      {error && !modalOpen && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-4 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {categorias.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🗂️</div>
            <p className="font-semibold">No hay categorías aún</p>
            <p className="text-sm mt-1">Creá la primera categoría para organizar tus productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Categoría</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-semibold">Descripción</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-semibold">Productos</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-semibold">Orden</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-semibold">Estado</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(cat => (
                  <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* Imagen + Nombre + Slug */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {cat.imagen_url ? (
                            <img
                              src={cat.imagen_url}
                              alt={cat.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                              🗂️
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0F172A]">{cat.nombre}</div>
                          <div className="text-xs text-gray-400 font-mono">{cat.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Descripción */}
                    <td className="py-3 px-4 text-gray-500 text-xs max-w-xs">
                      <span className="line-clamp-2">{cat.descripcion || <span className="text-gray-200">—</span>}</span>
                    </td>

                    {/* Cantidad de productos */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                        cat.producto_count > 0
                          ? 'bg-[#F5C518]/20 text-[#0F172A]'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {cat.producto_count}
                      </span>
                    </td>

                    {/* Orden */}
                    <td className="py-3 px-4 text-center text-gray-600 font-mono text-sm">
                      {cat.orden}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        cat.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {cat.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded-lg hover:bg-[#F5C518]/20 text-[#0F172A] transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deleting === cat.id || isPending}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30"
                          title={cat.producto_count > 0 ? 'No se puede eliminar: tiene productos' : 'Eliminar'}
                        >
                          {deleting === cat.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear / editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-[#0F172A]">
                {editing ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => handleNombreChange(e.target.value)}
                  placeholder="Ej: Ropa de Mujer"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Slug
                  <span className="ml-2 text-xs font-normal text-gray-400">(auto-generado)</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                  placeholder="ropa-de-mujer"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 bg-gray-50"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Descripción breve de la categoría..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 resize-none"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Imagen <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                        🗂️
                      </div>
                    )}
                  </div>
                  {/* Upload */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                          setForm(f => ({ ...f, imagen_url: '' }))
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="ml-2 text-xs text-red-400 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">JPG, PNG o WebP. Máx 5 MB.</p>
                  </div>
                </div>
              </div>

              {/* Orden + Activo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.orden}
                    onChange={e => setForm(f => ({ ...f, orden: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"
                  />
                  <p className="text-xs text-gray-400 mt-1">Menor número = aparece primero</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Estado</label>
                  <label className="flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#0F172A]"
                    />
                    <span className="text-sm text-gray-700">Activa</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-sm font-black bg-[#F5C518] text-[#0F172A] hover:bg-[#D4A80A] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Guardando...
                  </>
                ) : (
                  editing ? 'Guardar cambios' : 'Crear categoría'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
