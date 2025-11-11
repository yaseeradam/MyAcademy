import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import Stripe from 'stripe'
import crypto from 'crypto'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null

// Database connection
async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

// POST /api/payments/webhook - Handle Stripe webhooks
export async function POST(request) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    let event

    try {
      event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        await handlePaymentSuccess(db, paymentIntent)
        break

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object
        await handlePaymentFailure(db, failedPaymentIntent)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle successful payment
async function handlePaymentSuccess(db, paymentIntent) {
  const { paymentId, schoolId, planId } = paymentIntent.metadata

  // Update payment status
  await db.collection('payments').updateOne(
    { id: paymentId },
    {
      $set: {
        status: 'completed',
        stripePaymentIntentId: paymentIntent.id,
        completedAt: new Date().toISOString(),
        transactionId: paymentIntent.id
      }
    }
  )

  // Update school subscription
  const plan = await db.collection('subscription_plans').findOne({ id: planId })
  if (plan) {
    const subscriptionEnd = new Date()
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (plan.duration || 1))

    await db.collection('schools').updateOne(
      { id: schoolId },
      {
        $set: {
          subscriptionStatus: 'active',
          subscriptionPlanId: planId,
          subscriptionStartDate: new Date().toISOString(),
          subscriptionEndDate: subscriptionEnd.toISOString(),
          lastPaymentDate: new Date().toISOString(),
          accountFrozen: false
        }
      }
    )
  }

  console.log(`Payment ${paymentId} completed successfully`)
}

// Handle failed payment
async function handlePaymentFailure(db, paymentIntent) {
  const { paymentId } = paymentIntent.metadata

  // Update payment status
  await db.collection('payments').updateOne(
    { id: paymentId },
    {
      $set: {
        status: 'failed',
        stripePaymentIntentId: paymentIntent.id,
        failedAt: new Date().toISOString(),
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      }
    }
  )

  console.log(`Payment ${paymentId} failed`)
}
