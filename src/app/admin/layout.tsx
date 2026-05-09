'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const menuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/reportes', label: 'Reportes' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/ventas', label: 'Ventas físicas' },
  { href: '/admin/categorias', label: 'Categorías' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  if (pathname === '/admin/login') return <>{children}</>

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] min-h-screen flex flex-col fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="border-b border-white/10" style={{ overflow: 'visible', padding: '4px 0' }}>
          <img
            src="/logo-transparente.png"
            alt="Jagua Store"
            style={{ height: '140px', width: '140px', display: 'block', margin: '0 auto', position: 'relative', zIndex: 10 }}
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === item.href
                  ? 'bg-[#F5C518] text-[#0F172A]'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
