'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const slides = [
  { imagen: '/hero-1.jpg', alt: 'Ropa para mascotas', position: 'center center' },
  { imagen: '/hero-2.jpg', alt: 'Juguetes para mascotas', position: 'center center' },
  { imagen: '/hero-3.jpg', alt: 'Accesorios para mascotas', position: 'center 70%' },
  { imagen: '/hero-4.jpg', alt: 'Camas para mascotas', position: 'center center' },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Imágenes */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.imagen}
            alt={slide.alt}
            className="w-full h-full object-cover"
            style={{ objectPosition: slide.position }}
          />
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Contenido sobre el slider */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight drop-shadow-lg">
            Todo para tu<br />
            <span className="text-[#F5C518]">mascota 🐾</span>
          </h1>
          <p className="text-gray-200 text-lg mb-8 max-w-xl mx-auto drop-shadow">
            Ropa, juguetes, accesorios y más. Porque ellos se merecen lo mejor.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/productos"
              className="inline-block bg-[#F5C518] text-[#0F172A] font-black px-8 py-4 rounded-full text-lg hover:bg-[#D4A80A] transition-colors shadow-lg"
            >
              Ver productos →
            </Link>
            <Link
              href="/ofertas"
              className="inline-block bg-transparent border-2 border-white text-white font-black px-8 py-4 rounded-full text-lg hover:bg-white hover:text-[#0F172A] transition-colors"
            >
              🔥 Ver ofertas
            </Link>
          </div>
        </div>
      </div>

      {/* Puntos indicadores */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === current
                ? 'bg-[#F5C518] w-6'
                : 'bg-white/60 hover:bg-white w-2.5'
            }`}
          />
        ))}
      </div>

      {/* Flechas navegación */}
      <button
        onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors text-2xl leading-none"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent(prev => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors text-2xl leading-none"
      >
        ›
      </button>
    </section>
  )
}
