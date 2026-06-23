// src/app/api/webhook/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-05-27.dahlia',
})

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log(`🔵 [WEBHOOK] Evento recibido: ${event.type}`)
  } catch (error) {
    console.error('❌ [WEBHOOK] Error de verificación:', error.message)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let userId = null
    let plan = null

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        userId = session.metadata?.userId
        plan = session.metadata?.plan
        console.log(`🔵 [WEBHOOK] checkout.session.completed - userId: ${userId}, plan: ${plan}`)
        break
      }

      case 'invoice.paid': {
        // Manejar invoice.paid
        const invoice = event.data.object
        const customerId = invoice.customer
        
        // Buscar el perfil por stripe_customer_id
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        
        if (perfil) {
          userId = perfil.id
          // Obtener el plan de la factura
          const subscriptionId = invoice.subscription
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const priceId = subscription.items.data[0]?.price?.id
            if (priceId) {
              if (priceId === process.env.NEXT_PUBLIC_STANDARD_PRICE_ID) {
                plan = 'estandar'
              } else if (priceId === process.env.NEXT_PUBLIC_PREMIUM_PRICE_ID) {
                plan = 'premium'
              }
            }
          }
        }
        break
      }

      default:
        console.log(`⚠️ [WEBHOOK] Evento no manejado: ${event.type}`)
        return NextResponse.json({ received: true })
    }

    if (userId && plan) {
      console.log(`🔵 [WEBHOOK] Actualizando usuario ${userId} a plan ${plan}`)
      
      // 🔴 IMPORTANTE: Quitar 'updated_at' si no existe en la tabla
      const { data, error } = await supabase
        .from('perfiles')
        .update({
          plan: plan
          // updated_at: new Date().toISOString()  // ← ELIMINADO
        })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('❌ [WEBHOOK] Error al actualizar:', error)
      } else {
        console.log('✅ [WEBHOOK] Plan actualizado correctamente')
        console.log('✅ [WEBHOOK] Datos actualizados:', data)
      }
    } else {
      console.warn('⚠️ [WEBHOOK] No se pudo determinar userId o plan')
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Error general:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}