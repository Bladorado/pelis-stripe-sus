// src/app/api/webhook/route.js (versión con logs mejorados)
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('🔵 Webhook: recibida petición')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log('🔵 Webhook: evento verificado:', event.type)
  } catch (error) {
    console.error('❌ Webhook: error de verificación:', error.message)
    return NextResponse.json(
      { error: 'Webhook inválido' },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('🔵 Webhook: sesión completada:', session.id)
        console.log('🔵 Webhook: metadata:', session.metadata)
        
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan

        if (!userId || !plan) {
          console.error('❌ Webhook: faltan datos en metadata')
          return NextResponse.json({ received: true })
        }

        console.log(`🔵 Webhook: actualizando usuario ${userId} a plan ${plan}`)

        const { data, error } = await supabase
          .from('perfiles')
          .update({ 
            plan: plan,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()

        if (error) {
          console.error('❌ Webhook: error al actualizar:', error)
        } else {
          console.log('✅ Webhook: plan actualizado correctamente')
          console.log('✅ Webhook: datos actualizados:', data)
        }
        break
      }

      default:
        console.log(`⚠️ Webhook: evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('❌ Webhook: error general:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}