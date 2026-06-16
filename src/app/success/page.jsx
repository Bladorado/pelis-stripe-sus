'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Solo configurar el temporizador para redirigir después de 5 segundos
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    // Limpiar el temporizador si el componente se desmonta
    return () => clearTimeout(timer)
  }, [router])

  // Usamos otro efecto para manejar el contador de forma independiente
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-600 mb-4">
          Tu suscripción ha sido activada correctamente.
        </p>
        
        {sessionId && (
          <p className="text-sm text-gray-500 mb-4">
            ID de sesión: {sessionId}
          </p>
        )}

        <p className="text-sm text-gray-500 mb-6">
          Serás redirigido al dashboard en {countdown} segundos...
        </p>

        <div className="space-x-4">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Ir al dashboard ahora
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}