import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎬 Plataforma de Películas
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Disfruta de las mejores películas con nuestros planes de suscripción
          </p>
          
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Comenzar gratis
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              Iniciar sesión
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-bold">📺 Cliente</h3>
              <p className="text-gray-600">Contenido básico gratuito</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow border-2 border-blue-500">
              <h3 className="text-lg font-bold">⭐ Estándar</h3>
              <p className="text-gray-600">Más contenido y funciones</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-bold">👑 Premium</h3>
              <p className="text-gray-600">Todo el contenido + exclusivas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}