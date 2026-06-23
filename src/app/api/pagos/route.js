// src/app/api/pagos/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-05-27.dahlia', // ← Actualizar
})

export async function POST(request) {
  try {
    const { priceId, userId, email } = await request.json()

    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase con ANON KEY (más simple)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.SUPABASE_SERVICE_ROLE_KEY  
    )

    // Buscar stripe_customer_id
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (perfilError) {
      console.error('Error al buscar perfil:', perfilError)
    }

    let customerId = perfil?.stripe_customer_id

    // Si no tiene customer_id, crear uno
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId
        }
      })
      customerId = customer.id

      await supabase
        .from('perfiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        userId: userId,
        plan: priceId === process.env.NEXT_PUBLIC_STANDARD_PRICE_ID ? 'estandar' : 'premium'
      }
    })

    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}