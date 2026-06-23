// src/utils/apipeli.js

export async function consumirApi() {
    try {
        // Usar NEXT_PUBLIC_API_KEY en lugar de API_KEY
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        console.log('🔑 API Key:', apiKey ? '✅ Existe' : '❌ No existe')
        
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`)
        if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json()
        console.log('📦 Películas cargadas:', data.results?.length || 0)
        return data;
    } catch (error) {
        console.error("Error de petición:", error)
        return { results: [] }
    }
}

export async function fetchPeli(idPeli) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const res = await fetch(`https://api.themoviedb.org/3/movie/${idPeli}?api_key=${apiKey}&language=es-ES`)
        if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json()
        console.log('🎬 Detalles de película:', data.title)
        return data;
    } catch (error) {
        console.error("Error de petición:", error)
        return null
    }
}