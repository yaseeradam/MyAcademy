import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import Stripe from 'stripe'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null

// Database connection
async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

// GET /api/payments/verify-stripe - Verify Stripe payment
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId || !stripe) {
      return NextResponse.json({ error: 'Invalid session or Stripe not configured' }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Find the payment record
    const payment = await db.collection('payments').findOne({
      stripeSessionId: sessionId
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Update payment status
    await db.collection('payments').updateOne(
      { id: payment.id },
      {
        $set: {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent,
          completedAt: new Date().toISOString()
        }
      }
    )

    // Update subscription in schools collection
    const plan = await db.collection('subscription_plans').findOne({ id: payment.planId })
    if (plan) {
      const subscriptionEndDate = new Date()
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.duration)

      await db.collection('schools').updateOne(
        { id: payment.schoolId },
        {
          $set: {
            subscriptionStatus: 'active',
            subscriptionPlanId: plan.id,
            subscriptionStartDate: new Date().toISOString(),
            subscriptionEndDate: subscriptionEndDate.toISOString(),
            lastPaymentDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        planName: payment.planName,
        amount: payment.amount,
        currency: payment.currency
      }
    })

  } catch (error) {
    console.error('Stripe verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
