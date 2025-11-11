import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import crypto from 'crypto'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

// Database connection
async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

// POST /api/payments/paystack-webhook - Handle Paystack webhooks
export async function POST(request) {
  try {
    const body = await request.text()
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex')
    const paystackSignature = request.headers.get('x-paystack-signature')

    if (hash !== paystackSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const db = await connectToDatabase()

    // Handle the event
    switch (event.event) {
      case 'charge.success':
        await handlePaystackPaymentSuccess(db, event.data)
        break

      case 'charge.failed':
        await handlePaystackPaymentFailure(db, event.data)
        break

      default:
        console.log(`Unhandled Paystack event type ${event.event}`)
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Error processing Paystack webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle successful Paystack payment
async function handlePaystackPaymentSuccess(db, data) {
  const { reference, metadata } = data
  const { paymentId, schoolId, planId } = metadata

  // Update payment status
  await db.collection('payments').updateOne(
    { id: paymentId },
    {
      $set: {
        status: 'completed',
        paystackReference: reference,
        completedAt: new Date().toISOString(),
        transactionId: data.id,
        paystackData: data
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

  console.log(`Paystack payment ${paymentId} completed successfully`)
}

// Handle failed Paystack payment
async function handlePaystackPaymentFailure(db, data) {
  const { reference, metadata } = data
  const { paymentId } = metadata

  // Update payment status
  await db.collection('payments').updateOne(
    { id: paymentId },
    {
      $set: {
        status: 'failed',
        paystackReference: reference,
        failedAt: new Date().toISOString(),
        failureReason: data.gateway_response || 'Payment failed',
        paystackData: data
      }
    }
  )

  console.log(`Paystack payment ${paymentId} failed`)
}
