'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Producto, Variante } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (producto: Producto, variante?: Variante, cantidad?: number) => void
  removeItem: (productoId: string, varianteId?: string) => void
  updateQuantity: (productoId: string, cantidad: number, varianteId?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('jagua-cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('jagua-cart', JSON.stringify(items))
  }, [items])

  const addItem = (producto: Producto, variante?: Variante, cantidad = 1) => {
    setItems(prev => {
      const existing = prev.find(i =>
        i.producto.id === producto.id &&
        i.variante?.id === variante?.id
      )
      if (existing) {
        return prev.map(i =>
          i.producto.id === producto.id && i.variante?.id === variante?.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        )
      }
      return [...prev, { producto, variante, cantidad }]
    })
  }

  const removeItem = (productoId: string, varianteId?: string) => {
    setItems(prev => prev.filter(i =>
      !(i.producto.id === productoId && i.variante?.id === varianteId)
    ))
  }

  const updateQuantity = (productoId: string, cantidad: number, varianteId?: string) => {
    if (cantidad <= 0) { removeItem(productoId, varianteId); return }
    setItems(prev => prev.map(i =>
      i.producto.id === productoId && i.variante?.id === varianteId
        ? { ...i, cantidad }
        : i
    ))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)
  const totalPrice = items.reduce((sum, i) => {
    const precio = i.variante?.precio_venta ?? i.producto.precio_venta
    return sum + precio * i.cantidad
  }, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
