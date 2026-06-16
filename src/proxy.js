// src/proxy.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Rutas públicas
const PUBLIC_ROUTES = ['/', '/login', '/register','/precios']

// Rutas por plan
const RUTAS_POR_PLAN = [
  { path: '/admin', planes: ['admin'] },
  { path: '/premium', planes: ['premium', 'admin'] },
  { path: '/estandar', planes: ['estandar', 'premium', 'admin'] },
  { path: '/dashboard', planes: ['cliente', 'estandar', 'premium', 'admin'] }
]

function crearClienteSupabase(request, responseCallback) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          const response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => 
            response.cookies.set(name, value, options)
          )
          responseCallback(response)
        },
      },
    }
  )
}

// ✅ EXPORTAR COMO PROXY (no como middleware)
export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })
  
  const supabase = crearClienteSupabase(request, (res) => {
    supabaseResponse = res
  })

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. Usuario logueado en login/register → redirigir a dashboard
  if (user && ['/login', '/register'].includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. Usuario NO logueado en ruta protegida → redirigir a login
  const esRutaPublica = PUBLIC_ROUTES.some(ruta => path === ruta || path.startsWith(ruta + '/'))
  
  if (!user && !esRutaPublica) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Verificar plan del usuario
  if (user) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const planUsuario = perfil?.plan || 'cliente'

    const rutaRestringida = RUTAS_POR_PLAN.find(ruta => 
      path === ruta.path || path.startsWith(ruta.path + '/')
    )

    if (rutaRestringida && !rutaRestringida.planes.includes(planUsuario)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

// Configuración del proxy
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
  ],
}