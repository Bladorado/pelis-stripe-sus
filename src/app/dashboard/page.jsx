// src/app/dashboard/page.jsx (añadir botón para ir a precios)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        setUser(user)
        console.log('✅ Usuario autenticado:', user.email)

        const { data: perfilData, error: perfilError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (perfilError && perfilError.code === 'PGRST116') {
          console.log('⚠️ Perfil no encontrado, creando uno...')

          const nuevoPerfil = {
            id: user.id,
            email: user.email,
            nombre: user.user_metadata?.nombre || user.email.split('@')[0],
            plan: 'cliente',
            activo: true
          }

          const { data: insertData, error: insertError } = await supabase
            .from('perfiles')
            .insert(nuevoPerfil)
            .select()
            .single()

          if (insertError) {
            console.error('❌ Error al crear perfil:', insertError)
            setError('No se pudo crear tu perfil')
            setLoading(false)
            return
          }

          console.log('✅ Perfil creado exitosamente:', insertData)
          setPerfil(insertData)
        } else if (perfilError) {
          console.error('❌ Error al obtener perfil:', perfilError)
          setError('Error al cargar tu perfil')
        } else {
          console.log('✅ Perfil encontrado:', perfilData)
          setPerfil(perfilData)
        }
      } catch (error) {
        console.error('❌ Error inesperado:', error)
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-600 font-bold">Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <LogoutButton />
          </div>

          <div className="space-y-6">
            {/* Información del usuario */}
            <div>
              <h2 className="text-xl font-semibold">Información del usuario</h2>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Nombre:</strong> {perfil?.nombre || 'No definido'}</p>
              <p><strong>Plan actual:</strong> {perfil?.plan || 'cliente'}</p>
              <p><strong>Activo:</strong> {perfil?.activo ? '✅ Sí' : '❌ No'}</p>
              <p><strong>Stripe ID:</strong> {perfil?.stripe_customer_id || 'No asociado'}</p>
              <p><strong>Miembro desde:</strong> {perfil?.creado_en ? new Date(perfil.creado_en).toLocaleDateString() : 'Nuevo'}</p>
            </div>

            {/* SECCIÓN DE PLANES CON BOTONES */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Planes disponibles</h3>

              {/* Botón para ir a la página de precios */}
              <div className="mb-6">
                <Link
                  href="/precios"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  📦 Ver todos los planes y suscribirse
                </Link>
              </div>

              
              <Link
                href="/peliculas"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                🎬 Ver películas
              </Link>

              {/* Resumen de planes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className={`border rounded-lg p-4 ${perfil?.plan === 'cliente' ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                  <h4 className="font-bold">Cliente</h4>
                  <p className="text-sm text-gray-600">Contenido básico</p>
                  <p className="text-sm font-bold mt-2">Gratis</p>
                  {perfil?.plan === 'cliente' && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Actual</span>
                  )}
                </div>

                <div className={`border rounded-lg p-4 ${perfil?.plan === 'estandar' ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                  <h4 className="font-bold">Estándar</h4>
                  <p className="text-sm text-gray-600">Más contenido y funciones</p>
                  <p className="text-sm font-bold mt-2">$9.99/mes</p>
                  {perfil?.plan === 'estandar' && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Actual</span>
                  )}
                  {perfil?.plan !== 'estandar' && (
                    <Link
                      href="/precios"
                      className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                    >
                      Suscribirse
                    </Link>
                  )}
                </div>

                <div className={`border rounded-lg p-4 ${perfil?.plan === 'premium' ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                  <h4 className="font-bold">Premium</h4>
                  <p className="text-sm text-gray-600">Todo el contenido + exclusivas</p>
                  <p className="text-sm font-bold mt-2">$19.99/mes</p>
                  {perfil?.plan === 'premium' && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Actual</span>
                  )}
                  {perfil?.plan !== 'premium' && (
                    <Link
                      href="/precios"
                      className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                    >
                      Suscribirse
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}