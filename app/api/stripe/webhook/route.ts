import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Stripe Event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleSuccessfulPayment(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log('Subscription event received (ignored for package logic)')
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const email = session.customer_email || session.metadata?.email
  const pkg = session.metadata?.package

  if (!email || !pkg) {
    console.error('Missing email or package in session metadata')
    return
  }

  console.log(`Payment successful for ${email}, package: ${pkg}`)

  const { error } = await supabaseAdmin
    .from('users')
    .update({ package: pkg })
    .eq('email', email)

  if (error) {
    console.error('Failed to update user package:', error)
  } else {
    console.log(`Successfully upgraded ${email} to ${pkg}`)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const customer = await stripe.customers.retrieve(customerId)
  if (customer.deleted) return

  const email = customer.email
  if (!email) return

  console.log(`Subscription canceled for ${email}, downgrading to go`)

  const { error } = await supabaseAdmin
    .from('users')
    .update({ package: 'go' })
    .eq('email', email)

  if (error) {
    console.error('Failed to downgrade user:', error)
  }
}
