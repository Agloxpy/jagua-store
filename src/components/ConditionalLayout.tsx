'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = pathname?.startsWith('/admin')

  if (!mounted) return <>{children}</>

  if (isAdmin) return <>{children}</>

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
