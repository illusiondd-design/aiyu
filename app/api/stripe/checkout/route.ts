import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
apiVersion: '2026-03-25.dahlia',
})

const PRICE_MAP: Record<string, string> = {
  go: process.env.STRIPE_PRICE_GO!,
  pro: process.env.STRIPE_PRICE_PRO!,
  ultra: process.env.STRIPE_PRICE_ULTRA!,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { package: pkg, email, userId } = body

    if (!pkg || !PRICE_MAP[pkg]) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price: PRICE_MAP[pkg],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true`,
      customer_email: email,
      metadata: {
        userId: userId || '',
        email,
        package: pkg,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
