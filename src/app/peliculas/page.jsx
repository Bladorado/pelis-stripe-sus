'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { consumirApi, fetchPeli } from '@/utils/apipeli'

export default function PeliculasPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [peliculas, setPeliculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener usuario
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        // 2. Obtener perfil (plan del usuario)
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (perfilError) {
          console.error('Error al obtener perfil:', perfilError)
          setError('Error al cargar tu perfil')
          setLoading(false)
          return
        }


        setPerfil(perfilData)
        console.log('📌 Plan del usuario:', perfilData.plan)

        // 3. Obtener películas según el plan
        await cargarPeliculas(perfilData.plan)

      } catch (error) {
        console.error('Error:', error)
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  const cargarPeliculas = async (plan) => {
    try {
      // Obtener películas populares (para todos los planes)
      const data = await consumirApi()
      
      if (data && data.results) {
        let peliculasFiltradas = data.results

        // Filtrar según el plan
        if (plan === 'cliente') {
          // Cliente: solo primeras 10 películas
          peliculasFiltradas = data.results.slice(0, 10)
        } else if (plan === 'estandar') {
          // Estándar: primeras 20 películas + más información
          peliculasFiltradas = data.results.slice(0, 20)
          // Agregar más detalles (simulado)
          peliculasFiltradas = peliculasFiltradas.map(peli => ({
            ...peli,
            masDetalles: true,
            sinAnuncios: true
          }))
        } else if (plan === 'premium') {
          // Premium: todas las películas + contenido exclusivo
          peliculasFiltradas = data.results.map(peli => ({
            ...peli,
            masDetalles: true,
            sinAnuncios: true,
            contenidoExclusivo: true,
            calidad4k: true
          }))
        }

        setPeliculas(peliculasFiltradas)
        console.log(`🎬 Mostrando ${peliculasFiltradas.length} películas para plan: ${plan}`)
      }
    } catch (error) {
      console.error('Error al cargar películas:', error)
      setError('Error al cargar las películas')
    }
  }

  const verDetalles = async (idPeli) => {
    try {
      const data = await fetchPeli(idPeli)
      setPeliculaSeleccionada(data)
    } catch (error) {
      console.error('Error al obtener detalles:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando películas...</div>
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
        {/* Header con información del plan */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🎬 Películas</h1>
              <p className="text-gray-600">
                Plan actual: <span className="font-bold capitalize">{perfil?.plan || 'cliente'}</span>
              </p>
            </div>
            <Link
              href="/precios"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Cambiar plan
            </Link>
          </div>

          {/* Mostrar características según el plan */}
          <div className="mt-4 flex flex-wrap gap-2">
            {perfil?.plan === 'cliente' && (
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                📺 Contenido básico
              </span>
            )}
            {perfil?.plan === 'estandar' && (
              <>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  🎥 Más películas
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  🚫 Sin anuncios
                </span>
              </>
            )}
            {perfil?.plan === 'premium' && (
              <>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  🎥 Todas las películas
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  🚫 Sin anuncios
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  ⭐ Contenido exclusivo
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  📺 4K Ultra HD
                </span>
              </>
            )}
          </div>
        </div>

        {/* Grid de películas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {peliculas.map((pelicula) => (
            <div
              key={pelicula.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => verDetalles(pelicula.id)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`}
                alt={pelicula.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-poster.jpg'
                }}
              />
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{pelicula.title}</h3>
                <p className="text-xs text-gray-500">
                  ⭐ {pelicula.vote_average?.toFixed(1) || 'N/A'}
                </p>
                
                {/* Badges según el plan */}
                {pelicula.sinAnuncios && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                    Sin anuncios
                  </span>
                )}
                {pelicula.contenidoExclusivo && (
                  <span className="inline-block mt-1 ml-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                    ⭐ Exclusivo
                  </span>
                )}
                {pelicula.calidad4k && (
                  <span className="inline-block mt-1 ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                    4K
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {peliculas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay películas disponibles para tu plan</p>
          </div>
        )}
      </div>

      {/* Modal de detalles (opcional) */}
      {peliculaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{peliculaSeleccionada.title}</h2>
              <button
                onClick={() => setPeliculaSeleccionada(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <img
              src={`https://image.tmdb.org/t/p/w500${peliculaSeleccionada.poster_path}`}
              alt={peliculaSeleccionada.title}
              className="w-full h-64 object-cover rounded mb-4"
              onError={(e) => {
                e.target.src = '/placeholder-poster.jpg'
              }}
            />
            <p className="text-gray-700 mb-4">{peliculaSeleccionada.overview}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>⭐ Puntuación:</strong> {peliculaSeleccionada.vote_average?.toFixed(1) || 'N/A'}</p>
              <p><strong>📅 Fecha:</strong> {peliculaSeleccionada.release_date || 'N/A'}</p>
              <p><strong>🎬 Géneros:</strong> {peliculaSeleccionada.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
              <p><strong>⏱️ Duración:</strong> {peliculaSeleccionada.runtime ? `${peliculaSeleccionada.runtime} min` : 'N/A'}</p>
            </div>
            <button
              onClick={() => setPeliculaSeleccionada(null)}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}