// src/app/precios/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { createClient } from '@/lib/supabase/client'

export default function PreciosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [planActual, setPlanActual] = useState('cliente')
  const [selectedPlan, setSelectedPlan] = useState(null) // Guardar plan seleccionado

  // Verificar si viene de un redirect después de login
  const redirectPlan = searchParams.get('plan')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        if (perfil) setPlanActual(perfil.plan)
        
        // Si hay un plan en la URL, procesarlo automáticamente
        if (redirectPlan) {
          const plan = planes.find(p => p.id === redirectPlan)
          if (plan && plan.priceId) {
            handleSubscribe(plan.priceId, plan.id)
          }
        }
      }
    }
    getUser()
  }, [supabase, redirectPlan])

  const handleSubscribe = async (priceId, plan) => {
    // Si no hay usuario, guardar el plan y redirigir al login
    if (!user) {
      setSelectedPlan(plan)
      router.push(`/login?redirect=/precios&plan=${plan}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al crear sesión de pago')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const planes = [
    {
      id: 'cliente',
      nombre: 'Cliente',
      precio: 'Gratis',
      descripcion: 'Contenido básico',
      features: ['Películas en SD', '1 dispositivo', 'Anuncios'],
      priceId: null,
      current: planActual === 'cliente'
    },
    {
      id: 'estandar',
      nombre: 'Estándar',
      precio: '$9.99/mes',
      descripcion: 'Más contenido y funciones',
      features: ['Películas en HD', '2 dispositivos', 'Sin anuncios', 'Descargas'],
      priceId: process.env.NEXT_PUBLIC_STANDARD_PRICE_ID,
      current: planActual === 'estandar'
    },
    {
      id: 'premium',
      nombre: 'Premium',
      precio: '$19.99/mes',
      descripcion: 'Todo el contenido + exclusivas',
      features: ['Películas en 4K', '5 dispositivos', 'Sin anuncios', 'Descargas', 'Contenido exclusivo'],
      priceId: process.env.NEXT_PUBLIC_PREMIUM_PRICE_ID,
      current: planActual === 'premium'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Elige tu plan</h1>
          <p className="text-xl text-gray-600 mt-4">
            Actualiza tu suscripción para acceder a más contenido
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg p-6 ${
                plan.current ? 'border-2 border-blue-500' : ''
              }`}
            >
              {plan.current && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                  Plan actual
                </span>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900">{plan.nombre}</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">{plan.precio}</p>
              <p className="text-gray-600 mt-2">{plan.descripcion}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id !== 'cliente' && (
                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={loading || plan.current}
                  className={`w-full mt-6 py-3 px-4 rounded-md transition ${
                    plan.current
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Procesando...' : plan.current ? 'Actual' : 'Suscribirse'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}