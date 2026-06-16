'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CancelPage() {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <div className="text-6xl mb-4">😅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pago cancelado
        </h1>
        <p className="text-gray-600 mb-4">
          No te preocupes, puedes intentarlo nuevamente cuando quieras.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            💡 ¿Tuviste algún problema con el pago? Puedes contactarnos o intentar con otra tarjeta.
          </p>
        </div>

        <div className="space-x-4">
          <Link
            href="/precios"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Ver planes
          </Link>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Ir al dashboard
          </Link>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {showFeedback ? 'Ocultar feedback' : 'Dar feedback sobre el problema'}
          </button>

          {showFeedback && (
            <div className="mt-4 text-left">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows="3"
                placeholder="Cuéntanos qué pasó..."
              />
              <button
                className="mt-2 px-4 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition"
              >
                Enviar feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}