import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jagua Store - Accesorios para tu mascota',
  description: 'La mejor tienda de accesorios para mascotas en Paraguay.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
